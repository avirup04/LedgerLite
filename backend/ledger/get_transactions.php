<?php
require_once '../core/config.php';

// Handle CORS Preflight (OPTIONS request)
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
$filter = $data['filter'] ?? 'month';
$custom_date = $data['custom_date'] ?? null;

if (!$user_id) {
    http_response_code(400);
    exit();
}

try {
    $query = "SELECT * FROM transactions WHERE user_id = :user_id";
    $params = [':user_id' => $user_id];

    if ($filter === 'today') {
        $query .= " AND transaction_date = CURDATE()";
    } elseif ($filter === 'week') {
        $query .= " AND YEARWEEK(transaction_date, 1) = YEARWEEK(CURDATE(), 1)";
    } elseif ($filter === 'month') {
        $query .= " AND MONTH(transaction_date) = MONTH(CURDATE()) AND YEAR(transaction_date) = YEAR(CURDATE())";
    } elseif ($filter === 'custom' && $custom_date) {
        $query .= " AND transaction_date = :custom_date";
        $params[':custom_date'] = $custom_date;
    }

    $query .= " ORDER BY transaction_date DESC, created_at DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $transactions = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "transactions" => $transactions
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>