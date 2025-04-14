<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $order_id = intval($_POST["order_id"]); // تحويل ID إلى رقم صحيح لمنع الاختراق
    $status = $_POST["status"];

    // التحقق من صحة الحالة المدخلة
    $allowed_statuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!in_array($status, $allowed_statuses)) {
        die("❌ الحالة غير صحيحة.");
    }

    // تحديث الطلب في قاعدة البيانات
    $stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $order_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo "✅ تم تحديث الطلب إلى $status!";
    } else {
        echo "❌ لم يتم العثور على الطلب أو فشل التحديث.";
    }

    $stmt->close();
}
$conn->close();
?>