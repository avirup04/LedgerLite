<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    exit();
}

try {
    // 1. Get the starting balances
    $stmt = $conn->prepare("SELECT cash_opening, bank_opening FROM user_balances WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([':user_id' => $user_id]);
    $balances = $stmt->fetch();

    if ($balances) {
        $cash_current = (float)$balances['cash_opening'];
        $bank_current = (float)$balances['bank_opening'];

        // 2. Fetch all transaction totals grouped by type and account
        $trans_stmt = $conn->prepare("SELECT account_type, entry_type, SUM(amount) as total FROM transactions WHERE user_id = :user_id GROUP BY account_type, entry_type");
        $trans_stmt->execute([':user_id' => $user_id]);
        $transactions = $trans_stmt->fetchAll();

        // 3. Dynamically calculate the real-time balances
        foreach ($transactions as $t) {
            $amount = (float)$t['total'];
            if ($t['account_type'] === 'cash') {
                if ($t['entry_type'] === 'credit') $cash_current += $amount;
                if ($t['entry_type'] === 'debit')  $cash_current -= $amount;
            } elseif ($t['account_type'] === 'bank') {
                if ($t['entry_type'] === 'credit') $bank_current += $amount;
                if ($t['entry_type'] === 'debit')  $bank_current -= $amount;
            }
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "has_balances" => true,
            "balances" => [
                "cash" => $cash_current,
                "bank" => $bank_current
            ]
        ]);
    } else {
        http_response_code(200);
        echo json_encode(["status" => "success", "has_balances" => false]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>