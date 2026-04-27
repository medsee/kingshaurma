/**
 * King Shaurma — app.js
 * Frontend JavaScript — barcha sahifalar uchun
 */

/* ============================================
   1. MA'LUMOTLAR (Placeholder / Mock Data)
   ============================================ */
const MENU_DATA = [
  // SHAURMA
  { id: 1, name: "Shaurma Classic",      category: "shaurma", price: 22000, emoji: "🌯", ingredients: "Lavash, tovuq go'shti, pomidor, bodring, sous", popular: true,  available: true  },
  { id: 2, name: "Shaurma XXL",          category: "shaurma", price: 32000, emoji: "🌯", ingredients: "Katta lavash, mol go'shti, sabzavotlar, maxsus sous", popular: true,  available: true  },
  { id: 3, name: "Shaurma Ostraya",      category: "shaurma", price: 25000, emoji: "🌶️", ingredients: "Lavash, tovuq, achchiq sous, tuz-murch", popular: false, available: true  },
  { id: 4, name: "Shaurma Combo",        category: "shaurma", price: 42000, emoji: "🌯", ingredients: "2x Shaurma + 1 Pepsi", popular: true,  available: true  },
  { id: 5, name: "Shaurma Vegetarian",   category: "shaurma", price: 18000, emoji: "🥗", ingredients: "Lavash, grillda qovurilgan sabzavotlar, sous", popular: false, available: true  },
  // PIZZA
  { id: 6, name: "Margarita",            category: "pizza",   price: 35000, emoji: "🍕", ingredients: "Pomidor sousi, mozzarella, brokoli, zard", popular: true,  available: true  },
  { id: 7, name: "Pepperoni",            category: "pizza",   price: 45000, emoji: "🍕", ingredients: "Pepperoni, mozzarella, pomidor sousi", popular: true,  available: true  },
  { id: 8, name: "Barbekyu",             category: "pizza",   price: 48000, emoji: "🍕", ingredients: "BBQ sous, tovuq, piyoz, mozzarella", popular: false, available: true  },
  { id: 9, name: "Harvest Pizza",        category: "pizza",   price: 52000, emoji: "🍕", ingredients: "Qo'ziqorin, qalampir, piyoz, mozzarella, pomidor", popular: false, available: false },
  // BURGER
  { id: 10, name: "King Burger",         category: "burger",  price: 28000, emoji: "🍔", ingredients: "Mol kotlet, pomidor, salat, sous, non", popular: true,  available: true  },
  { id: 11, name: "Chicken Burger",      category: "burger",  price: 24000, emoji: "🍔", ingredients: "Tovuq kotlet, bodring, sous, non", popular: false, available: true  },
  { id: 12, name: "Double Burger",       category: "burger",  price: 38000, emoji: "🍔", ingredients: "2x mol kotlet, pishloq, sous, non", popular: true,  available: true  },
  { id: 13, name: "Nuggets 9 dona",      category: "burger",  price: 20000, emoji: "🍗", ingredients: "Tovuq nuggetslar, sous, kartoshka fri", popular: false, available: true  },
  // ICHIMLIKLAR
  { id: 14, name: "Pepsi 0.5L",          category: "drink",   price: 8000,  emoji: "🥤", ingredients: "Pepsi Cola sovutilgan",                  popular: false, available: true  },
  { id: 15, name: "Lipton Choy",         category: "drink",   price: 6000,  emoji: "🍵", ingredients: "Lipton qora choy, muz bilan",            popular: false, available: true  },
  { id: 16, name: "Apelsin Sharbati",    category: "drink",   price: 10000, emoji: "🍊", ingredients: "Yangi siqilgan apelsin sharbati",         popular: false, available: true  },
  { id: 17, name: "Limonad",             category: "drink",   price: 9000,  emoji: "🍋", ingredients: "Limon, nanə, shakar, sovuq suv",          popular: false, available: true  },
];

/* ============================================
   2. CART (SAVAT) MANAGEMENT
   ============================================ */
