<?php
include 'db.php';

$sql = "SELECT * FROM orders"; // استعلام جلب جميع الطلبات
$result = $conn->query($sql);

if (!$result) {
    die("❌ خطأ في جلب البيانات: " . $conn->error);
}

echo "<h2>طلبات العملاء:</h2>";

if ($result->num_rows > 0) {
    echo "<ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>🚚 طلب رقم " . $row["id"] . " - 📍 من: " . $row["pickup_location"] . " إلى " . $row["destination"];
        echo " - ☎️ الجوال: " . $row["phone"] . " - 🏷️ الحالة: " . $row["status"] . "</li>";
        echo "<form action='order_update.php' method='POST'>
                <input type='hidden' name='order_id' value='" . $row["id"] . "'>
                <button type='submit' name='status' value='accepted'>✅ قبول الطلب</button>
                <button type='submit' name='status' value='rejected'>❌ رفض الطلب</button>
              </form>";
    }
    echo "</ul>";
} else {
    echo "<p>🚨 لا يوجد طلبات حتى الآن.</p>";
}

$conn->close();
?>
