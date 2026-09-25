<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit();
}

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "User ID is required"]);
    exit();
}

try {
    // ==========================================
    // NEW LOGIC: AUTO-CLOSE EXPIRED CYCLES
    // ==========================================
    // Check if there is an active cycle that has passed its end date
    $checkStmt = $conn->prepare("SELECT * FROM savings_cycles WHERE user_id = ? AND status = 'active' AND end_date < CURRENT_DATE()");
    $checkStmt->execute([$user_id]);
    $expiredCycle = $checkStmt->fetch();

    if ($expiredCycle) {
        // Calculate total spent during this expired cycle's exact timeframe
        $expStmt = $conn->prepare("
            SELECT COALESCE(SUM(amount), 0) as total_spent 
            FROM transactions 
            WHERE user_id = ? AND entry_type = 'debit' AND transaction_date >= ? AND transaction_date <= ?
        ");
        $expStmt->execute([$user_id, $expiredCycle['start_date'], $expiredCycle['end_date']]);
        $total_spent = (float) $expStmt->fetch()['total_spent'];

        // Calculate final savings
        $final_saved = (float)$expiredCycle['total_income'] - $total_spent;

        // Force close it in the database
        $closeStmt = $conn->prepare("
            UPDATE savings_cycles 
            SET status = 'completed', actual_end_date = CURRENT_DATE(), final_saved_amount = ? 
            WHERE id = ?
        ");
        $closeStmt->execute([$final_saved, $expiredCycle['id']]);
    }
    // ==========================================

    // 1. Find the currently active savings goal
    $stmt = $conn->prepare("SELECT * FROM savings_cycles WHERE user_id = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$user_id]);
    $cycle = $stmt->fetch();

    if (!$cycle) {
        // No active cycle found (or it was just auto-closed above)
        echo json_encode(["status" => "success", "data" => null]);
        exit();
    }

    // 2. Calculate actual expenses during this specific time window
    $expStmt = $conn->prepare("
        SELECT COALESCE(SUM(amount), 0) as total_spent 
        FROM transactions 
        WHERE user_id = ? AND entry_type = 'debit' AND transaction_date >= ? AND transaction_date <= ?
    ");
    $expStmt->execute([$user_id, $cycle['start_date'], $cycle['end_date']]);
    $expenseRow = $expStmt->fetch();
    $total_spent = (float) $expenseRow['total_spent'];

    // 3. Calculate remaining spendable limit
    $spendable_limit = (float) $cycle['spendable_limit'];
    $remaining_spendable = $spendable_limit - $total_spent;

    echo json_encode([
        "status" => "success",
        "data" => [
            "cycle" => $cycle,
            "total_spent" => $total_spent,
            "remaining_spendable" => $remaining_spendable
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>