const Cart = {
  items: JSON.parse(localStorage.getItem('ks_cart') || '[]'),

  save() {
    localStorage.setItem('ks_cart', JSON.stringify(this.items));
    this.updateBadge();
  },

  add(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...item, qty: 1 });
    }
    this.save();
    showToast(`${item.emoji} ${item.name} savatga qo'shildi!`, 'success');
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(id);
    this.save();
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  clear() {
    this.items = [];
    this.save();
  },

  updateBadge() {
    const badges = document.querySelectorAll('#cartBadge');
    const count = this.count();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

/* ============================================
   3. TOAST NOTIFICATION
   ============================================ */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ============================================
   4. SCROLL TO TOP
   ============================================ */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================
   5. HEADER — scroll effect & mobile nav
   ============================================ */
function initHeader() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      // Animate hamburger
      const spans = toggle.querySelectorAll('span');
      if (menu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    // Close on link click
    menu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }
}

/* ============================================
   6. FORMAT PRICE
   ============================================ */
function fmtPrice(n) {
  return n.toLocaleString('uz-UZ') + " so'm";
}

/* ============================================
   7. FOOD CARD TEMPLATE
   ============================================ */
function foodCardHTML(item) {
  const badge = item.popular ? '<span class="food-card__badge">⭐ Top</span>' : '';
  const unavailable = !item.available ? 'unavailable' : '';

  return `
    <div class="food-card ${unavailable}" data-id="${item.id}">
      ${badge}
      <div class="food-card__img">${item.emoji}</div>
      <div class="food-card__body">
        <h3 class="food-card__name">${item.name}</h3>
        <p class="food-card__ingredients">${item.ingredients}</p>
        <div class="food-card__footer">
          <span class="food-card__price">${fmtPrice(item.price)}</span>
          ${item.available
            ? `<button class="add-to-cart-btn" data-id="${item.id}" aria-label="Savatga qo'shish"><i class="fas fa-plus"></i></button>`
            : `<span style="font-size:0.75rem;color:var(--gray);">Mavjud emas</span>`
          }
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   8. HOME PAGE — Popular Items
   ============================================ */
function initHomePage() {
  const grid = document.getElementById('popularGrid');
  if (!grid) return;

  // Simulate loading delay
  setTimeout(() => {
    const popular = MENU_DATA.filter(i => i.popular && i.available).slice(0, 4);
    grid.innerHTML = popular.map(foodCardHTML).join('');
    attachAddToCartHandlers(grid);
  }, 800);

  // Promo timer
  initPromoTimer();
}

function initPromoTimer() {
  const hEl = document.getElementById('timerH');
  const mEl = document.getElementById('timerM');
  const sEl = document.getElementById('timerS');
  if (!hEl) return;

  let total = 23 * 3600 + 59 * 60 + 59;

  setInterval(() => {
    if (total <= 0) { total = 23 * 3600 + 59 * 60 + 59; }
    total--;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    hEl.textContent = String(h).padStart(2, '0');
    mEl.textContent = String(m).padStart(2, '0');
    sEl.textContent = String(s).padStart(2, '0');
  }, 1000);
}

/* ============================================
   9. MENU PAGE
   ============================================ */
function initMenuPage() {
  const grid       = document.getElementById('menuGrid');
  const empty      = document.getElementById('menuEmpty');
  const searchIn   = document.getElementById('menuSearch');
  const tabs       = document.getElementById('categoryTabs');
  if (!grid) return;

  let currentCat  = 'all';
  let searchQuery = '';

  // Check URL param for category
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('cat')) {
    currentCat = urlParams.get('cat');
  }

  function renderMenu() {
    let filtered = MENU_DATA;

    if (currentCat !== 'all') {
      filtered = filtered.filter(i => i.category === currentCat);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.ingredients.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
    } else {
      empty.classList.add('hidden');
      grid.innerHTML = filtered.map(foodCardHTML).join('');
      attachAddToCartHandlers(grid);
    }
  }

  // Category tabs
  if (tabs) {
    // Activate correct tab from URL param
    tabs.querySelectorAll('.cat-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === currentCat);
      tab.addEventListener('click', () => {
        currentCat = tab.dataset.cat;
        tabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderMenu();
      });
    });
  }

  // Search
  if (searchIn) {
    searchIn.addEventListener('input', e => {
      searchQuery = e.target.value.trim();
      renderMenu();
    });
  }

  renderMenu();
}

/* ============================================
   10. ADD TO CART — Button Handler
   ============================================ */
function attachAddToCartHandlers(container) {
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id   = parseInt(btn.dataset.id);
      const item = MENU_DATA.find(i => i.id === id);
      if (item) {
        Cart.add(item);
        // Button animation
        btn.style.transform = 'rotate(180deg) scale(1.2)';
        setTimeout(() => btn.style.transform = '', 400);
      }
    });
  });
}

/* ============================================
   11. ORDER PAGE — Savat va forma
   ============================================ */
function initOrderPage() {
  const cartItemsEl  = document.getElementById('cartItems');
  const cartEmptyEl  = document.getElementById('cartEmpty');
  const sumItemsEl   = document.getElementById('sumItems');
  const sumTotalEl   = document.getElementById('sumTotal');
  const deliveryLine = document.getElementById('deliveryLine');
  const placeBtn     = document.getElementById('placeOrderBtn');
  const addressGrp   = document.getElementById('addressGroup');
  if (!cartItemsEl) return;

  let deliveryFee = 5000;
  let deliveryType = 'delivery';

  function renderCart() {
    const items = Cart.items;
    if (items.length === 0) {
      cartItemsEl.innerHTML = '';
      if (cartEmptyEl) cartEmptyEl.classList.remove('hidden');
      document.getElementById('orderFormWrap').style.opacity = '0.4';
      document.getElementById('orderFormWrap').style.pointerEvents = 'none';
      return;
    }
    if (cartEmptyEl) cartEmptyEl.classList.add('hidden');
    document.getElementById('orderFormWrap').style.opacity = '';
    document.getElementById('orderFormWrap').style.pointerEvents = '';

    cartItemsEl.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__emoji">${item.emoji}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${fmtPrice(item.price * item.qty)}</div>
        </div>
        <div class="cart-item__qty">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
        <button class="cart-item__remove" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    updateSummary();
    attachCartHandlers();
  }

  function updateSummary() {
    const itemTotal = Cart.total();
    const total = deliveryType === 'delivery' ? itemTotal + deliveryFee : itemTotal;
    if (sumItemsEl)  sumItemsEl.textContent  = fmtPrice(itemTotal);
    if (sumTotalEl)  sumTotalEl.textContent  = fmtPrice(total);
    if (deliveryLine) deliveryLine.style.display = deliveryType === 'delivery' ? '' : 'none';
  }

  function attachCartHandlers() {
    cartItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id    = parseInt(btn.dataset.id);
        const delta = parseInt(btn.dataset.delta);
        Cart.updateQty(id, delta);
        renderCart();
      });
    });
    cartItemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        Cart.remove(id);
        renderCart();
        showToast("Mahsulot savatdan o'chirildi", 'info');
      });
    });
  }

  // Delivery type toggle
  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      deliveryType = e.target.value;
      if (addressGrp) {
        addressGrp.style.display = deliveryType === 'delivery' ? '' : 'none';
      }
      updateSummary();
    });
  });

  // Place order
  if (placeBtn) {
    placeBtn.addEventListener('click', submitOrder);
  }

  function submitOrder() {
    const name    = document.getElementById('custName')?.value.trim();
    const phone   = document.getElementById('custPhone')?.value.trim();
    const address = document.getElementById('custAddress')?.value.trim();

    if (!name) { showToast("Ismingizni kiriting!", 'error'); return; }
    if (!phone || phone.length < 9) { showToast("Telefon raqamini to'g'ri kiriting!", 'error'); return; }
    if (deliveryType === 'delivery' && !address) { showToast("Manzilingizni kiriting!", 'error'); return; }
    if (Cart.items.length === 0) { showToast("Savat bo'sh!", 'error'); return; }

    // Simulate order submission
    const orderNum = '#' + (Math.floor(Math.random() * 9000) + 1000);

    // Save order to localStorage for track page demo
    const order = {
      num: orderNum,
      name, phone, address,
      items: [...Cart.items],
      total: Cart.total() + (deliveryType === 'delivery' ? deliveryFee : 0),
      deliveryType,
      status: 1,
      eta: '25-35 daqiqa',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('ks_last_order', JSON.stringify(order));
    localStorage.setItem('ks_order_' + orderNum.replace('#',''), JSON.stringify(order));

    // Show success modal
    const modal = document.getElementById('successModal');
    const numEl = document.getElementById('modalOrderNum');
    if (numEl) numEl.textContent = orderNum;
    if (modal) modal.classList.remove('hidden');

    Cart.clear();
    renderCart();
  }

  renderCart();
}

/* ============================================
   12. TRACK PAGE
   ============================================ */
const KingShaurma = { track: null };

function initTrackPage() {
  const trackBtn    = document.getElementById('trackBtn');
  const trackInput  = document.getElementById('trackInput');
  const resultEl    = document.getElementById('trackResult');
  const notFoundEl  = document.getElementById('trackNotFound');
  if (!trackBtn) return;

  let currentStep = 0;

  // Check if arriving from order page
  const lastOrder = JSON.parse(localStorage.getItem('ks_last_order') || 'null');
  if (lastOrder && trackInput) {
    trackInput.value = lastOrder.num;
    setTimeout(() => trackOrder(lastOrder.num), 300);
  }

  trackBtn.addEventListener('click', () => {
    const val = trackInput.value.trim();
    if (!val) { showToast("Buyurtma raqamini kiriting!", 'error'); return; }
    trackOrder(val);
  });
  trackInput?.addEventListener('keydown', e => { if (e.key === 'Enter') trackBtn.click(); });

  function trackOrder(numRaw) {
    const num = numRaw.startsWith('#') ? numRaw : '#' + numRaw;
    const id  = num.replace('#', '');
    const saved = JSON.parse(localStorage.getItem('ks_order_' + id) || 'null');

    if (saved) {
      // Show result
      if (resultEl) resultEl.classList.remove('hidden');
      if (notFoundEl) notFoundEl.classList.add('hidden');
      document.getElementById('trackOrderNum').textContent = num;
      document.getElementById('trackEta').textContent = saved.eta || '25-35 daqiqa';
      renderTrackDetails(saved);
      setStep(saved.status || 1);
    } else {
      // Demo mode — any number shows demo
      if (resultEl) resultEl.classList.remove('hidden');
      if (notFoundEl) notFoundEl.classList.add('hidden');
      document.getElementById('trackOrderNum').textContent = num;
      document.getElementById('trackEta').textContent = '25-35 daqiqa';
      renderTrackDetails({ items: [], total: 0, name: 'Demo mijoz', deliveryType: 'delivery', address: 'Dahbet 16' });
      setStep(2);
    }
  }

  function renderTrackDetails(order) {
    const el = document.getElementById('trackDetails');
    if (!el) return;
    const statusNames = ['', 'Qabul qilindi', 'Tayyorlanmoqda', 'Yo\'lda', 'Yetkazildi'];
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;font-size:0.875rem;">
        <div><span style="color:var(--gray);">Mijoz:</span><br/><strong>${order.name || '—'}</strong></div>
        <div><span style="color:var(--gray);">Yetkazish:</span><br/><strong>${order.deliveryType === 'pickup' ? "O'zi olib ketish" : "Yetkazib berish"}</strong></div>
        ${order.address ? `<div style="grid-column:1/-1;"><span style="color:var(--gray);">Manzil:</span><br/><strong>${order.address}</strong></div>` : ''}
        ${order.total ? `<div><span style="color:var(--gray);">Jami:</span><br/><strong style="color:var(--gold);">${fmtPrice(order.total)}</strong></div>` : ''}
      </div>
    `;
  }

  function setStep(step) {
    currentStep = step;
    const fill  = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.track-step');
    const pcts  = [0, 10, 40, 70, 100];

    if (fill) fill.style.width = pcts[step] + '%';

    steps.forEach((s, i) => {
      const stepNum = parseInt(s.dataset.step);
      s.classList.remove('done', 'active');
      if (stepNum < step) s.classList.add('done');
      if (stepNum === step) s.classList.add('active');
    });
  }

  // Expose for demo buttons
  KingShaurma.track = { setStep };
}

