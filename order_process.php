<?php
include 'db.php'; // الاتصال بقاعدة البيانات

if ($_SERVER["REQUEST_METHOD"] === "POST") { // التأكد أن الطلب قادم من النموذج
    $pickup = $_POST["pickup"]; // موقع الاستلام
    $destination = $_POST["destination"]; // الوجهة النهائية
    $vehicleType = $_POST["vehicleType"]; // نوع السطحة
    $phone = $_POST["phone"]; // رقم الجوال

    // إدخال الطلب إلى قاعدة البيانات مع حماية ضد الاختراقات
    $stmt = $conn->prepare("INSERT INTO orders (pickup_location, destination, vehicle_type, phone, status) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->bind_param("ssss", $pickup, $destination, $vehicleType, $phone);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo "<h1>✅ تم تقديم الطلب بنجاح!</h1>";
    } else {
        echo "❌ حدث خطأ أثناء تقديم الطلب.";
    }

    $stmt->close();
}
$conn->close();
?>
