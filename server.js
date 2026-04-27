/**
 * King Shaurma — server.js
 * Backend: Node.js + Express.js + MongoDB
 * Ishga tushirish: node server.js yoki nodemon server.js
 */

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ============================================
   MIDDLEWARE
   ============================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik fayllarni xizmat qilish (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

/* ============================================
   MONGODB ULANISH
   ============================================ */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/king_shaurma';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB ga muvaffaqiyatli ulandi');
    seedDatabase(); // Boshlang'ich ma'lumotlarni yuklash
  })
  .catch(err => {
    console.error('❌ MongoDB ulanish xatosi:', err.message);
    console.log('⚠️  MongoDB siz demo rejimda ishlamoqda...');
  });

/* ============================================
   MONGOOSE MODELLARI
   ============================================ */

// --- Menyu modeli ---
const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ['shaurma', 'pizza', 'burger', 'drink'] },
  price:       { type: Number, required: true, min: 0 },
  emoji:       { type: String, default: '🍽️' },
  ingredients: { type: String, default: '' },
  popular:     { type: Boolean, default: false },
  available:   { type: Boolean, default: true },
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// --- Buyurtma modeli ---
const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  emoji:      { type: String, default: '🍽️' },
  qty:        { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  orderNum:     { type: String, unique: true },
  customer: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, default: '' },
    note:    { type: String, default: '' },
  },
  items:        [orderItemSchema],
  deliveryType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
  deliveryFee:  { type: Number, default: 5000 },
  subtotal:     { type: Number, required: true },
  total:        { type: Number, required: true },
  status: {
    type:    String,
    enum:    ['new', 'preparing', 'onway', 'done', 'cancelled'],
    default: 'new',
  },
  statusStep:   { type: Number, default: 1 }, // 1-4
  eta:          { type: String, default: '25-35 daqiqa' },
}, { timestamps: true });

// Avto orderNum generatsiya
orderSchema.pre('save', async function(next) {
  if (!this.orderNum) {
    const count = await Order.countDocuments();
    this.orderNum = '#' + String(count + 1000 + 1).padStart(4, '0');
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

// --- Admin modeli ---
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

/* ============================================
   BOSHLANG'ICH MA'LUMOTLAR (Seed)
   ============================================ */
async function seedDatabase() {
  try {
    // Menyu elementlari yo'q bo'lsa qo'sh
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      await MenuItem.insertMany([
        { name: "Shaurma Classic",    category: "shaurma", price: 22000, emoji: "🌯", ingredients: "Lavash, tovuq go'shti, pomidor, bodring, sous",              popular: true,  available: true },
        { name: "Shaurma XXL",        category: "shaurma", price: 32000, emoji: "🌯", ingredients: "Katta lavash, mol go'shti, sabzavotlar, maxsus sous",        popular: true,  available: true },
        { name: "Shaurma Ostraya",    category: "shaurma", price: 25000, emoji: "🌶️", ingredients: "Lavash, tovuq, achchiq sous, tuz-murch",                     popular: false, available: true },
        { name: "Shaurma Combo",      category: "shaurma", price: 42000, emoji: "🌯", ingredients: "2x Shaurma + 1 Pepsi",                                       popular: true,  available: true },
        { name: "Margarita Pizza",    category: "pizza",   price: 35000, emoji: "🍕", ingredients: "Pomidor sousi, mozzarella, brokoli",                         popular: true,  available: true },
        { name: "Pepperoni Pizza",    category: "pizza",   price: 45000, emoji: "🍕", ingredients: "Pepperoni, mozzarella, pomidor sousi",                       popular: true,  available: true },
        { name: "Barbekyu Pizza",     category: "pizza",   price: 48000, emoji: "🍕", ingredients: "BBQ sous, tovuq, piyoz, mozzarella",                        popular: false, available: true },
        { name: "King Burger",        category: "burger",  price: 28000, emoji: "🍔", ingredients: "Mol kotlet, pomidor, salat, sous, non",                     popular: true,  available: true },
        { name: "Chicken Burger",     category: "burger",  price: 24000, emoji: "🍔", ingredients: "Tovuq kotlet, bodring, sous, non",                           popular: false, available: true },
        { name: "Double Burger",      category: "burger",  price: 38000, emoji: "🍔", ingredients: "2x mol kotlet, pishloq, sous, non",                         popular: true,  available: true },
        { name: "Nuggets 9 dona",     category: "burger",  price: 20000, emoji: "🍗", ingredients: "Tovuq nuggetslar, sous, kartoshka fri",                      popular: false, available: true },
        { name: "Pepsi 0.5L",         category: "drink",   price: 8000,  emoji: "🥤", ingredients: "Pepsi Cola sovutilgan",                                      popular: false, available: true },
        { name: "Lipton Choy",        category: "drink",   price: 6000,  emoji: "🍵", ingredients: "Lipton qora choy, muz bilan",                               popular: false, available: true },
        { name: "Apelsin Sharbati",   category: "drink",   price: 10000, emoji: "🍊", ingredients: "Yangi siqilgan apelsin sharbati",                            popular: false, available: true },
        { name: "Limonad",            category: "drink",   price: 9000,  emoji: "🍋", ingredients: "Limon, nanə, shakar, sovuq suv",                            popular: false, available: true },
      ]);
      console.log('✅ Menyu ma\'lumotlari yuklandi');
    }

    // Admin yo'q bo'lsa yarat
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await Admin.create({ username: 'admin', password: hashed });
      console.log('✅ Admin yaratildi: admin / admin123');
    }

  } catch (err) {
    console.error('Seed xatosi:', err.message);
  }
}

/* ============================================
   JWT MIDDLEWARE — Admin himoya
   ============================================ */
const JWT_SECRET = process.env.JWT_SECRET || 'king_shaurma_secret_2025';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token talab qilinadi' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Noto\'g\'ri token' });
  }
}

