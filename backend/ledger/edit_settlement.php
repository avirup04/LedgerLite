<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../core/config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (
        !isset($input['id']) ||
        !isset($input['user_id']) ||
        !isset($input['amount']) ||
        !isset($input['particular']) ||
        !isset($input['entry_type']) ||
        !isset($input['account_type']) ||
        !isset($input['target_date'])
    ) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required fields'
        ]);
        exit;
    }

    $id = intval($input['id']);
    $user_id = intval($input['user_id']);
    $amount = floatval($input['amount']);
    $particular = trim($input['particular']);
    $entry_type = trim($input['entry_type']);
    $account_type = trim($input['account_type']);
    $target_date = trim($input['target_date']);

    // Validate entry_type
    if (!in_array($entry_type, ['credit', 'debit'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid entry type'
        ]);
        exit;
    }

    // Validate account_type
    if (!in_array($account_type, ['bank', 'cash'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid account type'
        ]);
        exit;
    }

    // Update settlement
    $stmt = $conn->prepare("
        UPDATE settlements
        SET amount = ?,
            particular = ?,
            entry_type = ?,
            account_type = ?,
            target_date = ?
        WHERE id = ? AND user_id = ?
    ");

    $stmt->execute([
        $amount,
        $particular,
        $entry_type,
        $account_type,
        $target_date,
        $id,
        $user_id
    ]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Settlement updated successfully'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Settlement not found or no changes made'
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>