/* ============================================
   13. CONTACT PAGE
   ============================================ */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contName')?.value.trim();
    const phone = document.getElementById('contPhone')?.value.trim();
    const msg   = document.getElementById('contMessage')?.value.trim();

    if (!name)  { showToast("Ismingizni kiriting!", 'error'); return; }
    if (!phone) { showToast("Telefon raqamini kiriting!", 'error'); return; }
    if (!msg)   { showToast("Xabarni kiriting!", 'error'); return; }

    showToast("Xabaringiz yuborildi! Tez orada javob beramiz. ✉️", 'success', 4000);
    form.reset();
  });
}

/* ============================================
   14. ADMIN PANEL
   ============================================ */
function initAdminPage() {
  const loginEl = document.getElementById('adminLogin');
  const panelEl = document.getElementById('adminPanel');
  if (!loginEl) return;

  // Check if already logged in
  if (localStorage.getItem('ks_admin') === 'ok') {
    showPanel();
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('loginUser').value;
      const pass = document.getElementById('loginPass').value;
      if (user === 'admin' && pass === 'admin123') {
        localStorage.setItem('ks_admin', 'ok');
        showPanel();
      } else {
        showToast("Noto'g'ri foydalanuvchi nomi yoki parol!", 'error');
      }
    });
  }

  // Password toggle
  const pwdToggle = document.getElementById('pwdToggle');
  const pwdInput  = document.getElementById('loginPass');
  if (pwdToggle && pwdInput) {
    pwdToggle.addEventListener('click', () => {
      const isPass = pwdInput.type === 'password';
      pwdInput.type = isPass ? 'text' : 'password';
      pwdToggle.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  }

  function showPanel() {
    if (loginEl) loginEl.classList.add('hidden');
    if (panelEl) panelEl.classList.remove('hidden');
    initAdminPanel();
  }
}

function initAdminPanel() {
  // Sidebar links
  const sidebarLinks = document.querySelectorAll('.sidebar__link');
  const tabs         = document.querySelectorAll('.admin-tab');
  const titleEl      = document.getElementById('adminPageTitle');
  const tabNames     = { dashboard: 'Dashboard', orders: 'Buyurtmalar', menu: 'Menyu', stats: 'Statistika' };

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      tabs.forEach(t => t.classList.remove('active'));
      const target = document.getElementById('tab-' + tab);
      if (target) target.classList.add('active');
      if (titleEl) titleEl.textContent = tabNames[tab] || tab;
      if (tab === 'stats') initCharts();
      closeSidebar();
    });
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('ks_admin');
    location.reload();
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.toggle('open');
  });

  function closeSidebar() {
    document.getElementById('adminSidebar')?.classList.remove('open');
  }

  // Render orders table
  renderOrdersTable();

  // Render admin menu
  renderAdminMenu();

  // Menu item modal
  initMenuModal();

  // Order status filter
  document.getElementById('orderStatusFilter')?.addEventListener('change', (e) => {
    renderOrdersTable(e.target.value);
  });
}

