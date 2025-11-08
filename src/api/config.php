<?php
header("Content-Type: application/json");

// $servername = "localhost";
// $username = "root";
// $password = "";
// $dbname = "whatsapp";

$servername = "srv945.hstgr.io";
$username = "u831820240_elcwhatsapp";
$password = "Elc@150901";
$dbname = "u831820240_elcwhatsapp";

$jwt_secret = "qwerty1234qwerty";
$jwt_algorithm = 'HS256';

define('META_BASE_URL', 'https://graph.facebook.com/v17.0');
define('META_PHONE_NUMBER_ID', '779927621877990');
define('META_ACCESS_TOKEN', 'EAAS5pfUImY8BP5O3FBB29OMoPH5WN0PYZA2w3solvr1sAv1rfHAuHZBB5ZCggE9Jv299otBO1lJIyfSePIB9YevXTnBp724B6ZC1nfGWbWmNWoJbXbdmg6YYW3DSwdIjQ583GOgWh75ZCyB6StOcSsoQp6S5dQthNBytZCviE2O5mwgBrEOT8C5InZC6ZBtnwRU8JgL842ZCpMDhZAwpOakMvyfth3OYDRo35oLNLxaxEjTMvR3tZAh47AwnZAyzI9N7w15nZBwTXZA8cHc1yn9mWxaP5DBHwE');
define('META_WABA_ID', '1354293032712286');

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
?>