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
$settlement_id = $data['settlement_id'] ?? null;
$user_id = $data['user_id'] ?? null;

if (!$settlement_id || !$user_id) {
    http_response_code(400);
    exit();
}

try {
    $conn->beginTransaction();

    // 1. Get the pending settlement data
    $stmt = $conn->prepare("SELECT * FROM settlements WHERE id = ? AND user_id = ? AND status = 'pending'");
    $stmt->execute([$settlement_id, $user_id]);
    $settlement = $stmt->fetch();

    if (!$settlement) {
        throw new Exception("Settlement not found or already cleared.");
    }

    // 2. Insert into live transactions using TODAY's date (CURDATE)
    $insertStmt = $conn->prepare("INSERT INTO transactions (user_id, amount, particular, entry_type, account_type, transaction_date) VALUES (?, ?, ?, ?, ?, CURDATE())");
    $insertStmt->execute([
        $user_id, 
        $settlement['amount'], 
        $settlement['particular'], 
        $settlement['entry_type'], 
        $settlement['account_type']
    ]);

    // 3. Mark the settlement as cleared so it disappears from the pending list
    $updateStmt = $conn->prepare("UPDATE settlements SET status = 'cleared' WHERE id = ?");
    $updateStmt->execute([$settlement_id]);

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Settlement cleared and moved to ledger."]);
} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>