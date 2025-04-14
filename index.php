<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <title>سطحة ون - الصفحة الرئيسية</title>
</head>
<body>

    <h1>مرحبًا بك في سطحة ون 🚚</h1>

    <h2>طلب سطحة</h2>
    <form action="order_process.php" method="POST">
        <label for="pickup">موقع الاستلام:</label>
        <input type="text" id="pickup" name="pickup" required>

        <label for="destination">الوجهة النهائية:</label>
        <input type="text" id="destination" name="destination" required>

        <label for="vehicleType">نوع السطحة:</label>
        <select id="vehicleType" name="vehicleType">
            <option value="small">سطحة صغيرة</option>
            <option value="medium">سطحة متوسطة</option>
            <option value="large">سطحة كبيرة</option>
        </select>

        <label for="phone">رقم الجوال:</label>
        <input type="text" id="phone" name="phone" required>

        <button type="submit">طلب السطحة الآن</button>
    </form>

    <h2>لوحة الإدارة</h2>
    <a href="admin.php">🔗 عرض جميع الطلبات</a>

</body>
</html>