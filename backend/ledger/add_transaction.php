<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$amount = $data['amount'] ?? 0;
$particular = trim($data['particular'] ?? '');
$entry_type = $data['entry_type'] ?? ''; // 'credit' or 'debit'
$account_type = $data['account_type'] ?? ''; // 'cash' or 'bank'
$transaction_date = $data['transaction_date'] ?? date('Y-m-d');

// Basic validation
if (!$user_id || $amount <= 0 || empty($particular) || empty($entry_type) || empty($account_type)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

try {
    $query = "INSERT INTO transactions (user_id, amount, particular, entry_type, account_type, transaction_date) 
              VALUES (:user_id, :amount, :particular, :entry_type, :account_type, :transaction_date)";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':user_id' => $user_id,
        ':amount' => $amount,
        ':particular' => $particular,
        ':entry_type' => $entry_type,
        ':account_type' => $account_type,
        ':transaction_date' => $transaction_date
    ]);

    http_response_code(201);
    echo json_encode(["status" => "success", "message" => "Transaction added successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>