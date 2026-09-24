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

if (!$user_id) {
    http_response_code(400);
    exit();
}

try {
    // ==============================================================================
    // LAZY EVALUATION ENGINE: Auto-clear settlements if target_date has arrived
    // ==============================================================================
    $conn->beginTransaction();
    
    // 1. Copy due settlements to live transactions
    $autoClearStmt = $conn->prepare("
        INSERT INTO transactions (user_id, amount, particular, entry_type, account_type, transaction_date)
        SELECT user_id, amount, particular, entry_type, account_type, target_date 
        FROM settlements 
        WHERE user_id = :user_id AND status = 'pending' AND target_date <= CURDATE()
    ");
    $autoClearStmt->execute([':user_id' => $user_id]);

    // 2. Mark them as cleared
    $updateClearedStmt = $conn->prepare("
        UPDATE settlements 
        SET status = 'cleared' 
        WHERE user_id = :user_id AND status = 'pending' AND target_date <= CURDATE()
    ");
    $updateClearedStmt->execute([':user_id' => $user_id]);
    
    $conn->commit();
    // ==============================================================================

    // 1. Get the starting balances
    $stmt = $conn->prepare("SELECT cash_opening, bank_opening FROM user_balances WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([':user_id' => $user_id]);
    $balances = $stmt->fetch();

    if ($balances) {
        $cash_current = (float)$balances['cash_opening'];
        $bank_current = (float)$balances['bank_opening'];

        // 2. Fetch all LIVE transaction totals grouped by type and account
        $trans_stmt = $conn->prepare("SELECT account_type, entry_type, SUM(amount) as total FROM transactions WHERE user_id = :user_id GROUP BY account_type, entry_type");
        $trans_stmt->execute([':user_id' => $user_id]);
        $transactions = $trans_stmt->fetchAll();

        // 3. Dynamically calculate the real-time LIVE balances
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

        // 4. Fetch all PENDING settlements to calculate projected wealth
        $cash_projected = $cash_current;
        $bank_projected = $bank_current;

        $pending_stmt = $conn->prepare("SELECT account_type, entry_type, SUM(amount) as total FROM settlements WHERE user_id = :user_id AND status = 'pending' GROUP BY account_type, entry_type");
        $pending_stmt->execute([':user_id' => $user_id]);
        $pending_settlements = $pending_stmt->fetchAll();

        foreach ($pending_settlements as $p) {
            $amount = (float)$p['total'];
            if ($p['account_type'] === 'cash') {
                if ($p['entry_type'] === 'credit') $cash_projected += $amount; // Money coming in
                if ($p['entry_type'] === 'debit')  $cash_projected -= $amount; // Money going out
            } elseif ($p['account_type'] === 'bank') {
                if ($p['entry_type'] === 'credit') $bank_projected += $amount;
                if ($p['entry_type'] === 'debit')  $bank_projected -= $amount;
            }
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "has_balances" => true,
            "live" => [
                "total" => $cash_current + $bank_current,
                "cash" => $cash_current,
                "bank" => $bank_current
            ],
            "projected" => [
                "total" => $cash_projected + $bank_projected,
                "cash" => $cash_projected,
                "bank" => $bank_projected
            ]
        ]);
    } else {
        http_response_code(200);
        echo json_encode(["status" => "success", "has_balances" => false]);
    }
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>