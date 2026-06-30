// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('.sidebar li');
  const sections = document.querySelectorAll('.panel-section');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });
  }

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all
      sidebarItems.forEach(li => li.classList.remove('active'));
      sections.forEach(sec => sec.classList.remove('active'));

      // Add active class to clicked item
      item.classList.add('active');
      const targetId = item.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
      
      // Hide sidebar after selection
      if (sidebar && window.innerWidth <= 768) {
         sidebar.classList.add('hidden');
      } else if (sidebar) {
         sidebar.classList.add('hidden');
      }
    });
  });

  // Populate mock data
  const banners = [
    { title: "عروض العيد", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80", status: "نشط" }
  ];
  
  const bannersTbody = document.getElementById('banners-tbody');
  if (bannersTbody) {
    bannersTbody.innerHTML = banners.map(b => `
      <tr>
        <td><img src="${b.image}" width="60" style="border-radius:5px;" /></td>
        <td>${b.title}</td>
        <td><span style="color: #4caf50;">${b.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary">تعديل</button>
          <button class="btn btn-sm btn-danger">حذف</button>
        </td>
      </tr>
    `).join('');
  }

  const products = [
    { name: "شامبو كريستال", price: 25000, qty: 15, image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=150&q=80" },
    { name: "زيت أركان", price: 35000, qty: 8, image: "https://images.unsplash.com/photo-1608248593842-8021c6a8b5cc?auto=format&fit=crop&w=150&q=80" }
  ];

  const productsTbody = document.getElementById('products-tbody');
  if (productsTbody) {
    productsTbody.innerHTML = products.map(p => `
      <tr>
        <td><img src="${p.image}" width="50" style="border-radius:5px;" /></td>
        <td>${p.name}</td>
        <td>${p.price.toLocaleString()} د.ع</td>
        <td>${p.qty}</td>
        <td>
          <button class="btn btn-sm btn-primary">تعديل</button>
          <button class="btn btn-sm btn-danger">حذف</button>
        </td>
      </tr>
    `).join('');
  }

  const services = [
    { name: "تسريحة شعر", price: 50000, image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80" },
    { name: "مكياج سهرة", price: 100000, image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=150&q=80" }
  ];

  const servicesTbody = document.getElementById('services-tbody');
  if (servicesTbody) {
    servicesTbody.innerHTML = services.map(s => `
      <tr>
        <td><img src="${s.image}" width="50" style="border-radius:5px;" /></td>
        <td>${s.name}</td>
        <td>${s.price.toLocaleString()} د.ع</td>
        <td>
          <button class="btn btn-sm btn-primary">تعديل</button>
          <button class="btn btn-sm btn-danger">حذف</button>
        </td>
      </tr>
    `).join('');
  }

  const specialists = [
    { name: "ريم الزهراني", rating: 4.7, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { name: "سارة الأحمد", rating: 4.9, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
  ];

  const specialistsTbody = document.getElementById('specialists-tbody');
  if (specialistsTbody) {
    specialistsTbody.innerHTML = specialists.map(s => `
      <tr>
        <td><img src="${s.image}" width="50" style="border-radius:5px;" /></td>
        <td>${s.name}</td>
        <td>${s.rating} ★</td>
        <td>
          <button class="btn btn-sm btn-primary">تعديل</button>
          <button class="btn btn-sm btn-danger">حذف</button>
        </td>
      </tr>
    `).join('');
  }

  let bookings = [
    { id: "1001", customer: "فاطمة أحمد", service: "مكياج سهرة - سارة", date: "2024-05-10 04:30 م", status: "مؤكد", phone: "9647712345678", color: "#673ab7" },
    { id: "1002", customer: "نور علي", service: "قص شعر - ريم", date: "2024-05-11 11:00 ص", status: "قيد الانتظار", phone: "9647812345678", color: "#e91e63" },
    { id: "1003", customer: "زينب محمد", service: "عناية بالبشرة", date: "2024-05-12 02:00 م", status: "قيد الانتظار", phone: "9647912345678", color: "#009688" }
  ];

  let currentTab = 'pending';

  window.renderBookings = function() {
    const bookingsContainer = document.getElementById('bookings-container');
    if (!bookingsContainer) return;

    const filteredBookings = bookings.filter(b => 
      currentTab === 'pending' ? b.status === 'قيد الانتظار' : b.status === 'مؤكد'
    );

    if (filteredBookings.length === 0) {
      bookingsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">لا توجد مواعيد في هذا القسم.</p>';
      return;
    }

    bookingsContainer.innerHTML = filteredBookings.map(b => `
      <div class="booking-card" style="border-right-color: ${b.color};">
        <div class="booking-card-header">
          <span class="booking-id">طلب #${b.id}</span>
          <span class="booking-status status-${b.status === 'مؤكد' ? 'confirmed' : 'pending'}">${b.status}</span>
        </div>
        <div class="booking-info">
          <div class="info-item">
            <span class="info-label">الزبون</span>
            <span class="info-value">${b.customer}</span>
          </div>
          <div class="info-item">
            <span class="info-label">الخدمة</span>
            <span class="info-value">${b.service}</span>
          </div>
          <div class="info-item">
            <span class="info-label">التاريخ والوقت</span>
            <span class="info-value" style="direction: ltr; display: inline-block;">${b.date}</span>
          </div>
          <div class="info-item">
            <span class="info-label">رقم الهاتف</span>
            <span class="info-value" style="direction: ltr; display: inline-block;">+${b.phone}</span>
          </div>
        </div>
        <div class="booking-actions">
          ${b.status === 'قيد الانتظار' ? `<button class="btn btn-approve" onclick="approveBooking('${b.id}')">موافقة</button>` : ''}
          <a href="https://wa.me/${b.phone}?text=مرحباً ${b.customer}، نود تأكيد موعدك لخدمة ${b.service} في يوم ${b.date}" target="_blank" class="btn btn-whatsapp text-center" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">تأكيد عبر واتساب</a>
          <button class="btn btn-danger" onclick="deleteBooking('${b.id}')">حذف</button>
        </div>
      </div>
    `).join('');
  }

  window.approveBooking = function(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'مؤكد';
      renderBookings();
    }
  };

  window.deleteBooking = function(id) {
    bookings = bookings.filter(b => b.id !== id);
    renderBookings();
  };

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentTab = e.target.getAttribute('data-tab');
      renderBookings();
    });
  });

  renderBookings();
});
