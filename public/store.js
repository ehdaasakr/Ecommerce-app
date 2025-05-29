
// نظام إدارة المتجر الإلكتروني

class StoreManager {
    constructor() {
        this.currentUser = null;
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.editingProduct = null;
        this.editingOrder = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLoginStatus();
        this.addSampleData();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // تسجيل الدخول
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // تسجيل الخروج
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // التنقل بين الأقسام
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // إدارة المنتجات
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showProductModal();
        });

        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        document.getElementById('closeProductModal').addEventListener('click', () => {
            this.hideProductModal();
        });

        document.getElementById('cancelProduct').addEventListener('click', () => {
            this.hideProductModal();
        });

        // إدارة الطلبات
        document.getElementById('addOrderBtn').addEventListener('click', () => {
            this.showOrderModal();
        });

        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrder();
        });

        document.getElementById('closeOrderModal').addEventListener('click', () => {
            this.hideOrderModal();
        });

        document.getElementById('cancelOrder').addEventListener('click', () => {
            this.hideOrderModal();
        });

        // تحديث السعر الإجمالي للطلب
        document.getElementById('orderProduct').addEventListener('change', () => {
            this.updateOrderTotal();
        });

        document.getElementById('orderQuantity').addEventListener('input', () => {
            this.updateOrderTotal();
        });

        // إغلاق النوافذ المنبثقة عند النقر خارجها
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }

    // إضافة بيانات تجريبية
    addSampleData() {
        if (this.products.length === 0) {
            const sampleProducts = [
                {
                    id: 1,
                    name: 'لابتوب ديل',
                    price: 2500,
                    description: 'لابتوب عالي الأداء مناسب للألعاب والبرمجة',
                    category: 'electronics'
                },
                {
                    id: 2,
                    name: 'قميص قطني',
                    price: 120,
                    description: 'قميص قطني عالي الجودة ومريح',
                    category: 'clothing'
                },
                {
                    id: 3,
                    name: 'كتاب البرمجة',
                    price: 85,
                    description: 'كتاب شامل لتعلم البرمجة باللغة العربية',
                    category: 'books'
                }
            ];
            
            this.products = sampleProducts;
            this.saveToStorage('products', this.products);
        }

        if (this.orders.length === 0) {
            const sampleOrders = [
                {
                    id: 1,
                    customerName: 'أحمد محمد',
                    customerEmail: 'ahmed@example.com',
                    productId: 1,
                    productName: 'لابتوب ديل',
                    quantity: 1,
                    unitPrice: 2500,
                    total: 2500,
                    date: new Date().toISOString()
                }
            ];
            
            this.orders = sampleOrders;
            this.saveToStorage('orders', this.orders);
        }
    }

    // التحقق من حالة تسجيل الدخول
    checkLoginStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainScreen();
        } else {
            this.showLoginScreen();
        }
    }

    // تسجيل الدخول
    handleLogin() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // التحقق من صحة البيانات
        if (!username || !email || !password) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        if (password.length < 6) {
            this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        // إنشاء أو تحديث المستخدم
        const user = {
            username,
            email,
            password,
            loginDate: new Date().toISOString()
        };

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));

        // إضافة المستخدم إلى قائمة المستخدمين إذا لم يكن موجوداً
        const existingUser = this.users.find(u => u.email === email);
        if (!existingUser) {
            this.users.push(user);
            this.saveToStorage('users', this.users);
        }

        this.showMainScreen();
    }

    // تسجيل الخروج
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLoginScreen();
    }

    // عرض شاشة تسجيل الدخول
    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('mainScreen').classList.remove('active');
        this.clearLoginForm();
    }

    // عرض الشاشة الرئيسية
    showMainScreen() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        
        document.getElementById('welcomeUser').textContent = `مرحباً، ${this.currentUser.username}`;
        
        this.displayProducts();
        this.displayOrders();
        this.updateStats();
        this.updateOrderProductOptions();
    }

    // التبديل بين الأقسام
    switchSection(section) {
        // إزالة الفئة النشطة من جميع الأزرار والأقسام
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));

        // إضافة الفئة النشطة للزر والقسم المحدد
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        document.getElementById(`${section}Section`).classList.add('active');

        // تحديث البيانات عند التبديل
        if (section === 'products') {
            this.displayProducts();
        } else if (section === 'orders') {
            this.displayOrders();
        } else if (section === 'stats') {
            this.updateStats();
        }
    }

    // عرض المنتجات
    displayProducts() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '';

        if (this.products.length === 0) {
            grid.innerHTML = '<div class="no-data">لا توجد منتجات بعد. اضغط على "إضافة منتج جديد" للبدء.</div>';
            return;
        }

        this.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card fade-in';
            productCard.innerHTML = `
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${product.price} ر.س</div>
                    <p class="product-description">${product.description || 'لا يوجد وصف'}</p>
                    <span class="product-category">${this.getCategoryName(product.category)}</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="storeManager.editProduct(${product.id})">
                        ✏️ تعديل
                    </button>
                    <button class="btn btn-danger btn-small" onclick="storeManager.deleteProduct(${product.id})">
                        🗑️ حذف
                    </button>
                </div>
            `;
            grid.appendChild(productCard);
        });
    }

    // عرض الطلبات
    displayOrders() {
        const list = document.getElementById('ordersList');
        list.innerHTML = '';

        if (this.orders.length === 0) {
            list.innerHTML = '<div class="no-data">لا توجد طلبات بعد. اضغط على "إضافة طلب جديد" للبدء.</div>';
            return;
        }

        this.orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card fade-in';
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-info">
                        <h3>طلب #${order.id}</h3>
                        <div class="order-details">
                            <p><strong>العميل:</strong> ${order.customerName}</p>
                            <p><strong>البريد الإلكتروني:</strong> ${order.customerEmail}</p>
                            <p><strong>المنتج:</strong> ${order.productName}</p>
                            <p><strong>الكمية:</strong> ${order.quantity}</p>
                            <p><strong>السعر لكل وحدة:</strong> ${order.unitPrice} ر.س</p>
                            <p><strong>تاريخ الطلب:</strong> ${new Date(order.date).toLocaleDateString('ar-SA')}</p>
                        </div>
                    </div>
                    <div class="order-total">
                        ${order.total} ر.س
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-primary btn-small" onclick="storeManager.editOrder(${order.id})">
                        ✏️ تعديل
                    </button>
                    <button class="btn btn-danger btn-small" onclick="storeManager.deleteOrder(${order.id})">
                        🗑️ حذف
                    </button>
                </div>
            `;
            list.appendChild(orderCard);
        });
    }

    // تحديث الإحصائيات
    updateStats() {
        document.getElementById('productsCount').textContent = this.products.length;
        document.getElementById('ordersCount').textContent = this.orders.length;
        
        const totalSales = this.orders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('totalSales').textContent = `${totalSales} ر.س`;
        
        document.getElementById('activeUsers').textContent = this.users.length;
    }

    // إظهار نافذة المنتج
    showProductModal(product = null) {
        this.editingProduct = product;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        
        if (product) {
            title.textContent = 'تعديل المنتج';
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productCategory').value = product.category;
        } else {
            title.textContent = 'إضافة منتج جديد';
            document.getElementById('productForm').reset();
        }
        
        modal.classList.add('active');
    }

    // إخفاء نافذة المنتج
    hideProductModal() {
        document.getElementById('productModal').classList.remove('active');
        this.editingProduct = null;
    }

    // حفظ المنتج
    saveProduct() {
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const description = document.getElementById('productDescription').value;
        const category = document.getElementById('productCategory').value;

        if (!name || !price || !category) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (this.editingProduct) {
            // تعديل منتج موجود
            const index = this.products.findIndex(p => p.id === this.editingProduct.id);
            this.products[index] = {
                ...this.editingProduct,
                name,
                price,
                description,
                category
            };
        } else {
            // إضافة منتج جديد
            const newProduct = {
                id: Date.now(),
                name,
                price,
                description,
                category
            };
            this.products.push(newProduct);
        }

        this.saveToStorage('products', this.products);
        this.hideProductModal();
        this.displayProducts();
        this.updateStats();
        this.updateOrderProductOptions();
    }

    // تعديل منتج
    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.showProductModal(product);
        }
    }

    // حذف منتج
    deleteProduct(id) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            this.products = this.products.filter(p => p.id !== id);
            this.saveToStorage('products', this.products);
            this.displayProducts();
            this.updateStats();
            this.updateOrderProductOptions();
        }
    }

    // إظهار نافذة الطلب
    showOrderModal(order = null) {
        this.editingOrder = order;
        const modal = document.getElementById('orderModal');
        const title = document.getElementById('orderModalTitle');
        
        if (order) {
            title.textContent = 'تعديل الطلب';
            document.getElementById('customerName').value = order.customerName;
            document.getElementById('customerEmail').value = order.customerEmail;
            document.getElementById('orderProduct').value = order.productId;
            document.getElementById('orderQuantity').value = order.quantity;
            this.updateOrderTotal();
        } else {
            title.textContent = 'إضافة طلب جديد';
            document.getElementById('orderForm').reset();
            document.getElementById('orderQuantity').value = 1;
            this.updateOrderTotal();
        }
        
        modal.classList.add('active');
    }

    // إخفاء نافذة الطلب
    hideOrderModal() {
        document.getElementById('orderModal').classList.remove('active');
        this.editingOrder = null;
    }

    // تحديث خيارات المنتجات في الطلب
    updateOrderProductOptions() {
        const select = document.getElementById('orderProduct');
        select.innerHTML = '<option value="">اختر المنتج</option>';
        
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price} ر.س`;
            select.appendChild(option);
        });
    }

    // تحديث السعر الإجمالي للطلب
    updateOrderTotal() {
        const productId = document.getElementById('orderProduct').value;
        const quantity = parseInt(document.getElementById('orderQuantity').value) || 0;
        const totalDiv = document.getElementById('orderTotal');
        
        if (productId && quantity > 0) {
            const product = this.products.find(p => p.id == productId);
            if (product) {
                const total = product.price * quantity;
                totalDiv.textContent = `${total} ر.س`;
                return;
            }
        }
        
        totalDiv.textContent = '0 ر.س';
    }

    // حفظ الطلب
    saveOrder() {
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const productId = parseInt(document.getElementById('orderProduct').value);
        const quantity = parseInt(document.getElementById('orderQuantity').value);

        if (!customerName || !customerEmail || !productId || !quantity) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (!this.isValidEmail(customerEmail)) {
            alert('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            alert('المنتج المحدد غير موجود');
            return;
        }

        const total = product.price * quantity;

        if (this.editingOrder) {
            // تعديل طلب موجود
            const index = this.orders.findIndex(o => o.id === this.editingOrder.id);
            this.orders[index] = {
                ...this.editingOrder,
                customerName,
                customerEmail,
                productId,
                productName: product.name,
                quantity,
                unitPrice: product.price,
                total
            };
        } else {
            // إضافة طلب جديد
            const newOrder = {
                id: Date.now(),
                customerName,
                customerEmail,
                productId,
                productName: product.name,
                quantity,
                unitPrice: product.price,
                total,
                date: new Date().toISOString()
            };
            this.orders.push(newOrder);
        }

        this.saveToStorage('orders', this.orders);
        this.hideOrderModal();
        this.displayOrders();
        this.updateStats();
    }

    // تعديل طلب
    editOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            this.showOrderModal(order);
        }
    }

    // حذف طلب
    deleteOrder(id) {
        if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
            this.orders = this.orders.filter(o => o.id !== id);
            this.saveToStorage('orders', this.orders);
            this.displayOrders();
            this.updateStats();
        }
    }

    // حفظ البيانات في localStorage
    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // التحقق من صحة البريد الإلكتروني
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // الحصول على اسم الفئة
    getCategoryName(category) {
        const categories = {
            'electronics': 'إلكترونيات',
            'clothing': 'ملابس',
            'books': 'كتب',
            'home': 'المنزل والحديقة',
            'sports': 'رياضة'
        };
        return categories[category] || category;
    }

    // عرض رسالة خطأ
    showError(message) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // مسح نموذج تسجيل الدخول
    clearLoginForm() {
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').style.display = 'none';
    }
}

// تشغيل التطبيق عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    window.storeManager = new StoreManager();
});

// إضافة CSS للعناصر المفقودة
const style = document.createElement('style');
style.textContent = `
    .no-data {
        text-align: center;
        padding: 3rem;
        color: #666;
        font-size: 1.1rem;
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);
