<?php

$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "sat7a_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("❌ فشل الاتصال بقاعدة البيانات: " . $conn->connect_error);
} else {
    echo "✅ تم الاتصال بقاعدة البيانات بنجاح";
}






?>