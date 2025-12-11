const { createApp } = Vue;

createApp({
  data() {
    return {
      isAuthenticated: false,
      username: '',
      loginForm: {
        username: '',
        password: ''
      },
      loginError: '',
      products: [],
      showAddModal: false,
      showEditModal: false,
      showStockInOutModal: false,
      showLowStockOnly: false,
      selectedProduct: {},
      stockOperation: 'in',
      stockForm: {
        quantity: 1,
        notes: ''
      },
      productForm: {
        id: null,
        sku: '',
        name: '',
        description: '',
        category: '',
        current_stock: 0,
        min_stock: 5
      },
      alertMessage: '',
      alertType: 'success',
      isLoading: false
    };
  },
  computed: {
    filteredProducts() {
      if (this.showLowStockOnly) {
        return this.products.filter(p => p.current_stock <= p.min_stock);
      }
      return this.products;
    },
    lowStockCount() {
      return this.products.filter(p => p.current_stock <= p.min_stock).length;
    }
  },
  mounted() {
    this.checkSession();
  },
  methods: {
    async checkSession() {
      try {
        const response = await fetch('/api/session', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.authenticated) {
          this.isAuthenticated = true;
          this.username = data.username;
          this.loadProducts();
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    },
    async login() {
      try {
        this.loginError = '';
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(this.loginForm)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.isAuthenticated = true;
          this.username = data.username;
          this.loginForm.username = '';
          this.loginForm.password = '';
          this.loadProducts();
        } else {
          this.loginError = data.error || 'ログインに失敗しました';
        }
      } catch (err) {
        this.loginError = 'サーバーエラーが発生しました';
        console.error('Login error:', err);
      }
    },
    async logout() {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'
        });
        this.isAuthenticated = false;
        this.username = '';
        this.products = [];
      } catch (err) {
        console.error('Logout error:', err);
      }
    },
    async loadProducts() {
      try {
        this.isLoading = true;
        const response = await fetch('/api/products', {
          credentials: 'include'
        });
        if (response.ok) {
          this.products = await response.json();
        } else {
          this.showAlert('商品の読み込みに失敗しました', 'error');
        }
      } catch (err) {
        this.showAlert('商品の読み込みに失敗しました', 'error');
        console.error('Load products error:', err);
      } finally {
        this.isLoading = false;
      }
    },
    async saveProduct() {
      // Client-side validation
      if (!this.productForm.sku || !this.productForm.name) {
        this.showAlert('SKUと商品名は必須です', 'error');
        return;
      }
      
      if (this.productForm.sku.trim().length === 0 || this.productForm.name.trim().length === 0) {
        this.showAlert('SKUと商品名は空白のみにできません', 'error');
        return;
      }
      
      if (this.productForm.current_stock < 0 || this.productForm.min_stock < 0) {
        this.showAlert('在庫数は0以上である必要があります', 'error');
        return;
      }
      
      try {
        const url = this.showEditModal 
          ? `/api/products/${this.productForm.id}`
          : '/api/products';
        const method = this.showEditModal ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(this.productForm)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.showAlert(
            this.showEditModal ? '商品を更新しました' : '商品を追加しました',
            'success'
          );
          this.closeModal();
          this.loadProducts();
        } else {
          this.showAlert(data.error || '保存に失敗しました', 'error');
        }
      } catch (err) {
        this.showAlert('サーバーエラーが発生しました', 'error');
        console.error('Save product error:', err);
      }
    },
    editProduct(product) {
      this.productForm = { ...product };
      this.showEditModal = true;
    },
    async deleteProduct(id) {
      if (!confirm('本当にこの商品を削除しますか？')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          this.showAlert('商品を削除しました', 'success');
          this.loadProducts();
        } else {
          const data = await response.json();
          this.showAlert(data.error || '削除に失敗しました', 'error');
        }
      } catch (err) {
        this.showAlert('サーバーエラーが発生しました', 'error');
        console.error('Delete product error:', err);
      }
    },
    showStockModal(product) {
      this.selectedProduct = { ...product };
      this.stockOperation = 'in';
      this.stockForm = {
        quantity: 1,
        notes: ''
      };
      this.showStockInOutModal = true;
    },
    closeStockModal() {
      this.showStockInOutModal = false;
      this.selectedProduct = {};
      this.stockForm = {
        quantity: 1,
        notes: ''
      };
    },
    async submitStockOperation() {
      // Client-side validation
      if (!this.stockForm.quantity || this.stockForm.quantity <= 0) {
        this.showAlert('数量は正の整数である必要があります', 'error');
        return;
      }
      
      if (this.stockForm.quantity > 100000) {
        this.showAlert('数量は100,000以下である必要があります', 'error');
        return;
      }
      
      if (!Number.isInteger(this.stockForm.quantity)) {
        this.showAlert('数量は整数である必要があります', 'error');
        return;
      }
      
      try {
        const endpoint = this.stockOperation === 'in' ? '/api/stock/in' : '/api/stock/out';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            product_id: this.selectedProduct.id,
            quantity: this.stockForm.quantity,
            notes: this.stockForm.notes
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.showAlert(
            this.stockOperation === 'in' 
              ? `${this.stockForm.quantity}個入庫しました` 
              : `${this.stockForm.quantity}個出庫しました`,
            'success'
          );
          this.closeStockModal();
          this.loadProducts();
        } else {
          this.showAlert(data.error || '在庫操作に失敗しました', 'error');
        }
      } catch (err) {
        this.showAlert('サーバーエラーが発生しました', 'error');
        console.error('Stock operation error:', err);
      }
    },
    async exportCSV() {
      try {
        const response = await fetch('/api/export', {
          credentials: 'include'
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `inventory-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.showAlert('CSVファイルをダウンロードしました', 'success');
        } else {
          this.showAlert('エクスポートに失敗しました', 'error');
        }
      } catch (err) {
        this.showAlert('サーバーエラーが発生しました', 'error');
        console.error('Export error:', err);
      }
    },
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.productForm = {
        id: null,
        sku: '',
        name: '',
        description: '',
        category: '',
        current_stock: 0,
        min_stock: 5
      };
    },
    showAlert(message, type = 'success') {
      this.alertMessage = message;
      this.alertType = type;
      setTimeout(() => {
        this.alertMessage = '';
      }, 3000);
    }
  }
}).mount('#app');
