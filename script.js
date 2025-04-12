// التنقل بين الصفحات
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// تمرير إلى نموذج الطلب
function scrollToOrderForm() {
  document.getElementById('orderFormSection').scrollIntoView({ behavior: 'smooth' });
}

// البيانات من التخزين المحلي
let orders = JSON.parse(localStorage.getItem('orders')) || [];

function updateStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

// عرض الطلبات (بدون رقم جوال)
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

// عرض صفحة تتبع الطلبات
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
    showToast("تم حذف الطلب بنجاح.");
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
  showToast("تم تحديث حالة الطلب.");
}

// تحويل القيم النصية
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

  notifyAdmin(); // إشعار الإدارة
  renderOrders();
  renderOrdersTrack();
  this.reset();
});

// إشعار الإدارة أو العميل
function notifyAdmin() {
  const user = getLoggedInUser();
  if (user) {
    if (user.role === 'admin') {
      showToast("تم إرسال الطلب من قبل الإدارة.");
    } else {
      showToast("تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.");
    }
  } else {
    showToast("تم إرسال طلبك بنجاح! سيتم مراجعته من الإدارة.");
  }
}

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

// تسجيل الدخول
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

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginMessage = document.getElementById('loginMessage');
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    setLoggedInUser(user);
    loginMessage.textContent = "تم تسجيل الدخول بنجاح.";
    showToast("مرحباً بك، " + user.username);
    setTimeout(() => showPage('home'), 1000);
  } else {
    loginMessage.textContent = "بيانات الدخول غير صحيحة.";
    showToast("فشل تسجيل الدخول.");
  }
});

// لوحة الإدارة
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
