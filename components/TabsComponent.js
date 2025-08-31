class TabsComponent {
    constructor(container) {
        this.container = container;
        this.activeTab = 'search';
        this.tabs = {
            search: {
                name: 'Search Results',
                icon: 'fas fa-search',
                content: null,
                badge: null
            },
            favorites: {
                name: 'Favorites',
                icon: 'fas fa-heart',
                content: null,
                badge: 0
            },
            compare: {
                name: 'Compare',
                icon: 'fas fa-balance-scale',
                content: null,
                badge: 0
            },
            history: {
                name: 'Recently Viewed',
                icon: 'fas fa-history',
                content: null,
                badge: null
            },
            alerts: {
                name: 'Price Alerts',
                icon: 'fas fa-bell',
                content: null,
                badge: 0
            }
        };

        this.onTabChange = null;
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.updateBadges();
    }

    render() {
        this.container.innerHTML = `
            <div class="tabs">
                ${this.renderTabButtons()}
                ${this.renderTabContent()}
            </div>
        `;
    }

    renderTabButtons() {
        return `
            <div class="tab-buttons">
                ${Object.entries(this.tabs).map(([tabId, tab]) => `
                    <button class="tab-btn ${this.activeTab === tabId ? 'active' : ''}" 
                            data-tab="${tabId}"
                            title="${tab.name}">
                        <i class="${tab.icon}"></i>
                        <span class="tab-text">${tab.name}</span>
                        ${tab.badge !== null && tab.badge > 0 ? `
                            <span class="tab-badge" id="badge-${tabId}">${tab.badge}</span>
                        ` : ''}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderTabContent() {
        return `
            <div class="tab-content">
                ${Object.keys(this.tabs).map(tabId => `
                    <div class="tab-pane ${this.activeTab === tabId ? 'active' : ''}" 
                         id="tab-${tabId}">
                        ${this.renderTabPaneContent(tabId)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTabPaneContent(tabId) {
        switch (tabId) {
            case 'search':
                return this.renderSearchTab();
            case 'favorites':
                return this.renderFavoritesTab();
            case 'compare':
                return this.renderCompareTab();
            case 'history':
                return this.renderHistoryTab();
            case 'alerts':
                return this.renderAlertsTab();
            default:
                return '<div class="tab-placeholder">Content loading...</div>';
        }
    }

    renderSearchTab() {
        return `
            <div class="search-results-container">
                <div class="results-header">
                    <div class="results-info">
                        <h3>Search Results</h3>
                        <span class="results-count" id="resultsCount">0 products found</span>
                    </div>
                    <div class="results-controls">
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="grid" title="Grid View">
                                <i class="fas fa-th-large"></i>
                            </button>
                            <button class="view-btn" data-view="list" title="List View">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <select class="sort-select" id="sortSelect">
                            <option value="relevance">Sort by Relevance</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating">Customer Rating</option>
                            <option value="discount">Discount %</option>
                        </select>
                    </div>
                </div>
                <div class="products-grid" id="searchProductsGrid">
                    <!-- Products will be rendered here -->
                </div>
                <div class="search-empty-state" id="searchEmptyState" style="display: none;">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms or filters to find what you're looking for.</p>
                    <button class="btn btn-outline" onclick="clearAllFilters()">
                        <i class="fas fa-refresh"></i>
                        Clear All Filters
                    </button>
                </div>
            </div>
        `;
    }

    renderFavoritesTab() {
        return `
            <div class="favorites-container">
                <div class="favorites-header">
                    <h3>
                        <i class="fas fa-heart"></i>
                        Your Favorites
                    </h3>
                    <div class="favorites-controls">
                        <button class="btn btn-outline btn-small" onclick="clearAllFavorites()" id="clearFavoritesBtn">
                            <i class="fas fa-trash"></i>
                            Clear All
                        </button>
                        <button class="btn btn-outline btn-small" onclick="exportFavorites()">
                            <i class="fas fa-download"></i>
                            Export
                        </button>
                    </div>
                </div>
                <div class="products-grid" id="favoritesGrid">
                    <!-- Favorite products will be rendered here -->
                </div>
                <div class="favorites-empty-state" id="favoritesEmptyState">
                    <div class="empty-icon">
                        <i class="fas fa-heart-broken"></i>
                    </div>
                    <h3>No favorites yet</h3>
                    <p>Start adding products to your favorites by clicking the heart icon on any product.</p>
                    <button class="btn" onclick="switchToSearchTab()">
                        <i class="fas fa-search"></i>
                        Browse Products
                    </button>
                </div>
            </div>
        `;
    }

    renderCompareTab() {
        return `
            <div class="compare-container">
                <div class="compare-header">
                    <h3>
                        <i class="fas fa-balance-scale"></i>
                        Product Comparison
                    </h3>
                    <div class="compare-info">
                        <span class="compare-count" id="compareCount">0 of 4 products</span>
                        <button class="btn btn-outline btn-small" onclick="clearComparison()" id="clearCompareBtn">
                            <i class="fas fa-times"></i>
                            Clear All
                        </button>
                    </div>
                </div>
                <div class="compare-grid" id="compareGrid">
                    <!-- Comparison products will be rendered here -->
                </div>
                <div class="compare-empty-state" id="compareEmptyState">
                    <div class="empty-icon">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <h3>No products to compare</h3>
                    <p>Add products to comparison by clicking the compare button. You can compare up to 4 products at once.</p>
                    <button class="btn" onclick="switchToSearchTab()">
                        <i class="fas fa-search"></i>
                        Find Products
                    </button>
                </div>
                <div class="comparison-table" id="comparisonTable" style="display: none;">
                    <!-- Detailed comparison table will be shown here -->
                </div>
            </div>
        `;
    }

    renderHistoryTab() {
        return `
            <div class="history-container">
                <div class="history-header">
                    <h3>
                        <i class="fas fa-history"></i>
                        Recently Viewed
                    </h3>
                    <div class="history-controls">
                        <button class="btn btn-outline btn-small" onclick="clearHistory()">
                            <i class="fas fa-trash"></i>
                            Clear History
                        </button>
                    </div>
                </div>
                <div class="history-timeline">
                    <div class="products-grid" id="historyGrid">
                        <!-- Recently viewed products will be rendered here -->
                    </div>
                </div>
                <div class="history-empty-state" id="historyEmptyState">
                    <div class="empty-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3>No recent activity</h3>
                    <p>Products you view will appear here for easy access.</p>
                    <button class="btn" onclick="switchToSearchTab()">
                        <i class="fas fa-search"></i>
                        Start Browsing
                    </button>
                </div>
            </div>
        `;
    }

    renderAlertsTab() {
        return `
            <div class="alerts-container">
                <div class="alerts-header">
                    <h3>
                        <i class="fas fa-bell"></i>
                        Price Alerts
                    </h3>
                    <div class="alerts-controls">
                        <button class="btn btn-outline btn-small" onclick="createPriceAlert()">
                            <i class="fas fa-plus"></i>
                            New Alert
                        </button>
                    </div>
                </div>
                <div class="alerts-list" id="alertsList">
                    <!-- Price alerts will be rendered here -->
                </div>
                <div class="alerts-empty-state" id="alertsEmptyState">
                    <div class="empty-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <h3>No price alerts set</h3>
                    <p>Create price alerts to be notified when products drop to your target price.</p>
                    <button class="btn" onclick="createPriceAlert()">
                        <i class="fas fa-bell"></i>
                        Create Alert
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Tab button clicks
        const tabButtons = this.container.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // View toggle buttons
        const viewButtons = this.container.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Sort select
        const sortSelect = this.container.querySelector('#sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // Data change listeners
        window.addEventListener('dataChanged', (event) => {
            this.handleDataChange(event.detail);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('search');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('favorites');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('compare');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('history');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchTab('alerts');
                        break;
                }
            }
        });
    }

    switchTab(tabId) {
        if (!this.tabs[tabId] || this.activeTab === tabId) return;

        // Update active states
        const previousTab = this.activeTab;
        this.activeTab = tabId;

        // Update tab buttons
        const tabButtons = this.container.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });

        // Update tab panes with animation
        const tabPanes = this.container.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            if (pane.id === `tab-${tabId}`) {
                pane.classList.add('active');
                pane.style.animation = 'fadeIn 0.3s ease';
            } else {
                pane.classList.remove('active');
            }
        });

        // Load tab content
        this.loadTabContent(tabId);

        // Update URL hash
        window.location.hash = tabId;

        // Trigger callback
        if (this.onTabChange && typeof this.onTabChange === 'function') {
            this.onTabChange(tabId, previousTab);
        }

        // Track tab change
        this.trackTabChange(tabId);
    }

    loadTabContent(tabId) {
        switch (tabId) {
            case 'search':
                this.loadSearchContent();
                break;
            case 'favorites':
                this.loadFavoritesContent();
                break;
            case 'compare':
                this.loadCompareContent();
                break;
            case 'history':
                this.loadHistoryContent();
                break;
            case 'alerts':
                this.loadAlertsContent();
                break;
        }
    }

    loadSearchContent() {
        // Update results count
        this.updateResultsCount(window.currentProducts?.length || 0);

        // Show/hide empty state
        const hasResults = window.currentProducts && window.currentProducts.length > 0;
        this.toggleEmptyState('search', !hasResults);
    }

    loadFavoritesContent() {
        if (window.dataManager) {
            const favorites = window.dataManager.getFavorites();
            const favoritesGrid = document.getElementById('favoritesGrid');

            if (favoritesGrid && window.ProductCard) {
                const productCard = new ProductCard(favoritesGrid);
                productCard.render(favorites, { showActions: true });
            }

            this.toggleEmptyState('favorites', favorites.length === 0);
            this.updateTabBadge('favorites', favorites.length);
        }
    }

    loadCompareContent() {
        if (window.dataManager) {
            const compareItems = window.dataManager.getCompareItems();
            const compareGrid = document.getElementById('compareGrid');

            if (compareGrid && window.ProductCard) {
                const productCard = new ProductCard(compareGrid);
                productCard.render(compareItems, {
                    showActions: true,
                    showComparison: true,
                    gridType: 'compare'
                });
            }

            // Show detailed comparison table if more than 1 item
            if (compareItems.length > 1) {
                this.renderComparisonTable(compareItems);
            }

            this.updateCompareCount(compareItems.length);
            this.toggleEmptyState('compare', compareItems.length === 0);
            this.updateTabBadge('compare', compareItems.length);
        }
    }

    loadHistoryContent() {
        if (window.dataManager) {
            const recentlyViewed = window.dataManager.getRecentlyViewed();
            const historyGrid = document.getElementById('historyGrid');

            if (historyGrid && window.ProductCard) {
                const productCard = new ProductCard(historyGrid);
                productCard.render(recentlyViewed, { showActions: true });
            }

            this.toggleEmptyState('history', recentlyViewed.length === 0);
        }
    }

    loadAlertsContent() {
        if (window.dataManager) {
            const alerts = window.dataManager.getPriceAlerts();
            this.renderAlertsList(alerts);
            this.toggleEmptyState('alerts', alerts.length === 0);
            this.updateTabBadge('alerts', alerts.filter(a => a.active).length);
        }
    }

    renderComparisonTable(compareItems) {
        const comparisonTable = document.getElementById('comparisonTable');
        if (!comparisonTable || compareItems.length < 2) return;

        const features = this.extractComparisonFeatures(compareItems);

        comparisonTable.innerHTML = `
            <div class="comparison-table-container">
                <h4>Detailed Comparison</h4>
                <div class="comparison-table-wrapper">
                    <table class="comparison-table-grid">
                        <thead>
                            <tr>
                                <th>Features</th>
                                ${compareItems.map(item => `
                                    <th>
                                        <img src="${item.image}" alt="${item.title}" class="compare-thumb">
                                        <div class="compare-title">${this.truncateText(item.title, 20)}</div>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${features.map(feature => `
                                <tr>
                                    <td class="feature-name">${feature.name}</td>
                                    ${compareItems.map(item => `
                                        <td class="feature-value ${this.getFeatureClass(feature, item)}">
                                            ${this.getFeatureValue(feature, item)}
                                        </td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        comparisonTable.style.display = 'block';
    }

    extractComparisonFeatures(items) {
        return [
            { name: 'Price', key: 'price', type: 'currency' },
            { name: 'Rating', key: 'rating', type: 'rating' },
            { name: 'Category', key: 'category', type: 'text' },
            { name: 'Brand', key: 'brand', type: 'text' },
            { name: 'Discount', key: 'discount', type: 'percentage' },
            { name: 'Store', key: 'store', type: 'text' },
            { name: 'Availability', key: 'availability', type: 'status' }
        ];
    }

    getFeatureValue(feature, item) {
        let value = item[feature.key];

        if (feature.key === 'rating') {
            value = item.rating?.rate || 'N/A';
        }

        if (feature.key === 'store') {
            value = item.bestDeal?.store || item.store || 'Unknown';
        }

        if (feature.key === 'availability') {
            value = item.bestDeal?.availability || 'Check Availability';
        }

        switch (feature.type) {
            case 'currency':
                return value ? `${parseFloat(value).toFixed(2)}` : 'N/A';
            case 'rating':
                return value ? `${value}/5 ⭐` : 'N/A';
            case 'percentage':
                return value ? `${value}%` : 'N/A';
            default:
                return value || 'N/A';
        }
    }

    getFeatureClass(feature, item) {
        // Add classes for highlighting best/worst values
        if (feature.key === 'price') {
            // Will be enhanced with comparison logic
            return 'price-value';
        }
        return '';
    }

    renderAlertsList(alerts) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        if (alerts.length === 0) {
            alertsList.innerHTML = '';
            return;
        }

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.active ? 'active' : 'inactive'} ${alert.triggered ? 'triggered' : ''}">
                <div class="alert-info">
                    <div class="alert-product">
                        <strong>${alert.productTitle || 'Unknown Product'}</strong>
                        <span class="alert-id">#${alert.productId}</span>
                    </div>
                    <div class="alert-details">
                        <div class="alert-target">
                            Target Price: <strong>${alert.targetPrice}</strong>
                        </div>
                        <div class="alert-status">
                            ${alert.triggered ?
                `<span class="status triggered">Triggered at ${alert.triggeredPrice}</span>` :
                `<span class="status active">Active</span>`
            }
                        </div>
                    </div>
                    <div class="alert-meta">
                        Created: ${new Date(alert.createdAt).toLocaleDateString()}
                        ${alert.triggeredAt ?
                `| Triggered: ${new Date(alert.triggeredAt).toLocaleDateString()}` : ''
            }
                    </div>
                </div>
                <div class="alert-actions">
                    ${!alert.triggered ? `
                        <button class="btn btn-outline btn-small" onclick="editPriceAlert('${alert.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    ` : ''}
                    <button class="btn btn-danger btn-small" onclick="removePriceAlert('${alert.id}')">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    switchView(view) {
        const viewButtons = this.container.querySelectorAll('.view-btn');
        const productsGrid = this.container.querySelector('.products-grid');

        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        if (productsGrid) {
            productsGrid.className = `products-grid view-${view}`;
        }
    }

    handleSort(sortBy) {
        if (window.app && typeof window.app.applyFilters === 'function') {
            window.app.applyFilters({ sortBy });
        }
    }

    handleDataChange(detail) {
        const { key } = detail;

        switch (key) {
            case 'favorites':
                if (this.activeTab === 'favorites') {
                    this.loadFavoritesContent();
                }
                this.updateBadges();
                break;
            case 'compareItems':
                if (this.activeTab === 'compare') {
                    this.loadCompareContent();
                }
                this.updateBadges();
                break;
            case 'priceAlerts':
                if (this.activeTab === 'alerts') {
                    this.loadAlertsContent();
                }
                this.updateBadges();
                break;
        }
    }

    updateBadges() {
        if (window.dataManager) {
            const favorites = window.dataManager.getFavorites();
            const compareItems = window.dataManager.getCompareItems();
            const activeAlerts = window.dataManager.getPriceAlerts();

            this.updateTabBadge('favorites', favorites.length);
            this.updateTabBadge('compare', compareItems.length);
            this.updateTabBadge('alerts', activeAlerts.length);
        }
    }

    updateTabBadge(tabId, count) {
        const badge = document.getElementById(`badge-${tabId}`);

        if (count > 0) {
            if (badge) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
            } else {
                // Create badge if it doesn't exist
                const tabButton = this.container.querySelector(`[data-tab="${tabId}"]`);
                if (tabButton) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'tab-badge';
                    newBadge.id = `badge-${tabId}`;
                    newBadge.textContent = count;
                    tabButton.appendChild(newBadge);
                }
            }
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    updateResultsCount(count) {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
        }
    }

    updateCompareCount(count) {
        const compareCount = document.getElementById('compareCount');
        if (compareCount) {
            compareCount.textContent = `${count} of 4 products`;
        }
    }

    toggleEmptyState(tabId, show) {
        const emptyState = document.getElementById(`${tabId}EmptyState`);
        const grid = document.getElementById(`${tabId}Grid`) ||
            document.getElementById(`searchProductsGrid`);

        if (emptyState) {
            emptyState.style.display = show ? 'block' : 'none';
        }

        if (grid) {
            grid.style.display = show ? 'none' : 'grid';
        }

        // Special handling for comparison table
        if (tabId === 'compare') {
            const comparisonTable = document.getElementById('comparisonTable');
            if (comparisonTable) {
                comparisonTable.style.display = show ? 'none' : 'block';
            }
        }
    }

    trackTabChange(tabId) {
        if (window.analytics) {
            window.analytics.track('tab_changed', {
                tab: tabId,
                timestamp: Date.now()
            });
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Public API methods
    getActiveTab() {
        return this.activeTab;
    }

    refreshCurrentTab() {
        this.loadTabContent(this.activeTab);
    }

    showNotification(message, type = 'info') {
        if (window.dataManager) {
            window.dataManager.showNotification(message, type);
        }
    }

    destroy() {
        // Clean up event listeners
        this.container.innerHTML = '';
    }
}

// Global functions for tab interactions
window.switchToSearchTab = function () {
    if (window.app && window.app.tabsComponent) {
        window.app.tabsComponent.switchTab('search');
    }
};

window.clearAllFavorites = function () {
    if (window.dataManager && confirm('Are you sure you want to clear all favorites?')) {
        const favorites = window.dataManager.getFavorites();
        favorites.forEach(item => {
            window.dataManager.removeFromFavorites(item.id);
        });

        if (window.app && window.app.tabsComponent) {
            window.app.tabsComponent.loadFavoritesContent();
        }
    }
};

window.exportFavorites = function () {
    if (window.dataManager) {
        const favorites = window.dataManager.getFavorites();
        if (favorites.length === 0) {
            window.dataManager.showNotification('No favorites to export', 'warning');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            favorites: favorites
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `favorites-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.dataManager.showNotification('Favorites exported successfully', 'success');
    }
};

window.clearComparison = function () {
    if (window.dataManager && confirm('Are you sure you want to clear the comparison list?')) {
        window.dataManager.clearCompare();

        if (window.app && window.app.tabsComponent) {
            window.app.tabsComponent.loadCompareContent();
        }
    }
};

window.clearHistory = function () {
    if (window.dataManager && confirm('Are you sure you want to clear your viewing history?')) {
        window.dataManager.clearRecentlyViewed();

        if (window.app && window.app.tabsComponent) {
            window.app.tabsComponent.loadHistoryContent();
        }
    }
};

window.createPriceAlert = function () {
    // This would open a modal or form to create a new price alert
    const productId = prompt('Enter product ID for price alert:');
    const targetPrice = prompt('Enter target price:');

    if (productId && targetPrice && !isNaN(targetPrice)) {
        if (window.dataManager) {
            window.dataManager.addPriceAlert(productId, parseFloat(targetPrice));

            if (window.app && window.app.tabsComponent) {
                window.app.tabsComponent.loadAlertsContent();
            }
        }
    }
};

window.editPriceAlert = function (alertId) {
    if (window.dataManager) {
        const alerts = window.dataManager.getPriceAlerts();
        const alert = alerts.find(a => a.id === alertId);

        if (alert) {
            const newPrice = prompt(`Edit target price for ${alert.productTitle}:`, alert.targetPrice);
            if (newPrice && !isNaN(newPrice)) {
                window.dataManager.addPriceAlert(alert.productId, parseFloat(newPrice), alert.productTitle);

                if (window.app && window.app.tabsComponent) {
                    window.app.tabsComponent.loadAlertsContent();
                }
            }
        }
    }
};

window.removePriceAlert = function (alertId) {
    if (window.dataManager && confirm('Are you sure you want to remove this price alert?')) {
        window.dataManager.removePriceAlert(alertId);

        if (window.app && window.app.tabsComponent) {
            window.app.tabsComponent.loadAlertsContent();
        }
    }
};