<?php
include 'db.php';

if (!$conn) {
    die("❌ فشل الاتصال بقاعدة البيانات.");
}

$sql = "SELECT * FROM users";
$result = $conn->query($sql);

if (!$result) {
    die("❌ خطأ في جلب البيانات: " . $conn->error);
}

echo "<h2>قائمة المستخدمين المسجلين:</h2>";

if ($result->num_rows > 0) {
    echo "<ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>👤 الاسم: " . htmlspecialchars($row["name"]) . " - 📧 البريد الإلكتروني: " . htmlspecialchars($row["email"]) . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p>🚨 لا يوجد مستخدمون مسجلون حتى الآن.</p>";
}

$conn->close();
?>