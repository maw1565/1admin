import { db, storeConfig } from './config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Image compression function
window.compressImage = async function(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

// Modal functions
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
  }
}

window.closeModal = function(modalId) {
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
      
      // Hide sidebar after selection on mobile
      if (sidebar && window.innerWidth <= 768) {
         sidebar.classList.add('hidden');
      }
    });
  });

  // Data arrays
  let banners = [];
  let products = [];
  let services = [];
  let specialists = [];
  let bookings = [];
  let currentTab = 'pending';

  // Real-time Listeners
  onSnapshot(collection(db, "banners"), (snapshot) => {
    banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderBanners();
  });

  onSnapshot(collection(db, "products"), (snapshot) => {
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts();
  });

  onSnapshot(collection(db, "services"), (snapshot) => {
    services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderServices();
  });

  onSnapshot(collection(db, "specialists"), (snapshot) => {
    specialists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSpecialists();
  });

  onSnapshot(collection(db, "bookings"), (snapshot) => {
    bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderBookings();
  });
  
  onSnapshot(doc(db, "settings", "general"), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('settings-name').value = data.name || '';
      document.getElementById('settings-whatsapp').value = data.whatsapp || '';
      document.getElementById('settings-instagram').value = data.instagram || '';
      document.getElementById('settings-hours').value = data.hours || '';
    }
  });

  // Render Functions
  function renderBanners() {
    const tbody = document.getElementById('banners-tbody');
    if (!tbody) return;
    tbody.innerHTML = banners.map(b => `
      <tr>
        <td><img src="${b.image || ''}" width="60" style="border-radius:5px;" /></td>
        <td>${b.title}</td>
        <td><span style="color: ${b.status === 'نشط' ? '#4caf50' : '#f44336'};">${b.status}</span></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('banners', '${b.id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  }

  function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    tbody.innerHTML = products.map(p => `
      <tr>
        <td><img src="${p.image || ''}" width="50" style="border-radius:5px;" /></td>
        <td>${p.name}</td>
        <td>${Number(p.price).toLocaleString()} د.ع</td>
        <td>${p.qty}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('products', '${p.id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  }

  function renderServices() {
    const tbody = document.getElementById('services-tbody');
    if (!tbody) return;
    tbody.innerHTML = services.map(s => `
      <tr>
        <td><img src="${s.image || ''}" width="50" style="border-radius:5px;" /></td>
        <td>${s.name}</td>
        <td>${Number(s.price).toLocaleString()} د.ع</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('services', '${s.id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  }

  function renderSpecialists() {
    const tbody = document.getElementById('specialists-tbody');
    if (!tbody) return;
    tbody.innerHTML = specialists.map(s => `
      <tr>
        <td><img src="${s.image || ''}" width="50" style="border-radius:5px;" /></td>
        <td>${s.name}</td>
        <td>${s.rating} ★</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('specialists', '${s.id}')">حذف</button>
        </td>
      </tr>
    `).join('');
  }

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
      <div class="booking-card" style="border-right-color: ${b.color || '#e91e63'};">
        <div class="booking-card-header">
          <span class="booking-id">طلب #${b.id.substring(0,6)}</span>
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
          <button class="btn btn-danger" onclick="deleteItem('bookings', '${b.id}')">حذف</button>
        </div>
      </div>
    `).join('');
  }

  // Save Functions
  window.saveBanner = async function() {
    try {
      const title = document.getElementById('banner-title').value;
      const status = document.getElementById('banner-status').value;
      const imageInput = document.getElementById('banner-image');
      const image = imageInput.getAttribute('data-base64') || '';
      
      if(!title) return alert('يرجى إدخال عنوان البنر');
      
      await addDoc(collection(db, "banners"), { title, status, image });
      closeModal('banner-modal');
      document.getElementById('banner-title').value = '';
      imageInput.removeAttribute('data-base64');
      imageInput.value = '';
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  window.saveProduct = async function() {
    try {
      const name = document.getElementById('product-name').value;
      const price = document.getElementById('product-price').value;
      const qty = document.getElementById('product-qty').value;
      const desc = document.getElementById('product-desc').value;
      const imageInput = document.getElementById('product-image');
      const image = imageInput.getAttribute('data-base64') || '';
      
      if(!name || !price) return alert('يرجى إدخال اسم وسعر المنتج');
      
      await addDoc(collection(db, "products"), { name, price: Number(price), qty: Number(qty), desc, image });
      closeModal('product-modal');
      document.getElementById('product-name').value = '';
      document.getElementById('product-price').value = '';
      document.getElementById('product-qty').value = '1';
      document.getElementById('product-desc').value = '';
      imageInput.removeAttribute('data-base64');
      imageInput.value = '';
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  window.saveService = async function() {
    try {
      const name = document.getElementById('service-name').value;
      const price = document.getElementById('service-price').value;
      const imageInput = document.getElementById('service-image');
      const image = imageInput.getAttribute('data-base64') || '';
      
      if(!name || !price) return alert('يرجى إدخال اسم وسعر الخدمة');
      
      await addDoc(collection(db, "services"), { name, price: Number(price), image });
      closeModal('service-modal');
      document.getElementById('service-name').value = '';
      document.getElementById('service-price').value = '';
      imageInput.removeAttribute('data-base64');
      imageInput.value = '';
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  window.saveSpecialist = async function() {
    try {
      const name = document.getElementById('specialist-name').value;
      const rating = document.getElementById('specialist-rating').value;
      const imageInput = document.getElementById('specialist-image');
      const image = imageInput.getAttribute('data-base64') || '';
      
      if(!name) return alert('يرجى إدخال اسم المتخصصة');
      
      await addDoc(collection(db, "specialists"), { name, rating: Number(rating), image });
      closeModal('specialist-modal');
      document.getElementById('specialist-name').value = '';
      document.getElementById('specialist-rating').value = '5.0';
      imageInput.removeAttribute('data-base64');
      imageInput.value = '';
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  window.saveSettings = async function() {
    try {
      const name = document.getElementById('settings-name').value;
      const whatsapp = document.getElementById('settings-whatsapp').value;
      const instagram = document.getElementById('settings-instagram').value;
      const hours = document.getElementById('settings-hours').value;
      
      await setDoc(doc(db, "settings", "general"), { name, whatsapp, instagram, hours });
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  window.deleteItem = async function(collectionName, id) {
    if(confirm('هل أنت متأكد من الحذف؟')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (e) {
        console.error(e);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  window.approveBooking = async function(id) {
    try {
      await updateDoc(doc(db, "bookings", id), { status: 'مؤكد' });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الموافقة');
    }
  };

  // Automatically compress images on file select
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await window.compressImage(file);
          e.target.setAttribute('data-base64', base64);
          console.log('Image compressed and saved to data-base64 attribute.');
        } catch (err) {
          console.error('Error compressing image:', err);
        }
      }
    });
  });

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentTab = e.target.getAttribute('data-tab');
      renderBookings();
    });
  });
});
