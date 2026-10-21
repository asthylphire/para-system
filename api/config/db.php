<?php
$host     = getenv('DB_HOST') ?: '127.0.0.1';
$user     = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$database = getenv('DB_NAME') ?: 'para_db';
$port     = (int)(getenv('DB_PORT') ?: 3306);

$conn = new mysqli($host, $user, $password, $database, $port);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>