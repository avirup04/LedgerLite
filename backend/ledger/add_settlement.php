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
$amount = $data['amount'] ?? 0;
$particular = $data['particular'] ?? '';
$entry_type = $data['entry_type'] ?? '';
$account_type = $data['account_type'] ?? '';
$target_date = $data['target_date'] ?? '';

if (!$user_id || !$amount || !$particular || !$entry_type || !$account_type || !$target_date) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

try {
    $stmt = $conn->prepare("INSERT INTO settlements (user_id, amount, particular, entry_type, account_type, target_date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $amount, $particular, $entry_type, $account_type, $target_date]);
    
    echo json_encode(["status" => "success", "message" => "Settlement scheduled successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>