/* ---- Mock Orders ---- */
const MOCK_ORDERS = [
  { id: '1234', name: 'Jasur Toshmatov', phone: '+998939921111', items: 'Shaurma Classic x2, Pepsi x1', total: 52000, status: 'new',      addr: 'Dahbet 16' },
  { id: '1233', name: 'Malika Yusupova',  phone: '+998901234567', items: 'King Burger, Margarita',       total: 63000, status: 'preparing', addr: 'Registon 5' },
  { id: '1232', name: 'Bobur Qodirov',    phone: '+998997654321', items: 'Shaurma XXL x3',               total: 96000, status: 'onway',     addr: 'Mirzo 22' },
  { id: '1231', name: 'Nodira Hamidova',  phone: '+998911111111', items: 'Double Burger x2, Limonad',    total: 85000, status: 'done',      addr: 'Navruz 3' },
  { id: '1230', name: 'Sanjar Ergashev',  phone: '+998935556677', items: 'Pepperoni, Chicken Burger',    total: 69000, status: 'done',      addr: 'Uchqo\'rg\'on' },
];

function renderOrdersTable(filterStatus = 'all') {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  const statusLabels = {
    new:       { label: 'Yangi',         cls: 'new',       icon: '🆕' },
    preparing: { label: 'Tayyorlanmoqda', cls: 'preparing', icon: '👨‍🍳' },
    onway:     { label: "Yo'lda",         cls: 'onway',     icon: '🛵' },
    done:      { label: 'Yetkazildi',     cls: 'done',      icon: '✅' },
  };

  const nextStatus = { new: 'preparing', preparing: 'onway', onway: 'done', done: 'done' };

  let orders = [...MOCK_ORDERS];
  if (filterStatus !== 'all') {
    orders = orders.filter(o => o.status === filterStatus);
  }

  tbody.innerHTML = orders.map(o => {
    const st = statusLabels[o.status];
    return `
      <tr>
        <td><strong style="color:var(--gold);">#${o.id}</strong></td>
        <td>${o.name}</td>
        <td>${o.phone}</td>
        <td style="font-size:0.8rem;color:var(--gray);">${o.items}</td>
        <td><strong>${fmtPrice(o.total)}</strong></td>
        <td><span class="status-badge status-badge--${st.cls}">${st.icon} ${st.label}</span></td>
        <td>
          ${o.status !== 'done'
            ? `<button class="btn btn--sm btn--primary" onclick="advanceOrder('${o.id}')">Keyingiga →</button>`
            : '<span style="color:var(--green);font-size:0.8rem;">Tugallandi</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

window.advanceOrder = function(id) {
  const order = MOCK_ORDERS.find(o => o.id === id);
  if (!order) return;
  const next = { new: 'preparing', preparing: 'onway', onway: 'done', done: 'done' };
  order.status = next[order.status];
  renderOrdersTable(document.getElementById('orderStatusFilter')?.value || 'all');
  showToast(`#${id} buyurtma statusi yangilandi!`, 'success');
};

/* ---- Admin Menu ---- */
let adminMenuData = [...MENU_DATA];

function renderAdminMenu() {
  const grid = document.getElementById('adminMenuGrid');
  if (!grid) return;

  grid.innerHTML = adminMenuData.map(item => `
    <div class="admin-menu-card">
      <div class="admin-menu-card__img">${item.emoji}</div>
      <div class="admin-menu-card__body">
        <div class="admin-menu-card__name">${item.name}</div>
        <div class="admin-menu-card__price">${fmtPrice(item.price)}</div>
        <div style="font-size:0.75rem;color:var(--gray);margin-top:0.25rem;">
          ${item.available ? '✅ Mavjud' : '❌ Mavjud emas'} • ${item.category}
        </div>
        <div class="admin-menu-card__actions">
          <button class="btn btn--sm btn--outline" onclick="editMenuItem(${item.id})">
            <i class="fas fa-edit"></i> Tahrirlash
          </button>
          <button class="btn btn--sm" style="background:rgba(231,76,60,0.15);color:var(--red);border-color:rgba(231,76,60,0.3);" onclick="deleteMenuItem(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function initMenuModal() {
  const modal      = document.getElementById('menuItemModal');
  const addBtn     = document.getElementById('addItemBtn');
  const cancelBtn  = document.getElementById('cancelMenuModal');
  const form       = document.getElementById('menuItemForm');
  if (!modal) return;

  addBtn?.addEventListener('click', () => openMenuModal());
  cancelBtn?.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id   = document.getElementById('editItemId').value;
    const name = document.getElementById('itemName').value.trim();
    const price = parseInt(document.getElementById('itemPrice').value);
    const cat  = document.getElementById('itemCategory').value;
    const ingr = document.getElementById('itemIngredients').value;
    const emoji= document.getElementById('itemEmoji').value || '🍽️';
    const pop  = document.getElementById('itemPopular').checked;
    const avail= document.getElementById('itemAvailable').checked;

    if (!name || !price) { showToast("Barcha majburiy maydonlarni to'ldiring!", 'error'); return; }

    if (id) {
      // Edit
      const idx = adminMenuData.findIndex(i => i.id === parseInt(id));
      if (idx !== -1) {
        adminMenuData[idx] = { ...adminMenuData[idx], name, price, category: cat, ingredients: ingr, emoji, popular: pop, available: avail };
      }
      showToast("Taom yangilandi!", 'success');
    } else {
      // Add new
      const newItem = { id: Date.now(), name, price, category: cat, ingredients: ingr, emoji, popular: pop, available: avail };
      adminMenuData.unshift(newItem);
      showToast("Yangi taom qo'shildi!", 'success');
    }

    modal.classList.add('hidden');
    renderAdminMenu();
  });
}

function openMenuModal(item = null) {
  const modal = document.getElementById('menuItemModal');
  const title = document.getElementById('menuModalTitle');
  if (!modal) return;

  if (item) {
    title.textContent = 'Taomni tahrirlash';
    document.getElementById('editItemId').value       = item.id;
    document.getElementById('itemName').value         = item.name;
    document.getElementById('itemPrice').value        = item.price;
    document.getElementById('itemCategory').value     = item.category;
    document.getElementById('itemIngredients').value  = item.ingredients;
    document.getElementById('itemEmoji').value        = item.emoji;
    document.getElementById('itemPopular').checked    = item.popular;
    document.getElementById('itemAvailable').checked  = item.available;
  } else {
    title.textContent = 'Taom qo\'shish';
    document.getElementById('menuItemForm').reset();
    document.getElementById('editItemId').value = '';
  }

  modal.classList.remove('hidden');
}

window.editMenuItem = function(id) {
  const item = adminMenuData.find(i => i.id === id);
  if (item) openMenuModal(item);
};

window.deleteMenuItem = function(id) {
  if (!confirm("Haqiqatan ham o'chirishni xohlaysizmi?")) return;
  adminMenuData = adminMenuData.filter(i => i.id !== id);
  renderAdminMenu();
  showToast("Taom o'chirildi!", 'info');
};

/* ---- Charts ---- */
function initCharts() {
  const revenueCtx = document.getElementById('revenueChart');
  const ordersCtx  = document.getElementById('ordersChart');
  if (!revenueCtx) return;

  const days   = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
  const revenue= [1200000, 1850000, 1430000, 2100000, 2350000, 2800000, 1900000];
  const orders = [38, 52, 44, 61, 67, 78, 55];

  // Prevent duplicate charts
  if (revenueCtx._chart) revenueCtx._chart.destroy();
  if (ordersCtx._chart)  ordersCtx._chart.destroy();

  Chart.defaults.color = '#888';
  Chart.defaults.font.family = 'Poppins';

  revenueCtx._chart = new Chart(revenueCtx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: "Haftalik daromad (so'm)",
        data: revenue,
        backgroundColor: 'rgba(245,197,24,0.2)',
        borderColor: '#F5C518',
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { callback: v => (v/1000000).toFixed(1) + 'M' } },
        x: { grid: { display: false } }
      }
    }
  });

  ordersCtx._chart = new Chart(ordersCtx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Buyurtmalar soni',
        data: orders,
        borderColor: '#F5C518',
        backgroundColor: 'rgba(245,197,24,0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#F5C518',
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: 0 },
        x: { grid: { display: false } }
      }
    }
  });
}

/* ============================================
   15. GLOBAL INIT — Barcha sahifalar
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Always run
  initHeader();
  initScrollTop();
  Cart.updateBadge();

  // Page-specific
  initHomePage();
  initMenuPage();
  initOrderPage();
  initTrackPage();
  initContactPage();
  initAdminPage();
});
