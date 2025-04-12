// التنقل بين الصفحات
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// وظيفة التمرير السلس لنموذج الطلب
function scrollToOrderForm() {
  const orderSection = document.getElementById('orderFormSection');
  orderSection.scrollIntoView({ behavior: 'smooth' });
}

// --- إدارة الطلبات ---
// نسترجع الطلبات من التخزين المحلي
let orders = JSON.parse(localStorage.getItem('orders')) || [];

function updateStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

// عرض الطلبات في الواجهات العامة (الصفحة الرئيسية والتتبع)
// لن يتم عرض رقم الجوال هنا
function renderOrders() {
  const ordersList = document.getElementById('ordersList');
  ordersList.innerHTML = '';
  orders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.innerHTML = `
      <button class="delete-btn" onclick="deleteOrder(${order.id})">❌ حذف</button>
      <button class="update-btn" onclick="updateOrderStatus(${order.id}, 'completed')">تحديث الحالة</button>
      <h3>طلب #${order.id}</h3>
      <p><strong>من:</strong> ${order.pickup}</p>
      <p><strong>إلى:</strong> ${order.destination}</p>
      <p><strong>نوع السطحة:</strong> ${getVehicleName(order.vehicleType)}</p>
      <div class="status ${order.status}"><strong>الحالة:</strong> ${getStatusText(order.status)}</div>
      <p><small>تاريخ الطلب: ${order.date}</small></p>
    `;
    ordersList.appendChild(orderCard);
  });
}

// عرض الطلبات في صفحة تتبع الطلب (بنفس التنسيق السابق، دون رقم الجوال)
function renderOrdersTrack() {
  const trackOrdersList = document.getElementById('trackOrdersList');
  trackOrdersList.innerHTML = '';
  orders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.innerHTML = `
      <h3>طلب #${order.id}</h3>
      <p><strong>من:</strong> ${order.pickup}</p>
      <p><strong>إلى:</strong> ${order.destination}</p>
      <p><strong>نوع السطحة:</strong> ${getVehicleName(order.vehicleType)}</p>
      <div class="status ${order.status}"><strong>الحالة:</strong> ${getStatusText(order.status)}</div>
      <p><small>تاريخ الطلب: ${order.date}</small></p>
    `;
    trackOrdersList.appendChild(orderCard);
  });
}

function deleteOrder(id) {
  if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
    orders = orders.filter(order => order.id !== id);
    updateStorage();
    renderOrders();
    renderOrdersTrack();
  }
}

// تحديث حالة الطلب (يدعم تحديد حالة جديدة مباشرة)
function updateOrderStatus(id, newStatus) {
  orders = orders.map(order => {
    if (order.id === id) {
      order.status = newStatus;
    }
    return order;
  });
  updateStorage();
  renderOrders();
  renderOrdersTrack();
  renderAdminPanel();
}

function getVehicleName(type) {
  const vehicles = { 
    small: 'سطحة صغيرة', 
    medium: 'سطحة متوسطة', 
    large: 'سطحة كبيرة'
  };
  return vehicles[type] || type;
}

function getStatusText(status) {
  const statuses = { 
    pending: 'قيد الانتظار', 
    accepted: 'تم القبول', 
    rejected: 'مرفوض', 
    completed: 'مكتمل'
  };
  return statuses[status] || status;
}

// --- تنفيذ عملية الطلب ---
// الآن نقوم بجمع بيانات رقم الجوال أيضاً
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const pickup = document.getElementById('pickup').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const vehicleType = document.getElementById('vehicleType').value;
  const phone = document.getElementById('phone').value.trim(); // رقم الجوال
  
  if (!pickup || !destination || !phone) {
    alert("يرجى إدخال جميع البيانات المطلوبة.");
    return;
  }
  
  const newOrder = {
    id: Date.now(),
    pickup,
    destination,
    vehicleType,
    phone, // تخزين رقم الجوال في الطلب
    status: 'pending',
    date: new Date().toLocaleString()
  };
  
  orders.push(newOrder);
  updateStorage();
  renderOrders();
  renderOrdersTrack();
  this.reset();
});

// ----- قسم تسجيل الدخول -----
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
  const user = users.find(u => u.username === username && u.password === password);
  const loginMessage = document.getElementById('loginMessage');
  if (user) {
    setLoggedInUser(user);
    loginMessage.textContent = "تم تسجيل الدخول بنجاح.";
    setTimeout(() => {
      showPage('home');
    }, 1000);
  } else {
    loginMessage.textContent = "بيانات الدخول غير صحيحة.";
  }
});

// ----- قسم لوحة الإدارة -----
// تعرض لوحة الإدارة جميع بيانات الطلب، بما في ذلك رقم الجوال، وتوفر خيارات قبول، رفض أو إكمال الطلب.
function renderAdminPanel() {
  const adminPanel = document.getElementById('adminPanel');
  const loggedInUser = getLoggedInUser();
  adminPanel.innerHTML = '';
  if (!loggedInUser || loggedInUser.role !== 'admin') {
    adminPanel.innerHTML = '<p style="text-align:center;">الوصول ممنوع. يرجى تسجيل الدخول كمشرف.</p>';
    return;
  }
  
  orders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    // عرض تفاصيل الطلب مع رقم الجوال الذي لا يظهر للعملاء العاديين
    let buttonsHTML = "";
    if(order.status === "pending") {
      buttonsHTML = `
        <button class="update-btn" onclick="updateOrderStatus(${order.id}, 'accepted')">قبول الطلب</button>
        <button class="delete-btn" onclick="updateOrderStatus(${order.id}, 'rejected')">رفض الطلب</button>
      `;
    } else if(order.status === "accepted") {
      buttonsHTML = `<button class="update-btn" onclick="updateOrderStatus(${order.id}, 'completed')">إكمال الطلب</button>`;
    }
    
    orderCard.innerHTML = `
      ${buttonsHTML}
      <h3>طلب #${order.id}</h3>
      <p><strong>من:</strong> ${order.pickup}</p>
      <p><strong>إلى:</strong> ${order.destination}</p>
      <p><strong>نوع السطحة:</strong> ${getVehicleName(order.vehicleType)}</p>
      <!-- رقم الجوال يظهر في لوحة الإدارة فقط -->
      <p><strong>رقم الجوال:</strong> ${order.phone}</p>
      <div class="status ${order.status}"><strong>الحالة:</strong> ${getStatusText(order.status)}</div>
      <p><small>تاريخ الطلب: ${order.date}</small></p>
    `;
    adminPanel.appendChild(orderCard);
  });
}

// ----- قسم الدفع والدردشة -----
document.getElementById('paymentForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const paymentMessage = document.getElementById('paymentMessage');
  // محاكاة تنفيذ الدفع؛ هنا يمكنك دمج بوابة دفع إلكترونية فعلية
  paymentMessage.textContent = "تمت عملية الدفع بنجاح.";
  this.reset();
});

function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const message = chatInput.value.trim();
  if (message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = "أنت: " + message;
    chatMessages.appendChild(messageElement);
    // محاكاة استجابة الدردشة
    setTimeout(() => {
      const responseElement = document.createElement('p');
      responseElement.textContent = "الدعم: شكراً لتواصلك معنا!";
      chatMessages.appendChild(responseElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// ----- عند تحميل الصفحة -----
renderOrders();
renderOrdersTrack();
