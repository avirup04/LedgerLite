<?php
// backend/register.php
require_once '../core/config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

// Read raw JSON sent by React fetch/axios
$data = json_decode(file_get_contents("php://input"), true);

$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// Basic validation
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please fill in all fields."]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

try {
    // 1. Check if the email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute([':email' => $email]);

    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Email already registered."]);
        exit();
    }

    // 2. Hash the password securely
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // 3. Insert user into the database
    $insertQuery = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
    $insertStmt = $conn->prepare($insertQuery);
    $insertStmt->execute([
        ':name'     => $name,
        ':email'    => $email,
        ':password' => $hashedPassword
    ]);

    $newUserId = $conn->lastInsertId();

    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Registration successful.",
        "user" => [
            "id"    => $newUserId,
            "name"  => $name,
            "email" => $email
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>