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
    // 1. Find the currently active savings goal
    $stmt = $conn->prepare("SELECT * FROM savings_cycles WHERE user_id = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$user_id]);
    $cycle = $stmt->fetch();

    if (!$cycle) {
        // No active cycle found, return null data so the frontend knows to show the Starter Form
        echo json_encode(["status" => "success", "data" => null]);
        exit();
    }

    // 2. Calculate actual expenses during this specific time window
    // Assuming your transactions table uses 'type' = 'Debit' for expenses and has a 'date' column
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