/* ============================================
   API ROUTES
   ============================================ */

// --- Health check ---
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '👑 King Shaurma API ishlayapti!',
    version: '1.0.0',
    endpoints: [
      'GET  /api/menu',
      'POST /api/menu (admin)',
      'PUT  /api/menu/:id (admin)',
      'DELETE /api/menu/:id (admin)',
      'POST /api/orders',
      'GET  /api/orders/:id',
      'GET  /api/orders (admin)',
      'PUT  /api/orders/:id/status (admin)',
      'POST /api/admin/login',
    ]
  });
});

/* ============ MENU API ============ */

// GET /api/menu — Barcha menyuni olish
app.get('/api/menu', async (req, res) => {
  try {
    const { category, popular, available } = req.query;
    const filter = {};

    if (category)  filter.category  = category;
    if (popular)   filter.popular   = popular === 'true';
    if (available) filter.available = available === 'true';

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

// POST /api/menu — Yangi taom qo'shish (admin)
app.post('/api/menu', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, emoji, ingredients, popular, available } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Nom, kategoriya va narx majburiy' });
    }

    const item = await MenuItem.create({ name, category, price, emoji, ingredients, popular, available });
    res.status(201).json({ success: true, message: 'Taom qo\'shildi', data: item });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

// PUT /api/menu/:id — Taomni yangilash (admin)
app.put('/api/menu/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Taom topilmadi' });
    res.json({ success: true, message: 'Taom yangilandi', data: item });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

// DELETE /api/menu/:id — Taomni o'chirish (admin)
app.delete('/api/menu/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Taom topilmadi' });
    res.json({ success: true, message: 'Taom o\'chirildi' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

/* ============ ORDERS API ============ */

// POST /api/orders — Yangi buyurtma yaratish
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, deliveryType, note } = req.body;

    // Validatsiya
    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ success: false, message: 'Ism va telefon raqam talab qilinadi' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Savat bo\'sh' });
    }
    if (deliveryType === 'delivery' && !customer.address) {
      return res.status(400).json({ success: false, message: 'Yetkazib berish uchun manzil talab qilinadi' });
    }

    // Narxlarni ma'lumotlar bazasidan tekshirish
    const verifiedItems = [];
    let subtotal = 0;

    for (const orderItem of items) {
      const menuItem = await MenuItem.findById(orderItem.menuItemId).catch(() => null);

      // Agar ID yo'q bo'lsa nomi bo'yicha qidirish
      const dbItem = menuItem || await MenuItem.findOne({ name: orderItem.name });

      if (!dbItem) {
        return res.status(400).json({ success: false, message: `"${orderItem.name}" topilmadi` });
      }
      if (!dbItem.available) {
        return res.status(400).json({ success: false, message: `"${dbItem.name}" hozir mavjud emas` });
      }

      verifiedItems.push({
        menuItemId: dbItem._id,
        name:  dbItem.name,
        price: dbItem.price,
        emoji: dbItem.emoji,
        qty:   orderItem.qty || 1,
      });
      subtotal += dbItem.price * (orderItem.qty || 1);
    }

    const deliveryFee = deliveryType === 'delivery' ? 5000 : 0;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      customer: { ...customer, note },
      items: verifiedItems,
      deliveryType: deliveryType || 'delivery',
      deliveryFee,
      subtotal,
      total,
    });

    // TODO: Telegram bot orqali xabar yuborish
    // await sendTelegramNotification(order);

    res.status(201).json({
      success: true,
      message: 'Buyurtma qabul qilindi!',
      data: {
        orderNum: order.orderNum,
        total:    order.total,
        status:   order.status,
        eta:      order.eta,
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

// GET /api/orders/:orderNum — Buyurtma holatini ko'rish
app.get('/api/orders/:orderNum', async (req, res) => {
  try {
    let { orderNum } = req.params;
    if (!orderNum.startsWith('#')) orderNum = '#' + orderNum;

    const order = await Order.findOne({ orderNum });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
    }

    const statusLabels = {
      new:       { label: 'Qabul qilindi',    step: 1 },
      preparing: { label: 'Tayyorlanmoqda',   step: 2 },
      onway:     { label: "Yo'lda",            step: 3 },
      done:      { label: 'Yetkazildi',        step: 4 },
      cancelled: { label: 'Bekor qilindi',     step: 0 },
    };

    res.json({
      success: true,
      data: {
        orderNum:    order.orderNum,
        status:      order.status,
        statusLabel: statusLabels[order.status]?.label || order.status,
        step:        statusLabels[order.status]?.step || 1,
        eta:         order.eta,
        customer:    { name: order.customer.name },
        items:       order.items,
        total:       order.total,
        deliveryType:order.deliveryType,
        createdAt:   order.createdAt,
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

// GET /api/orders — Admin: Barcha buyurtmalar
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { status, date, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.createdAt = {
        $gte: new Date(d.setHours(0,0,0,0)),
        $lte: new Date(d.setHours(23,59,59,999)),
      };
    }

    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Bugungi statistika
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({ createdAt: { $gte: today } });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      count:  orders.length,
      total,
      page:   parseInt(page),
      pages:  Math.ceil(total / parseInt(limit)),
      stats: {
        todayOrders:  todayOrders.length,
        todayRevenue: todayRevenue,
        pending:      todayOrders.filter(o => o.status !== 'done' && o.status !== 'cancelled').length,
      },
      data: orders,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

// PUT /api/orders/:id/status — Buyurtma statusini o'zgartirish (admin)
app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'preparing', 'onway', 'done', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri status' });
    }

    const stepMap = { new: 1, preparing: 2, onway: 3, done: 4, cancelled: 0 };
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, statusStep: stepMap[status] },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });

    res.json({ success: true, message: 'Status yangilandi', data: { status: order.status, orderNum: order.orderNum } });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

/* ============ ADMIN AUTH API ============ */

// POST /api/admin/login — Admin kirish
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Foydalanuvchi nomi va parol talab qilinadi' });
    }

    // MongoDB bilan
    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      }
      const match = await bcrypt.compare(password, admin.password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Noto\'g\'ri parol' });
      }
    } else {
      // Demo rejim (MongoDB siz)
      if (username !== 'admin' || password !== 'admin123') {
        return res.status(401).json({ success: false, message: 'Noto\'g\'ri login yoki parol' });
      }
    }

    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, message: 'Muvaffaqiyatli kirildi', token, expiresIn: '24h' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

