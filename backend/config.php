<?php
require_once 'headers.php';

$host = "localhost";
$db_name = "ledgerlite";
$username = "root";
$password = "";

try {
    // Using string interpolation (curly braces) prevents quote/dot typos
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Database connection failed: " . $exception->getMessage()
    ]);
    exit();
}
?>