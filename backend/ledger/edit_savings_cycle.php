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
$new_income = $data['new_income'] ?? null;
$new_target = $data['new_target'] ?? null;

if (!$cycle_id || !$user_id || $new_income === null || $new_target === null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$spendable_limit = (float) $new_income - (float) $new_target;

try {
    $stmt = $conn->prepare("
        UPDATE savings_cycles
        SET total_income = ?, target_savings = ?, spendable_limit = ?
        WHERE id = ? AND user_id = ? AND status = 'active'
    ");
    $stmt->execute([$new_income, $new_target, $spendable_limit, $cycle_id, $user_id]);

    if ($stmt->rowCount() === 0) {
        // Check if cycle exists but wasn't active or wasn't changed
        $checkStmt = $conn->prepare("SELECT id, status FROM savings_cycles WHERE id = ? AND user_id = ?");
        $checkStmt->execute([$cycle_id, $user_id]);
        $existing = $checkStmt->fetch();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Cycle not found"]);
            exit();
        } elseif ($existing['status'] !== 'active') {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Only active cycles can be edited"]);
            exit();
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Savings cycle updated successfully",
        "data" => [
            "cycle_id" => $cycle_id,
            "total_income" => (float) $new_income,
            "target_savings" => (float) $new_target,
            "spendable_limit" => $spendable_limit
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