// POST /api/admin/logout — Admin chiqish (token blacklist qilinmagan, client-side)
app.post('/api/admin/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Muvaffaqiyatli chiqildi' });
});

/* ============ STATS API ============ */

// GET /api/stats — Dashboard statistikasi (admin)
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    const todayOrders   = await Order.find({ createdAt: { $gte: today } });
    const weeklyOrders  = await Order.find({ createdAt: { $gte: weekAgo } });
    const totalOrders   = await Order.countDocuments();

    // Top taomlar
    const allOrders = await Order.find({ status: { $ne: 'cancelled' } });
    const itemCounts = {};
    allOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      });
    });
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        today: {
          orders:  todayOrders.length,
          revenue: todayOrders.reduce((s, o) => s + o.total, 0),
          pending: todayOrders.filter(o => !['done','cancelled'].includes(o.status)).length,
        },
        weekly: {
          orders:  weeklyOrders.length,
          revenue: weeklyOrders.reduce((s, o) => s + o.total, 0),
        },
        total: { orders: totalOrders },
        topItems,
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
});

/* ============ HTML SAHIFALAR ============ */
// SPA kabi barcha yo'llarni index.html ga yo'naltirish
const pages = ['menu', 'order', 'track', 'admin', 'contact'];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${page}.html`));
  });
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint topilmadi' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Xato:', err);
  res.status(500).json({ success: false, message: 'Ichki server xatosi' });
});

/* ============================================
   SERVERNI ISHGA TUSHIRISH
   ============================================ */
app.listen(PORT, () => {
  console.log('');
  console.log('  👑  King Shaurma Server');
  console.log('  ========================');
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log(`  🍕  Menyu:   http://localhost:${PORT}/menu`);
  console.log(`  🛒  Buyurtma: http://localhost:${PORT}/order`);
  console.log(`  🔐  Admin:   http://localhost:${PORT}/admin`);
  console.log(`  📡  API:     http://localhost:${PORT}/api`);
  console.log('');
});

module.exports = app;
