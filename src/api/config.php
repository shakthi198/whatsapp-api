<?php
header("Content-Type: application/json");

// $servername = "localhost";
// $username = "root";
// $password = "";
// $dbname = "whatsapp_management";

$servername = "srv945.hstgr.io";
$username = "u831820240_elcwhatsapp";
$password = "Elc@150901";
$dbname = "u831820240_elcwhatsapp";

$jwt_secret = "qwerty1234qwerty";
$jwt_algorithm = 'HS256';


$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
?>