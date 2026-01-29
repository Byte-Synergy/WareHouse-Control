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
      isLoading: false,
      currentPage: 'dashboard',
      stockHistory: [],
      historyLoading: false
    };
  },
  computed: {
    lowStockProducts() {
      return this.products.filter(p => p.current_stock <= p.min_stock);
    },
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
  watch: {
    currentPage(page) {
      if (page === 'history') this.loadStockHistory();
    }
  },
  mounted() {
    this.checkSession();
    this.getCurrentPageFromHash();
    window.addEventListener('hashchange', () => this.getCurrentPageFromHash());
  },
  methods: {
    getCurrentPageFromHash() {
      const hash = (window.location.hash || '#/').slice(1).replace(/^\//, '') || 'dashboard';
      const routes = { '': 'dashboard', products: 'products', alerts: 'alerts', history: 'history' };
      this.currentPage = routes[hash] || 'dashboard';
    },
    async loadStockHistory() {
      try {
        this.historyLoading = true;
        const response = await fetch('/api/stock/history', { credentials: 'include' });
        if (response.ok) {
          this.stockHistory = await response.json();
        } else {
          this.showAlert('Failed to load transaction history', 'error');
        }
      } catch (err) {
        this.showAlert('Failed to load transaction history', 'error');
        console.error('Load stock history error:', err);
      } finally {
        this.historyLoading = false;
      }
    },
    formatDate(str) {
      if (!str) return '—';
      const d = new Date(str.replace(' ', 'T'));
      return isNaN(d.getTime()) ? str : d.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
    },
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
          this.loginError = data.error || 'Login failed';
        }
      } catch (err) {
        this.loginError = 'Server error. Please try again.';
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
          this.showAlert('Failed to load products', 'error');
        }
      } catch (err) {
        this.showAlert('Failed to load products', 'error');
        console.error('Load products error:', err);
      } finally {
        this.isLoading = false;
      }
    },
    async saveProduct() {
      // Client-side validation
      if (!this.productForm.sku || !this.productForm.name) {
        this.showAlert('SKU and product name are required', 'error');
        return;
      }
      
      if (this.productForm.sku.trim().length === 0 || this.productForm.name.trim().length === 0) {
        this.showAlert('SKU and product name cannot be blank', 'error');
        return;
      }
      
      if (this.productForm.current_stock < 0 || this.productForm.min_stock < 0) {
        this.showAlert('Stock values must be 0 or greater', 'error');
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
            this.showEditModal ? 'Product updated' : 'Product added',
            'success'
          );
          this.closeModal();
          this.loadProducts();
        } else {
          this.showAlert(data.error || 'Save failed', 'error');
        }
      } catch (err) {
        this.showAlert('Server error. Please try again.', 'error');
        console.error('Save product error:', err);
      }
    },
    editProduct(product) {
      this.productForm = { ...product };
      this.showEditModal = true;
    },
    async deleteProduct(id) {
      if (!confirm('Are you sure you want to delete this product?')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          this.showAlert('Product deleted', 'success');
          this.loadProducts();
        } else {
          const data = await response.json();
          this.showAlert(data.error || 'Delete failed', 'error');
        }
      } catch (err) {
        this.showAlert('Server error. Please try again.', 'error');
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
        this.showAlert('Quantity must be a positive integer', 'error');
        return;
      }
      
      if (this.stockForm.quantity > 100000) {
        this.showAlert('Quantity must be 100,000 or less', 'error');
        return;
      }
      
      if (!Number.isInteger(this.stockForm.quantity)) {
        this.showAlert('Quantity must be a whole number', 'error');
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
              ? `${this.stockForm.quantity} added (stock in)` 
              : `${this.stockForm.quantity} removed (stock out)`,
            'success'
          );
          this.closeStockModal();
          this.loadProducts();
          if (this.currentPage === 'history') this.loadStockHistory();
        } else {
          this.showAlert(data.error || 'Stock operation failed', 'error');
        }
      } catch (err) {
        this.showAlert('Server error. Please try again.', 'error');
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
          this.showAlert('CSV downloaded', 'success');
        } else {
          this.showAlert('Export failed', 'error');
        }
      } catch (err) {
        this.showAlert('Server error. Please try again.', 'error');
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
