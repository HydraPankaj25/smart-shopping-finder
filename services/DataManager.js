class DataManager {
    constructor() {
        this.storagePrefix = 'smartShopping_';
        this.data = {
            favorites: this.loadFromStorage('favorites') || [],
            compareItems: this.loadFromStorage('compareItems') || [],
            searchHistory: this.loadFromStorage('searchHistory') || [],
            priceAlerts: this.loadFromStorage('priceAlerts') || [],
            userPreferences: this.loadFromStorage('userPreferences') || this.getDefaultPreferences(),
            recentlyViewed: this.loadFromStorage('recentlyViewed') || [],
            wishlist: this.loadFromStorage('wishlist') || [],
            cart: this.loadFromStorage('cart') || []
        };

        this.maxHistoryItems = 20;
        this.maxCompareItems = 4;
        this.maxRecentlyViewed = 15;

        // Auto-save changes
        this.setupAutoSave();
    }

    getDefaultPreferences() {
        return {
            currency: 'USD',
            maxPrice: 10000,
            minRating: 0,
            preferredStores: [],
            sortBy: 'relevance',
            itemsPerPage: 20,
            notifications: {
                priceDrops: true,
                backInStock: true,
                newDeals: false
            },
            theme: 'light'
        };
    }

    // Storage Operations
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
            this.dispatchStorageEvent(key, data);
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);

            // Try to free up space by removing old data
            this.cleanupStorage();

            // Retry save
            try {
                localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
            } catch (retryError) {
                console.error(`Retry save failed for ${key}:`, retryError);
            }
        }
    }

    dispatchStorageEvent(key, data) {
        window.dispatchEvent(new CustomEvent('dataChanged', {
            detail: { key, data }
        }));
    }

    setupAutoSave() {
        // Save data periodically
        setInterval(() => {
            this.saveAllData();
        }, 30000); // Save every 30 seconds

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
    }

    saveAllData() {
        Object.keys(this.data).forEach(key => {
            this.saveToStorage(key, this.data[key]);
        });
    }

    // Favorites Management
    addToFavorites(product) {
        if (!this.isFavorite(product.id)) {
            const favoriteItem = {
                ...product,
                addedAt: new Date().toISOString(),
                addedPrice: product.price
            };

            this.data.favorites.unshift(favoriteItem);
            this.saveToStorage('favorites', this.data.favorites);

            this.showNotification(`${product.title} added to favorites`, 'success');
            return true;
        }
        return false;
    }

    removeFromFavorites(productId) {
        const originalLength = this.data.favorites.length;
        this.data.favorites = this.data.favorites.filter(item => item.id !== productId);

        if (this.data.favorites.length < originalLength) {
            this.saveToStorage('favorites', this.data.favorites);
            this.showNotification('Removed from favorites', 'info');
            return true;
        }
        return false;
    }

    isFavorite(productId) {
        return this.data.favorites.some(item => item.id === productId);
    }

    getFavorites() {
        return [...this.data.favorites];
    }

    // Compare Items Management
    addToCompare(product) {
        if (this.data.compareItems.length >= this.maxCompareItems) {
            this.showNotification(`Maximum ${this.maxCompareItems} items can be compared`, 'warning');
            return false;
        }

        if (!this.isInCompare(product.id)) {
            const compareItem = {
                ...product,
                addedAt: new Date().toISOString()
            };

            this.data.compareItems.push(compareItem);
            this.saveToStorage('compareItems', this.data.compareItems);

            this.showNotification(`${product.title} added to comparison`, 'success');
            return true;
        }
        return false;
    }

    removeFromCompare(productId) {
        const originalLength = this.data.compareItems.length;
        this.data.compareItems = this.data.compareItems.filter(item => item.id !== productId);

        if (this.data.compareItems.length < originalLength) {
            this.saveToStorage('compareItems', this.data.compareItems);
            this.showNotification('Removed from comparison', 'info');
            return true;
        }
        return false;
    }

    clearCompare() {
        this.data.compareItems = [];
        this.saveToStorage('compareItems', this.data.compareItems);
        this.showNotification('Comparison list cleared', 'info');
    }

    isInCompare(productId) {
        return this.data.compareItems.some(item => item.id === productId);
    }

    getCompareItems() {
        return [...this.data.compareItems];
    }

    // Search History Management
    addToSearchHistory(query) {
        if (!query || query.trim().length < 2) return;

        const normalizedQuery = query.trim().toLowerCase();

        // Remove existing entry if it exists
        this.data.searchHistory = this.data.searchHistory.filter(
            item => item.query.toLowerCase() !== normalizedQuery
        );

        // Add to beginning
        this.data.searchHistory.unshift({
            query: query.trim(),
            timestamp: new Date().toISOString(),
            results: 0 // Will be updated when search completes
        });

        // Limit history size
        this.data.searchHistory = this.data.searchHistory.slice(0, this.maxHistoryItems);

        this.saveToStorage('searchHistory', this.data.searchHistory);
    }

    updateSearchResults(query, resultCount) {
        const historyItem = this.data.searchHistory.find(
            item => item.query.toLowerCase() === query.toLowerCase()
        );

        if (historyItem) {
            historyItem.results = resultCount;
            historyItem.lastSearched = new Date().toISOString();
            this.saveToStorage('searchHistory', this.data.searchHistory);
        }
    }

    getSearchHistory() {
        return [...this.data.searchHistory];
    }

    clearSearchHistory() {
        this.data.searchHistory = [];
        this.saveToStorage('searchHistory', this.data.searchHistory);
        this.showNotification('Search history cleared', 'info');
    }

    // Recently Viewed Management
    addToRecentlyViewed(product) {
        // Remove if already exists
        this.data.recentlyViewed = this.data.recentlyViewed.filter(
            item => item.id !== product.id
        );

        // Add to beginning
        this.data.recentlyViewed.unshift({
            ...product,
            viewedAt: new Date().toISOString()
        });

        // Limit size
        this.data.recentlyViewed = this.data.recentlyViewed.slice(0, this.maxRecentlyViewed);

        this.saveToStorage('recentlyViewed', this.data.recentlyViewed);
    }

    getRecentlyViewed() {
        return [...this.data.recentlyViewed];
    }

    clearRecentlyViewed() {
        this.data.recentlyViewed = [];
        this.saveToStorage('recentlyViewed', this.data.recentlyViewed);
    }

    // Price Alerts Management
    addPriceAlert(productId, targetPrice, productTitle = '') {
        const existingAlert = this.data.priceAlerts.find(
            alert => alert.productId === productId && alert.active
        );

        if (existingAlert) {
            existingAlert.targetPrice = targetPrice;
            existingAlert.updatedAt = new Date().toISOString();
        } else {
            this.data.priceAlerts.push({
                id: Date.now().toString(),
                productId,
                productTitle,
                targetPrice,
                createdAt: new Date().toISOString(),
                active: true,
                triggered: false
            });
        }

        this.saveToStorage('priceAlerts', this.data.priceAlerts);
        this.showNotification(`Price alert set for $${targetPrice}`, 'success');
    }

    removePriceAlert(alertId) {
        this.data.priceAlerts = this.data.priceAlerts.filter(alert => alert.id !== alertId);
        this.saveToStorage('priceAlerts', this.data.priceAlerts);
        this.showNotification('Price alert removed', 'info');
    }

    getPriceAlerts() {
        return this.data.priceAlerts.filter(alert => alert.active);
    }

    triggerPriceAlert(productId, currentPrice) {
        const alerts = this.data.priceAlerts.filter(
            alert => alert.productId === productId && alert.active && !alert.triggered
        );

        alerts.forEach(alert => {
            if (currentPrice <= alert.targetPrice) {
                alert.triggered = true;
                alert.triggeredAt = new Date().toISOString();
                alert.triggeredPrice = currentPrice;

                this.showNotification(
                    `Price Alert: ${alert.productTitle} is now $${currentPrice}!`,
                    'success',
                    5000
                );
            }
        });

        this.saveToStorage('priceAlerts', this.data.priceAlerts);
    }

    // User Preferences Management
    updatePreference(key, value) {
        this.data.userPreferences[key] = value;
        this.saveToStorage('userPreferences', this.data.userPreferences);
    }

    getPreference(key) {
        return this.data.userPreferences[key];
    }

    getAllPreferences() {
        return { ...this.data.userPreferences };
    }

    resetPreferences() {
        this.data.userPreferences = this.getDefaultPreferences();
        this.saveToStorage('userPreferences', this.data.userPreferences);
        this.showNotification('Preferences reset to defaults', 'info');
    }

    // Statistics and Analytics
    getStatistics() {
        return {
            totalFavorites: this.data.favorites.length,
            totalCompareItems: this.data.compareItems.length,
            totalSearches: this.data.searchHistory.length,
            totalPriceAlerts: this.data.priceAlerts.filter(a => a.active).length,
            totalRecentlyViewed: this.data.recentlyViewed.length,
            favoriteCategories: this.getFavoriteCategories(),
            averageFavoritePrice: this.getAverageFavoritePrice(),
            searchTrends: this.getSearchTrends()
        };
    }

    getFavoriteCategories() {
        const categories = {};
        this.data.favorites.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });

        return Object.entries(categories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({ category, count }));
    }

    getAverageFavoritePrice() {
        if (this.data.favorites.length === 0) return 0;

        const total = this.data.favorites.reduce((sum, item) => sum + (item.price || 0), 0);
        return (total / this.data.favorites.length).toFixed(2);
    }

    getSearchTrends() {
        const trends = {};
        this.data.searchHistory.forEach(search => {
            const words = search.query.toLowerCase().split(' ');
            words.forEach(word => {
                if (word.length > 2) {
                    trends[word] = (trends[word] || 0) + 1;
                }
            });
        });

        return Object.entries(trends)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    // Data Export/Import
    exportData() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: { ...this.data }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopping-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully', 'success');
    }

    async importData(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (importData.data) {
                // Merge imported data with existing data
                Object.keys(importData.data).forEach(key => {
                    if (this.data.hasOwnProperty(key)) {
                        this.data[key] = importData.data[key];
                    }
                });

                this.saveAllData();
                this.showNotification('Data imported successfully', 'success');

                // Refresh the UI
                window.location.reload();
            }
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Import failed: Invalid file format', 'error');
        }
    }

    // Cleanup and Maintenance
    cleanupStorage() {
        try {
            // Remove old search history
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            this.data.searchHistory = this.data.searchHistory.filter(
                search => new Date(search.timestamp) > oneWeekAgo
            );

            // Remove old recently viewed items
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            this.data.recentlyViewed = this.data.recentlyViewed.filter(
                item => new Date(item.viewedAt) > threeDaysAgo
            );

            // Remove triggered price alerts older than 1 month
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            this.data.priceAlerts = this.data.priceAlerts.filter(
                alert => !alert.triggered || new Date(alert.triggeredAt) > oneMonthAgo
            );

            this.saveAllData();
            console.log('Storage cleanup completed');

        } catch (error) {
            console.error('Storage cleanup error:', error);
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            Object.keys(this.data).forEach(key => {
                this.data[key] = Array.isArray(this.data[key]) ? [] :
                    key === 'userPreferences' ? this.getDefaultPreferences() : {};
                localStorage.removeItem(this.storagePrefix + key);
            });

            this.showNotification('All data cleared', 'info');

            // Refresh the page
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    // Notification System
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 350px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#667eea'
        };
        return colors[type] || '#667eea';
    }
}