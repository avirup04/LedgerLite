<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$cycle_id = $data['cycle_id'] ?? null;
$user_id = $data['user_id'] ?? null;

if (!$cycle_id || !$user_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing cycle_id or user_id"]);
    exit();
}

try {
    // 1. Fetch the cycle to get start_date, end_date, and total_income
    $stmt = $conn->prepare("SELECT * FROM savings_cycles WHERE id = ? AND user_id = ?");
    $stmt->execute([$cycle_id, $user_id]);
    $cycle = $stmt->fetch();

    if (!$cycle) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Cycle not found"]);
        exit();
    }

    // 2. Query transactions to calculate total_spent (debit entries) in cycle window
    $expStmt = $conn->prepare("
        SELECT COALESCE(SUM(amount), 0) as total_spent
        FROM transactions
        WHERE user_id = ? AND entry_type = 'debit' AND transaction_date >= ? AND transaction_date <= ?
    ");
    $expStmt->execute([$user_id, $cycle['start_date'], $cycle['end_date']]);
    $expenseRow = $expStmt->fetch();
    $total_spent = (float) $expenseRow['total_spent'];

    // 3. Calculate final savings (allowing negative numbers for deficits)
    $total_income = (float) $cycle['total_income'];
    $final_saved_amount = $total_income - $total_spent;

    // 4. Update the cycle status to completed, record actual_end_date and final_saved_amount
    $updateStmt = $conn->prepare("
        UPDATE savings_cycles
        SET status = 'completed',
            actual_end_date = CURRENT_DATE(),
            final_saved_amount = ?
        WHERE id = ? AND user_id = ?
    ");
    $updateStmt->execute([$final_saved_amount, $cycle_id, $user_id]);

    echo json_encode([
        "status" => "success",
        "message" => "Savings cycle ended successfully",
        "data" => [
            "cycle_id" => $cycle_id,
            "final_saved_amount" => $final_saved_amount,
            "total_spent" => $total_spent
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
