<?php
require_once '../core/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = $_GET['user_id'] ?? $input['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit();
}

try {
    // 1. Fetch all cycles for this user, ordered by id DESC
    $stmt = $conn->prepare("SELECT * FROM savings_cycles WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute([$user_id]);
    $cycles = $stmt->fetchAll();

    // 2. Calculate lifetime total saved for completed cycles
    $totalStmt = $conn->prepare("
        SELECT COALESCE(SUM(final_saved_amount), 0) as lifetime_total
        FROM savings_cycles
        WHERE user_id = ? AND status = 'completed'
    ");
    $totalStmt->execute([$user_id]);
    $totalRow = $totalStmt->fetch();
    $lifetime_total = (float) ($totalRow['lifetime_total'] ?? 0.00);

    echo json_encode([
        "status" => "success",
        "data" => [
            "cycles" => $cycles,
            "lifetime_total" => $lifetime_total
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
