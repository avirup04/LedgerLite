<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit();
}

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "User ID required"]);
    exit();
}

try {
    // Fetch last 7 days of debit transactions
    $stmt = $conn->prepare("
        SELECT DATE(transaction_date) as date, SUM(amount) as daily_total
        FROM transactions
        WHERE user_id = ? AND entry_type = 'debit' AND transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
        GROUP BY DATE(transaction_date)
        ORDER BY date ASC
    ");
    $stmt->execute([$user_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Map database results
    $dbData = [];
    foreach ($results as $row) {
        $dbData[$row['date']] = (float)$row['daily_total'];
    }

    // Backfill missing days with 0 to ensure exactly 7 data points
    $sparkline = [];
    for ($i = 6; $i >= 0; $i--) {
        $dateStr = date('Y-m-d', strtotime("-$i days"));
        $dayLabel = date('D', strtotime("-$i days")); // e.g., 'Mon', 'Tue'
        $sparkline[] = [
            "date" => $dateStr,
            "day" => $dayLabel,
            "amount" => $dbData[$dateStr] ?? 0
        ];
    }

    echo json_encode(["status" => "success", "data" => $sparkline]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>