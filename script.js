// --- Firebase Initialization ---
// قم باستبدال القيم التالية بإعدادات مشروعك من Firebase Console.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة تطبيق Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// تسجيل Service Worker من أجل استقبال الإشعارات
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
      messaging.useServiceWorker(registration);
    })
    .catch(err => {
      console.error('Service Worker registration failed:', err);
    });
}

// طلب إذن الإشعارات للمستخدم
function requestNotificationPermission() {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      messaging.getToken().then(currentToken => {
        if (currentToken) {
          console.log("FCM Token:", currentToken);
          // يُمكن إرسال التوكن إلى الخادم لتسجيله وإرسال الإشعارات لاحقاً.
        } else {
          console.log("لا يوجد توكن متاح.");
        }
      }).catch(err => {
        console.error("فشل الحصول على التوكن:", err);
      });
    } else {
      console.log("إذن الإشعارات غير ممنوح.");
    }
  });
}

// يمكنك استدعاء دالة requestNotificationPermission() عند تحميل الصفحة أو عند الضغط على زر.
requestNotificationPermission();


// --- إدارة الصفحات والطلبات ---
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

function scrollToOrderForm() {
  document.getElementById('orderFormSection').scrollIntoView({ behavior: 'smooth' });
}

// استرجاع الطلبات من التخزين المحلي
let orders = JSON.parse(localStorage.getItem('orders')) || [];

function updateStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

// عرض الطلبات (دون رقم الجوال) للواجهات العامة
function renderOrders() {
  const ordersList = document.getElementById('ordersList');
  ordersList.innerHTML = '';
  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <button class="delete-btn" onclick="deleteOrder(${order.id})">❌ حذف</button>
      <button class="update-btn" onclick="updateOrderStatus(${order.id}, 'completed')">تحديث الحالة</button>
      <h3>طلب #${order.id}</h3>
      <p><strong>من:</strong> ${order.pickup}</p>
      <p><strong>إلى:</strong> ${order.destination}</p>
      <p><strong>نوع السطحة:</strong> ${getVehicleName(order.vehicleType)}</p>
      <div class="status ${order.status}"><strong>الحالة:</strong> ${getStatusText(order.status)}</div>
      <p><small>تاريخ الطلب: ${order.date}</small></p>
    `;
    ordersList.appendChild(card);
  });
}

// عرض الطلبات في صفحة تتبع الطلب (دون رقم الجوال)
function renderOrdersTrack() {
  const trackList = document.getElementById('trackOrdersList');
  trackList.innerHTML = '';
  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <h3>طلب #${order.id}</h3>
      <p><strong>من:</strong> ${order.pickup}</p>
      <p><strong>إلى:</strong> ${order.destination}</p>
      <p><strong>نوع السطحة:</strong> ${getVehicleName(order.vehicleType)}</p>
      <div class="status ${order.status}"><strong>الحالة:</strong> ${getStatusText(order.status)}</div>
      <p><small>تاريخ الطلب: ${order.date}</small></p>
    `;
    trackList.appendChild(card);
  });
}

function deleteOrder(id) {
  if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
    orders = orders.filter(order => order.id !== id);
    updateStorage();
    renderOrders();
    renderOrdersTrack();
    renderAdminPanel();
    if(getLoggedInUser()?.role === 'admin'){
      showToast("تم حذف الطلب بنجاح.");
    }
  }
}

function updateOrderStatus(id, newStatus) {
  orders = orders.map(order => {
    if (order.id === id) order.status = newStatus;
    return order;
  });
  updateStorage();
  renderOrders();
  renderOrdersTrack();
  renderAdminPanel();
  if(getLoggedInUser()?.role === 'admin'){
    showToast("تم تحديث حالة الطلب.");
  }
}

function getVehicleName(type) {
  return { small: 'سطحة صغيرة', medium: 'سطحة متوسطة', large: 'سطحة كبيرة' }[type] || type;
}

