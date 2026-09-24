<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "User ID required"]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT cash_opening, bank_opening FROM user_balances WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([':user_id' => $user_id]);
    $balances = $stmt->fetch();

    if ($balances) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "has_balances" => true,
            "balances" => [
                "cash" => (float)$balances['cash_opening'],
                "bank" => (float)$balances['bank_opening']
            ]
        ]);
    } else {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "has_balances" => false
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>