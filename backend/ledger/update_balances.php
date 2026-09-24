<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id =$data['user_id'] ?? null;
$cash =$data['cash_opening'] ?? 0;
$bank =$data['bank_opening'] ?? 0;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "User ID required"]);
    exit();
}

try {
    $query = "INSERT INTO user_balances (user_id, cash_opening, bank_opening) 
              VALUES (:user_id, :cash, :bank) 
              ON DUPLICATE KEY UPDATE cash_opening = :cash, bank_opening = :bank";
    
    $stmt =$conn->prepare($query);$stmt->execute([
        ':user_id' => $user_id,
        ':cash' => $cash,
        ':bank' => $bank
    ]);

    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Balances updated"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>