// Main Application Class
class ShoppingApp {
    constructor() {
        this.apiService = new APIService();
        this.dataManager = new DataManager();
        this.currentProducts = [];
        this.currentView = 'search';
        this.loading = false;

        // Components
        this.searchComponent = null;
        this.productCard = null;
        this.tabsComponent = null;
        this.loadingComponent = null;

        // Make instances available globally
        window.app = this;
        window.dataManager = this.dataManager;
        window.currentProducts = this.currentProducts;

        this.init();
    }

    async init() {
        try {
            // Initialize API service
            this.apiService.init();

            // Initialize components
            this.initializeComponents();

            // Set up event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadInitialData();

            // Setup auto-refresh
            this.setupAutoRefresh();

            console.log('Shopping App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application');
        }
    }

    initializeComponents() {
        // Initialize Search Component
        const searchContainer = document.getElementById('searchComponent');
        if (searchContainer) {
            this.searchComponent = new SearchComponent(searchContainer);
            window.searchComponent = this.searchComponent;
        }

        // Initialize Loading Component
        const loadingContainer = document.getElementById('loadingComponent');
        if (loadingContainer) {
            this.loadingComponent = new LoadingComponent(loadingContainer);
        }

        // Initialize Tabs Component
        const tabsContainer = document.getElementById('tabsComponent');
        if (tabsContainer) {
            this.tabsComponent = new TabsComponent(tabsContainer);
            this.tabsComponent.onTabChange = (tabName) => this.handleTabChange(tabName);
        }

        // Initialize Product Cards (will be created dynamically)
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            this.productCard = new ProductCard(productsGrid);
        }
    }

    setupEventListeners() {
        // Data change listener
        window.addEventListener('dataChanged', (event) => {
            this.handleDataChange(event.detail);
        });

        // Network status
        window.addEventListener('online', () => {
            this.handleNetworkStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleNetworkStatusChange(false);
        });

        // Page visibility (for pause/resume functionality)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseApp();
            } else {
                this.resumeApp();
            }
        });

        // URL hash changes (for deep linking)
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    async loadInitialData() {
        this.showLoading('Loading products...');

        try {
            // Load trending products initially
            this.currentProducts = await this.apiService.getTrendingProducts(20);
            window.currentProducts = this.currentProducts;

            // Render products
            if (this.productCard && this.currentProducts.length > 0) {
                this.productCard.render(this.currentProducts);
                this.productCard.animateIn();
            }

            // Update UI
            this.updateResultsCount(this.currentProducts.length);

        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load products');
        } finally {
            this.hideLoading();
        }
    }

    async performSearch(query, filters = {}) {
        if (this.loading) return;

        this.showLoading(`Searching for "${query}"...`);
        this.loading = true;

        try {
            // Perform search
            let products = await this.apiService.searchProducts(query, 30);

            // Apply filters
            products = this.applyClientSideFilters(products, filters);

            // Update current products
            this.currentProducts = products;
            window.currentProducts = this.currentProducts;

            // Update search history
            this.dataManager.addToSearchHistory(query);

            // Render results
            if (this.productCard) {
                this.productCard.animateOut(() => {
                    this.productCard.render(products);
                    this.productCard.animateIn();
                });
            }

            // Update UI
            this.updateResultsCount(products.length);
            this.switchToTab('search');

            // Track search
            this.trackSearch(query, products.length);

        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed. Please try again.');
        } finally {
            this.hideLoading();
            this.loading = false;
        }
    }

    applyClientSideFilters(products, filters) {
        let filtered = [...products];

        // Category filter
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(product =>
                product.category.toLowerCase().includes(filters.category.toLowerCase())
            );
        }

        // Price range filter
        if (filters.minPrice > 0) {
            filtered = filtered.filter(product => product.price >= filters.minPrice);
        }
        if (filters.maxPrice < 10000) {
            filtered = filtered.filter(product => product.price <= filters.maxPrice);
        }

        // Rating filter
        if (filters.minRating > 0) {
            filtered = filtered.filter(product =>
                (product.rating?.rate || 0) >= filters.minRating
            );
        }

        // In stock filter
        if (filters.inStock) {
            filtered = filtered.filter(product =>
                !product.availability || product.availability.includes('Stock')
            );
        }

        // Sort products
        filtered = this.sortProducts(filtered, filters.sortBy || 'relevance');

        return filtered;
    }

    sortProducts(products, sortBy) {
        return products.sort((a, b) => {
            switch (sortBy) {
                case 'price_low':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price_high':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'rating':
                    return (b.rating?.rate || 0) - (a.rating?.rate || 0);
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'discount':
                    return (b.discount || 0) - (a.discount || 0);
                case 'relevance':
                default:
                    return 0;
            }
        });
    }

    applyFilters(filters) {
        if (this.currentProducts.length === 0) return;

        const filtered = this.applyClientSideFilters(this.currentProducts, filters);

        if (this.productCard) {
            this.productCard.animateOut(() => {
                this.productCard.render(filtered);
                this.productCard.animateIn();
            });
        }

        this.updateResultsCount(filtered.length);
    }

    clearSearch() {
        this.currentProducts = [];
        window.currentProducts = this.currentProducts;

        if (this.productCard) {
            this.productCard.render([]);
        }

        this.updateResultsCount(0);
        this.loadInitialData(); // Load trending products
    }

    handleTabChange(tabName) {
        this.currentView = tabName;

        switch (tabName) {
            case 'search':
                this.renderSearchResults();
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            case 'compare':
                this.renderCompareItems();
                break;
            default:
                console.warn('Unknown tab:', tabName);
        }

        // Update URL hash
        window.location.hash = tabName;
    }

    renderSearchResults() {
        if (this.productCard && this.currentProducts) {
            this.productCard.render(this.currentProducts, { showActions: true });
        }
    }

    renderFavorites() {
        const favorites = this.dataManager.getFavorites();
        const favoriteGrid = document.getElementById('favoritesGrid');

        if (favoriteGrid) {
            const favoritesCard = new ProductCard(favoriteGrid);
            favoritesCard.render(favorites, {
                showActions: true,
                showComparison: false
            });
        }
    }

    renderCompareItems() {
        const compareItems = this.dataManager.getCompareItems();
        const compareGrid = document.getElementById('compareGrid');

        if (compareGrid) {
            const compareCard = new ProductCard(compareGrid);
            compareCard.render(compareItems, {
                showActions: false,
                showComparison: true
            });
        }
    }

    switchToTab(tabName) {
        if (this.tabsComponent) {
            this.tabsComponent.switchTab(tabName);
        }
    }

    showProductDetails(productId) {
        const product = this.findProductById(productId);
        if (!product) return;

        // Add to recently viewed
        this.dataManager.addToRecentlyViewed(product);

        // Show product details modal
        this.showProductModal(product);
    }

    showProductModal(product) {
        // Create and show product details modal
        const modal = document.createElement('div');
        modal.className = 'product-modal-overlay';
        modal.innerHTML = `
            <div class="product-modal">
                <div class="modal-header">
                    <h2>${product.title}</h2>
                    <button class="modal-close" onclick="this.closest('.product-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="product-details">
                        <img src="${product.image}" alt="${product.title}" class="modal-product-image">
                        <div class="product-info-detailed">
                            <div class="price-section">
                                <div class="current-price">$${product.price}</div>
                                ${product.originalPrice ? `<div class="original-price">$${product.originalPrice}</div>` : ''}
                            </div>
                            <div class="rating-section">
                                ${this.generateStars(product.rating?.rate || 0)}
                                <span>(${product.rating?.count || 0} reviews)</span>
                            </div>
                            <div class="description">
                                <p>${product.description || 'No description available.'}</p>
                            </div>
                            ${product.storeOffers ? this.renderStoreOffers(product.storeOffers) : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn" onclick="toggleFavorite('${product.id}')">
                        <i class="fas fa-heart"></i>
                        ${this.dataManager.isFavorite(product.id) ? 'Remove from' : 'Add to'} Favorites
                    </button>
                    <button class="btn btn-outline" onclick="toggleCompare('${product.id}')">
                        <i class="fas fa-balance-scale"></i>
                        ${this.dataManager.isInCompare(product.id) ? 'Remove from' : 'Add to'} Compare
                    </button>
                    <button class="btn btn-outline" onclick="setPriceAlert('${product.id}')">
                        <i class="fas fa-bell"></i>
                        Set Price Alert
                    </button>
                </div>
            </div>
        `;

        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    showQuickView(productId) {
        // Similar to showProductDetails but in a smaller modal
        const product = this.findProductById(productId);
        if (!product) return;

        // Show quick preview
        this.showProductModal(product); // For now, use same modal
    }

    renderStoreOffers(offers) {
        return `
            <div class="store-offers-section">
                <h4>Price Comparison</h4>
                <div class="offers-list">
                    ${offers.map(offer => `
                        <div class="offer-item">
                            <span class="store-name">${offer.store}</span>
                            <span class="offer-price">$${offer.price}</span>
                            <span class="availability">${offer.availability}</span>
                            <span class="shipping">${offer.shipping}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    refreshCurrentView() {
        switch (this.currentView) {
            case 'search':
                this.renderSearchResults();
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            case 'compare':
                this.renderCompareItems();
                break;
        }
    }

    // Complete the findProductById function
    findProductById(id) {
        return this.currentProducts.find(product => product.id.toString() === id.toString()) ||
            this.dataManager.getFavorites().find(product => product.id.toString() === id.toString()) ||
            this.dataManager.getCompareItems().find(product => product.id.toString() === id.toString());
    }

    // Helper Methods
    showLoading(message = 'Loading...') {
        if (this.loadingComponent) {
            this.loadingComponent.show(message);
        } else {
            // Fallback loading display
            const loadingEl = document.querySelector('.loading-indicator');
            if (loadingEl) {
                loadingEl.textContent = message;
                loadingEl.style.display = 'block';
            }
        }
    }

    hideLoading() {
        if (this.loadingComponent) {
            this.loadingComponent.hide();
        } else {
            const loadingEl = document.querySelector('.loading-indicator');
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
        }
    }

    showError(message) {
        // Create error notification
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error-notification';
        errorNotification.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button class="close-error" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Style the notification
        errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10001;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(errorNotification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create success notification
        const successNotification = document.createElement('div');
        successNotification.className = 'success-notification';
        successNotification.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button class="close-success" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Style the notification
        successNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10001;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(successNotification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (successNotification.parentNode) {
                successNotification.remove();
            }
        }, 3000);
    }

    updateResultsCount(count) {
        const counterElement = document.querySelector('.results-count');
        if (counterElement) {
            counterElement.textContent = `${count} products found`;
        }
    }

    // Event Handlers
    handleDataChange(data) {
        console.log('Data changed:', data);
        this.refreshCurrentView();
    }

    handleNetworkStatusChange(isOnline) {
        const statusIndicator = document.querySelector('.network-status');
        if (statusIndicator) {
            statusIndicator.className = `network-status ${isOnline ? 'online' : 'offline'}`;
            statusIndicator.textContent = isOnline ? 'Online' : 'Offline';
        }

        if (!isOnline) {
            this.showError('You are offline. Some features may not work.');
        }
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && ['search', 'favorites', 'compare'].includes(hash)) {
            this.switchToTab(hash);
        }
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K for search focus
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals
        if (event.key === 'Escape') {
            const modal = document.querySelector('.product-modal-overlay');
            if (modal) {
                modal.remove();
            }
        }
    }

    pauseApp() {
        console.log('App paused');
        // Stop auto-refresh or any background processes
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    resumeApp() {
        console.log('App resumed');
        // Restart auto-refresh
        this.setupAutoRefresh();
    }

    setupAutoRefresh() {
        // Auto refresh trending products every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (this.currentView === 'search' && this.currentProducts.length === 0) {
                this.loadInitialData();
            }
        }, 5 * 60 * 1000);
    }

    trackSearch(query, resultCount) {
        // Analytics tracking
        console.log(`Search tracked: "${query}" - ${resultCount} results`);

        // You can integrate with analytics services here
        if (window.gtag) {
            window.gtag('event', 'search', {
                search_term: query,
                result_count: resultCount
            });
        }
    }

    // Utility Methods for Global Functions
    toggleFavorite(productId) {
        const product = this.findProductById(productId);
        if (!product) return;

        if (this.dataManager.isFavorite(productId)) {
            this.dataManager.removeFromFavorites(productId);
            this.showSuccess('Removed from favorites');
        } else {
            this.dataManager.addToFavorites(product);
            this.showSuccess('Added to favorites');
        }

        this.refreshCurrentView();
    }

    toggleCompare(productId) {
        const product = this.findProductById(productId);
        if (!product) return;

        if (this.dataManager.isInCompare(productId)) {
            this.dataManager.removeFromCompare(productId);
            this.showSuccess('Removed from comparison');
        } else {
            if (this.dataManager.getCompareItems().length >= 4) {
                this.showError('You can compare up to 4 products only');
                return;
            }
            this.dataManager.addToCompare(product);
            this.showSuccess('Added to comparison');
        }

        this.refreshCurrentView();
    }

    setPriceAlert(productId) {
        const product = this.findProductById(productId);
        if (!product) return;

        // Create price alert modal
        const modal = document.createElement('div');
        modal.className = 'price-alert-modal-overlay';
        modal.innerHTML = `
            <div class="price-alert-modal">
                <div class="modal-header">
                    <h3>Set Price Alert</h3>
                    <button class="modal-close" onclick="this.closest('.price-alert-modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Get notified when <strong>${product.title}</strong> drops below your target price.</p>
                    <div class="current-price-info">
                        Current Price: <strong>$${product.price}</strong>
                    </div>
                    <div class="price-input-group">
                        <label for="targetPrice">Target Price ($):</label>
                        <input type="number" id="targetPrice" placeholder="Enter target price" 
                               max="${product.price * 0.95}" step="0.01" class="price-input">
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="this.closest('.price-alert-modal-overlay').remove()">Cancel</button>
                    <button class="btn" onclick="app.createPriceAlert('${productId}', document.getElementById('targetPrice').value)">
                        Set Alert
                    </button>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        document.body.appendChild(modal);
    }

    createPriceAlert(productId, targetPrice) {
        const product = this.findProductById(productId);
        if (!product || !targetPrice) {
            this.showError('Invalid price alert data');
            return;
        }

        const price = parseFloat(targetPrice);
        if (price >= product.price) {
            this.showError('Target price must be lower than current price');
            return;
        }

        // Save price alert
        this.dataManager.addPriceAlert({
            productId: productId,
            productTitle: product.title,
            currentPrice: product.price,
            targetPrice: price,
            createdAt: new Date().toISOString()
        });

        this.showSuccess(`Price alert set for $${price}`);

        // Close modal
        const modal = document.querySelector('.price-alert-modal-overlay');
        if (modal) {
            modal.remove();
        }
    }
}

// Global helper functions
function toggleFavorite(productId) {
    if (window.app) {
        window.app.toggleFavorite(productId);
    }
}

function toggleCompare(productId) {
    if (window.app) {
        window.app.toggleCompare(productId);
    }
}

function setPriceAlert(productId) {
    if (window.app) {
        window.app.setPriceAlert(productId);
    }
}

function showProductDetails(productId) {
    if (window.app) {
        window.app.showProductDetails(productId);
    }
}

function showQuickView(productId) {
    if (window.app) {
        window.app.showQuickView(productId);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingApp = new ShoppingApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingApp;
}