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
    // Only fetch pending items, sorted with the closest dates first
    $stmt = $conn->prepare("SELECT * FROM settlements WHERE user_id = ? AND status = 'pending' ORDER BY target_date ASC");
    $stmt->execute([$user_id]);
    $settlements = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "settlements" => $settlements
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>