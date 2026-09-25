<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$start_date = $data['start_date'] ?? null;
$end_date = $data['end_date'] ?? null;
$total_income = $data['total_income'] ?? null;
$target_savings = $data['target_savings'] ?? null;

if (!$user_id || !$start_date || !$end_date || $total_income === null || $target_savings === null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

// Calculate the spendable limit on the backend
$spendable_limit = $total_income - $target_savings;

try {
    // Start a transaction so both queries succeed or fail together
    $conn->beginTransaction();

    // 1. Auto-complete any existing active cycles for this user
    $updateStmt = $conn->prepare("UPDATE savings_cycles SET status = 'completed' WHERE user_id = ? AND status = 'active'");
    $updateStmt->execute([$user_id]);

    // 2. Insert the new cycle
    $insertStmt = $conn->prepare("
        INSERT INTO savings_cycles (user_id, start_date, end_date, total_income, target_savings, spendable_limit, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
    ");
    $insertStmt->execute([$user_id, $start_date, $end_date, $total_income, $target_savings, $spendable_limit]);

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Savings cycle started successfully"]);
    
} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>