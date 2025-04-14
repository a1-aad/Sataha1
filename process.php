<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];

    $stmt = $conn->prepare("SELECT * FROM users WHERE name = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user["password"])) {
            echo "<h1>✅ مرحبًا، " . htmlspecialchars($username) . "! تم تسجيل الدخول بنجاح.</h1>";
        } else {
            echo "<p>❌ كلمة المرور غير صحيحة.</p>";
        }
    } else {
        echo "<p>❌ المستخدم غير موجود.</p>";
    }

    $stmt->close();
}
$conn->close();
?>