function getStatusText(status) {
  return {
    pending: 'قيد الانتظار',
    accepted: 'تم القبول',
    rejected: 'مرفوض',
    completed: 'مكتمل'
  }[status] || status;
}

// نموذج الطلب
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const pickup = document.getElementById('pickup').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const vehicleType = document.getElementById('vehicleType').value;
  const phone = document.getElementById('phone').value.trim();

  if (!pickup || !destination || !phone) {
    showToast("يرجى إدخال جميع البيانات.");
    return;
  }

  const newOrder = {
    id: Date.now(),
    pickup,
    destination,
    vehicleType,
    phone,
    status: 'pending',
    date: new Date().toLocaleString()
  };

  orders.push(newOrder);
  updateStorage();

  // إذا كان المستخدم الحالي مسؤول (admin) يُرسل إشعار خاص للإدارة
  if(getLoggedInUser()?.role === 'admin'){
    showToast("هناك طلب جديد وارد! يُرجى مراجعة لوحة الإدارة والتعامل مع الإجراءات.");
  }
  
  renderOrders();
  renderOrdersTrack();
  this.reset();
});

// إشعار Toast
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// بيانات المستخدمين
const users = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'user', password: 'user', role: 'user' }
];

function setLoggedInUser(user) {
  localStorage.setItem('loggedInUser', JSON.stringify(user));
}

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('loggedInUser'));
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginMessage = document.getElementById('loginMessage');
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    setLoggedInUser(user);
    loginMessage.textContent = "تم تسجيل الدخول بنجاح.";
    if(user.role === 'admin'){
      showToast("مرحباً يا مشرف، " + user.username);
    }
    setTimeout(() => showPage('home'), 1000);
  } else {
    loginMessage.textContent = "بيانات الدخول غير صحيحة.";
    showToast("فشل تسجيل الدخول.");
  }
});

// لوحة الإدارة: عرض الطلبات مع الإجراءات (قبول/رفض/إكمال) ويظهر رقم الجوال
function renderAdminPanel() {
  const panel = document.getElementById('adminPanel');
  const user = getLoggedInUser();
  panel.innerHTML = '';

  if (!user || user.role !== 'admin') {
    panel.innerHTML = '<p style="text-align:center;">الوصول ممنوع. سجل كمشرف.</p>';
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';

    let buttons = '';
    if (order.status === 'pending') {
      buttons = `
        <button class="update-btn" onclick="updateOrderStatus(${order.id}, 'accepted')">قبول</button>
        <button class="delete-btn" onclick="updateOrderStatus(${order.id}, 'rejected')">رفض</button>
      `;
    } else if (order.status === 'accepted') {
      buttons = `<button class="update-btn" onclick="updateOrderStatus(${order.id}, 'completed')">إكمال</button>`;
    }

    card.innerHTML = `
      ${buttons}
      <h3>طلب #${order.id}</h3>
      <p><strong>من:</strong> ${order.pickup}</p>
      <p><strong>إلى:</strong> ${order.destination}</p>
      <p><strong>نوع السطحة:</strong> ${getVehicleName(order.vehicleType)}</p>
      <p><strong>رقم الجوال:</strong> ${order.phone}</p>
      <div class="status ${order.status}"><strong>الحالة:</strong> ${getStatusText(order.status)}</div>
      <p><small>تاريخ الطلب: ${order.date}</small></p>
    `;
    panel.appendChild(card);
  });
}

// قسم الدفع
document.getElementById('paymentForm').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('paymentMessage').textContent = "تم الدفع بنجاح.";
  this.reset();
  showToast("شكراً لدفعك.");
});

// قسم الدردشة
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const message = input.value.trim();
  if (message) {
    messages.innerHTML += `<p>أنت: ${message}</p>`;
    setTimeout(() => {
      messages.innerHTML += `<p>الدعم: شكراً لتواصلك معنا!</p>`;
      messages.scrollTop = messages.scrollHeight;
    }, 1000);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
  }
}

// عند تحميل الصفحة
renderOrders();
renderOrdersTrack();
