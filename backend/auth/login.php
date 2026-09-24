<?php
// backend/login.php
require_once '../core/config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

// Read raw JSON sent by React
$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email and password are required."]);
    exit();
}

try {
    // Look up user by email
    $query = "SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    // Verify user existence and password hash
    if ($user && password_verify($password, $user['password'])) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Login successful.",
            "user" => [
                "id"    => $user['id'],
                "name"  => $user['name'],
                "email" => $user['email']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>