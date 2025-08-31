// components/DataManager.js - Comprehensive Data Management System

class DataManager {
    constructor() {
        this.storageKeys = {
            favorites: 'favorites',
            compareItems: 'compareItems',
            recentlyViewed: 'recentlyViewed',
            priceAlerts: 'priceAlerts',
            searchHistory: 'searchHistory',
            userPreferences: 'userPreferences'
        };

        this.data = {
            favorites: [],
            compareItems: [],
            recentlyViewed: [],
            priceAlerts: [],
            searchHistory: [],
            userPreferences: {
                theme: 'light',
                currency: 'USD',
                notifications: true,
                autoSave: true,
                maxCompareItems: 4,
                maxRecentItems: 50
            }
        };

        this.eventListeners = [];
        this.isInitialized = false;
    }

    async init() {
        try {
            await this.loadAllData();
            this.setupStorageListener();
            this.isInitialized = true;

            console.log('DataManager initialized successfully');
            this.dispatchEvent('dataManagerReady', {});

            return true;
        } catch (error) {
            console.error('DataManager initialization failed:', error);
            return false;
        }
    }

    // Data Loading and Saving

    async loadAllData() {
        try {
            // Load all data from localStorage
            Object.keys(this.storageKeys).forEach(key => {
                this.loadDataFromStorage(key);
            });

            // Validate and clean data
            this.validateData();

        } catch (error) {
            console.error('Error loading data:', error);
            this.resetToDefaults();
        }
    }

    loadDataFromStorage(key) {
        try {
            const stored = localStorage.getItem(this.storageKeys[key]);
            if (stored) {
                this.data[key] = JSON.parse(stored);
            }
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            // Keep default value
        }
    }

    saveDataToStorage(key) {
        try {
            localStorage.setItem(this.storageKeys[key], JSON.stringify(this.data[key]));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    saveAllData() {
        Object.keys(this.storageKeys).forEach(key => {
            this.saveDataToStorage(key);
        });
    }

    validateData() {
        // Ensure all arrays exist and have valid structure
        const requiredArrays = ['favorites', 'compareItems', 'recentlyViewed', 'priceAlerts', 'searchHistory'];

        requiredArrays.forEach(key => {
            if (!Array.isArray(this.data[key])) {
                this.data[key] = [];
            }
        });

        // Clean up invalid entries
        this.data.favorites = this.data.favorites.filter(item => item && item.id);
        this.data.compareItems = this.data.compareItems.filter(item => item && item.id);
        this.data.recentlyViewed = this.data.recentlyViewed.filter(item => item && item.id);

        // Clean up old entries
        this.cleanupOldEntries();
    }

    cleanupOldEntries() {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

        // Clean recently viewed (keep only recent items)
        this.data.recentlyViewed = this.data.recentlyViewed.filter(item => {
            return item.timestamp && (now - item.timestamp) < maxAge;
        });

        // Limit recently viewed to max items
        if (this.data.recentlyViewed.length > this.data.userPreferences.maxRecentItems) {
            this.data.recentlyViewed = this.data.recentlyViewed
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, this.data.userPreferences.maxRecentItems);
        }
    }

    resetToDefaults() {
        console.warn('Resetting DataManager to defaults');
        this.data = {
            favorites: [],
            compareItems: [],
            recentlyViewed: [],
            priceAlerts: [],
            searchHistory: [],
            userPreferences: {
                theme: 'light',
                currency: 'USD',
                notifications: true,
                autoSave: true,
                maxCompareItems: 4,
                maxRecentItems: 50
            }
        };
        this.saveAllData();
    }

    // Favorites Management

    addToFavorites(product) {
        if (!product || !product.id) return false;

        // Check if already exists
        if (this.isFavorite(product.id)) {
            return false;
        }

        const favoriteItem = {
            ...product,
            addedAt: Date.now(),
            id: product.id.toString() // Ensure string ID
        };

        this.data.favorites.unshift(favoriteItem);
        this.saveDataToStorage('favorites');
        this.dispatchEvent('dataChanged', { key: 'favorites', action: 'add', item: favoriteItem });

        return true;
    }

    removeFromFavorites(productId) {
        if (!productId) return false;

        const initialLength = this.data.favorites.length;
        this.data.favorites = this.data.favorites.filter(item => item.id != productId);

        if (this.data.favorites.length !== initialLength) {
            this.saveDataToStorage('favorites');
            this.dispatchEvent('dataChanged', { key: 'favorites', action: 'remove', productId });
            return true;
        }

        return false;
    }

    isFavorite(productId) {
        return this.data.favorites.some(item => item.id == productId);
    }

    getFavorites() {
        return [...this.data.favorites];
    }

    getFavoriteById(productId) {
        return this.data.favorites.find(item => item.id == productId);
    }

    // Compare Items Management

    addToCompare(product) {
        if (!product || !product.id) return false;

        // Check if already exists
        if (this.isInCompare(product.id)) {
            return false;
        }

        // Check max limit
        if (this.data.compareItems.length >= this.data.userPreferences.maxCompareItems) {
            return false;
        }

        const compareItem = {
            ...product,
            addedAt: Date.now(),
            id: product.id.toString()
        };

        this.data.compareItems.push(compareItem);
        this.saveDataToStorage('compareItems');
        this.dispatchEvent('dataChanged', { key: 'compareItems', action: 'add', item: compareItem });

        return true;
    }

    removeFromCompare(productId) {
        if (!productId) return false;

        const initialLength = this.data.compareItems.length;
        this.data.compareItems = this.data.compareItems.filter(item => item.id != productId);

        if (this.data.compareItems.length !== initialLength) {
            this.saveDataToStorage('compareItems');
            this.dispatchEvent('dataChanged', { key: 'compareItems', action: 'remove', productId });
            return true;
        }

        return false;
    }

    isInCompare(productId) {
        return this.data.compareItems.some(item => item.id == productId);
    }

    getCompareItems() {
        return [...this.data.compareItems];
    }

    clearCompare() {
        this.data.compareItems = [];
        this.saveDataToStorage('compareItems');
        this.dispatchEvent('dataChanged', { key: 'compareItems', action: 'clear' });
    }

    canAddToCompare() {
        return this.data.compareItems.length < this.data.userPreferences.maxCompareItems;
    }

    // Recently Viewed Management

    addToRecentlyViewed(product) {
        if (!product || !product.id) return false;

        // Remove if already exists
        this.data.recentlyViewed = this.data.recentlyViewed.filter(item => item.id != product.id);

        // Add to beginning
        const recentItem = {
            ...product,
            timestamp: Date.now(),
            id: product.id.toString()
        };

        this.data.recentlyViewed.unshift(recentItem);

        // Limit to max items
        if (this.data.recentlyViewed.length > this.data.userPreferences.maxRecentItems) {
            this.data.recentlyViewed = this.data.recentlyViewed.slice(0, this.data.userPreferences.maxRecentItems);
        }

        this.saveDataToStorage('recentlyViewed');
        this.dispatchEvent('dataChanged', { key: 'recentlyViewed', action: 'add', item: recentItem });

        return true;
    }

    getRecentlyViewed(limit = null) {
        const items = [...this.data.recentlyViewed];
        return limit ? items.slice(0, limit) : items;
    }

    clearRecentlyViewed() {
        this.data.recentlyViewed = [];
        this.saveDataToStorage('recentlyViewed');
        this.dispatchEvent('dataChanged', { key: 'recentlyViewed', action: 'clear' });
    }

    cleanupRecentlyViewed(keepCount = 50) {
        if (this.data.recentlyViewed.length > keepCount) {
            this.data.recentlyViewed = this.data.recentlyViewed
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, keepCount);

            this.saveDataToStorage('recentlyViewed');
            this.dispatchEvent('dataChanged', { key: 'recentlyViewed', action: 'cleanup' });
        }
    }

    // Price Alerts Management

    addPriceAlert(productId, targetPrice, productTitle = null) {
        if (!productId || !targetPrice || targetPrice <= 0) return false;

        // Remove existing alert for same product
        this.removePriceAlert(productId);

        const alert = {
            id: this.generateId(),
            productId: productId.toString(),
            productTitle: productTitle || `Product #${productId}`,
            targetPrice: parseFloat(targetPrice),
            createdAt: Date.now(),
            active: true,
            triggered: false,
            triggeredAt: null,
            triggeredPrice: null
        };

        this.data.priceAlerts.push(alert);
        this.saveDataToStorage('priceAlerts');
        this.dispatchEvent('dataChanged', { key: 'priceAlerts', action: 'add', item: alert });

        return alert;
    }

    removePriceAlert(alertId) {
        const initialLength = this.data.priceAlerts.length;

        // Remove by alert ID or product ID
        this.data.priceAlerts = this.data.priceAlerts.filter(alert =>
            alert.id !== alertId && alert.productId != alertId
        );

        if (this.data.priceAlerts.length !== initialLength) {
            this.saveDataToStorage('priceAlerts');
            this.dispatchEvent('dataChanged', { key: 'priceAlerts', action: 'remove', alertId });
            return true;
        }

        return false;
    }

    updatePriceAlert(updatedAlert) {
        const index = this.data.priceAlerts.findIndex(alert => alert.id === updatedAlert.id);

        if (index !== -1) {
            this.data.priceAlerts[index] = { ...this.data.priceAlerts[index], ...updatedAlert };
            this.saveDataToStorage('priceAlerts');
            this.dispatchEvent('dataChanged', { key: 'priceAlerts', action: 'update', item: updatedAlert });
            return true;
        }

        return false;
    }

    getPriceAlerts() {
        return [...this.data.priceAlerts];
    }

    getActivePriceAlerts() {
        return this.data.priceAlerts.filter(alert => alert.active && !alert.triggered);
    }

    getTriggeredPriceAlerts() {
        return this.data.priceAlerts.filter(alert => alert.triggered);
    }

    // Search History Management

    addToSearchHistory(query) {
        if (!query || typeof query !== 'string') return false;

        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery || trimmedQuery.length < 2) return false;

        // Remove if already exists
        this.data.searchHistory = this.data.searchHistory.filter(item => item !== trimmedQuery);

        // Add to beginning
        this.data.searchHistory.unshift(trimmedQuery);

        // Limit to 20 items
        if (this.data.searchHistory.length > 20) {
            this.data.searchHistory = this.data.searchHistory.slice(0, 20);
        }

        this.saveDataToStorage('searchHistory');
        return true;
    }

    getSearchHistory() {
        return [...this.data.searchHistory];
    }

    clearSearchHistory() {
        this.data.searchHistory = [];
        this.saveDataToStorage('searchHistory');
    }

    // User Preferences Management

    getUserPreferences() {
        return { ...this.data.userPreferences };
    }

    updateUserPreference(key, value) {
        if (this.data.userPreferences.hasOwnProperty(key)) {
            this.data.userPreferences[key] = value;
            this.saveDataToStorage('userPreferences');
            this.dispatchEvent('dataChanged', { key: 'userPreferences', action: 'update', preference: key, value });
            return true;
        }
        return false;
    }

    updateUserPreferences(preferences) {
        this.data.userPreferences = { ...this.data.userPreferences, ...preferences };
        this.saveDataToStorage('userPreferences');
        this.dispatchEvent('dataChanged', { key: 'userPreferences', action: 'update', preferences });
    }

    // Statistics and Analytics

    getStatistics() {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const weekMs = 7 * dayMs;

        const stats = {
            favorites: {
                total: this.data.favorites.length,
                addedToday: this.data.favorites.filter(item =>
                    item.addedAt && (now - item.addedAt) < dayMs
                ).length,
                addedThisWeek: this.data.favorites.filter(item =>
                    item.addedAt && (now - item.addedAt) < weekMs
                ).length
            },
            recentlyViewed: {
                total: this.data.recentlyViewed.length,
                viewedToday: this.data.recentlyViewed.filter(item =>
                    item.timestamp && (now - item.timestamp) < dayMs
                ).length,
                viewedThisWeek: this.data.recentlyViewed.filter(item =>
                    item.timestamp && (now - item.timestamp) < weekMs
                ).length
            },
            priceAlerts: {
                total: this.data.priceAlerts.length,
                active: this.data.priceAlerts.filter(alert => alert.active && !alert.triggered).length,
                triggered: this.data.priceAlerts.filter(alert => alert.triggered).length
            },
            searchHistory: {
                total: this.data.searchHistory.length,
                uniqueQueries: new Set(this.data.searchHistory).size
            },
            compareItems: {
                current: this.data.compareItems.length,
                maxAllowed: this.data.userPreferences.maxCompareItems
            }
        };

        return stats;
    }

    getMostViewedCategories(limit = 5) {
        const categoryCount = {};

        this.data.recentlyViewed.forEach(item => {
            if (item.category) {
                categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
            }
        });

        return Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([category, count]) => ({ category, count }));
    }

    getTopBrands(limit = 5) {
        const brandCount = {};

        [...this.data.favorites, ...this.data.recentlyViewed].forEach(item => {
            if (item.brand) {
                brandCount[item.brand] = (brandCount[item.brand] || 0) + 1;
            }
        });

        return Object.entries(brandCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([brand, count]) => ({ brand, count }));
    }

    // Data Export/Import

    exportData() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                favorites: this.data.favorites,
                recentlyViewed: this.data.recentlyViewed,
                priceAlerts: this.data.priceAlerts,
                searchHistory: this.data.searchHistory,
                userPreferences: this.data.userPreferences
            }
        };

        return JSON.stringify(exportData, null, 2);
    }

    async importData(jsonData) {
        try {
            const importData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (!importData.data) {
                throw new Error('Invalid import data format');
            }

            // Backup current data
            const backupData = { ...this.data };

            // Import data with validation
            if (importData.data.favorites && Array.isArray(importData.data.favorites)) {
                this.data.favorites = importData.data.favorites.filter(item => item && item.id);
            }

            if (importData.data.recentlyViewed && Array.isArray(importData.data.recentlyViewed)) {
                this.data.recentlyViewed = importData.data.recentlyViewed.filter(item => item && item.id);
            }

            if (importData.data.priceAlerts && Array.isArray(importData.data.priceAlerts)) {
                this.data.priceAlerts = importData.data.priceAlerts.filter(item => item && item.id && item.productId);
            }

            if (importData.data.searchHistory && Array.isArray(importData.data.searchHistory)) {
                this.data.searchHistory = importData.data.searchHistory.filter(item => typeof item === 'string');
            }

            if (importData.data.userPreferences && typeof importData.data.userPreferences === 'object') {
                this.data.userPreferences = { ...this.data.userPreferences, ...importData.data.userPreferences };
            }

            // Save imported data
            this.saveAllData();

            // Notify about import
            this.dispatchEvent('dataChanged', { key: 'all', action: 'import' });

            return {
                success: true,
                imported: {
                    favorites: this.data.favorites.length,
                    recentlyViewed: this.data.recentlyViewed.length,
                    priceAlerts: this.data.priceAlerts.length,
                    searchHistory: this.data.searchHistory.length
                }
            };

        } catch (error) {
            console.error('Import failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility Methods

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setupStorageListener() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (Object.values(this.storageKeys).includes(e.key)) {
                this.handleStorageChange(e.key, e.newValue);
            }
        });
    }

    handleStorageChange(storageKey, newValue) {
        // Find which data key corresponds to the storage key
        const dataKey = Object.keys(this.storageKeys).find(key => this.storageKeys[key] === storageKey);

        if (dataKey && newValue) {
            try {
                this.data[dataKey] = JSON.parse(newValue);
                this.dispatchEvent('dataChanged', { key: dataKey, action: 'external_update' });
            } catch (error) {
                console.error('Error handling storage change:', error);
            }
        }
    }

    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    // Notification System Integration

    showNotification(message, type = 'info', duration = 5000) {
        // This will be overridden by the main app
        console.log(`Notification (${type}):`, message);
    }

    // Search and Filter Utilities

    searchInFavorites(query) {
        if (!query) return this.getFavorites();

        const searchTerm = query.toLowerCase();
        return this.data.favorites.filter(item =>
            item.title?.toLowerCase().includes(searchTerm) ||
            item.category?.toLowerCase().includes(searchTerm) ||
            item.brand?.toLowerCase().includes(searchTerm)
        );
    }

    filterFavoritesByCategory(category) {
        if (!category || category === 'all') return this.getFavorites();

        return this.data.favorites.filter(item =>
            item.category?.toLowerCase() === category.toLowerCase()
        );
    }

    sortFavorites(sortBy = 'newest') {
        const favorites = [...this.data.favorites];

        switch (sortBy) {
            case 'oldest':
                return favorites.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
            case 'name':
                return favorites.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            case 'price_low':
                return favorites.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price_high':
                return favorites.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'rating':
                return favorites.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
            case 'newest':
            default:
                return favorites.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
        }
    }

    // Advanced Features

    getSimilarProducts(productId, limit = 5) {
        const product = this.getFavoriteById(productId) ||
            this.data.recentlyViewed.find(item => item.id == productId);

        if (!product) return [];

        const allProducts = [...this.data.favorites, ...this.data.recentlyViewed];

        return allProducts
            .filter(item =>
                item.id != productId &&
                (item.category === product.category || item.brand === product.brand)
            )
            .slice(0, limit);
    }

    getRecommendations(limit = 10) {
        const categoryPrefs = this.getMostViewedCategories(5);
        const brandPrefs = this.getTopBrands(3);

        // This would typically integrate with a recommendation engine
        // For now, return based on user's viewing patterns
        const recommendations = this.data.recentlyViewed
            .filter(item => !this.isFavorite(item.id))
            .slice(0, limit);

        return recommendations;
    }

    getPriceHistory(productId) {
        // Placeholder for price history tracking
        // In a real app, this would track price changes over time
        const product = this.getFavoriteById(productId);
        if (!product) return [];

        // Mock price history
        return [
            { date: Date.now() - 7 * 24 * 60 * 60 * 1000, price: product.price * 1.1 },
            { date: Date.now() - 3 * 24 * 60 * 60 * 1000, price: product.price * 1.05 },
            { date: Date.now(), price: product.price }
        ];
    }

    // Data Validation and Integrity

    validateDataIntegrity() {
        const issues = [];

        // Check for duplicate IDs
        const favIds = this.data.favorites.map(item => item.id);
        const duplicateFavs = favIds.filter((id, index) => favIds.indexOf(id) !== index);
        if (duplicateFavs.length > 0) {
            issues.push(`Duplicate favorites: ${duplicateFavs.join(', ')}`);
        }

        // Check for invalid data types
        if (!Array.isArray(this.data.favorites)) {
            issues.push('Favorites data is not an array');
        }

        if (!Array.isArray(this.data.compareItems)) {
            issues.push('Compare items data is not an array');
        }

        // Check for missing required fields
        this.data.priceAlerts.forEach((alert, index) => {
            if (!alert.id || !alert.productId || !alert.targetPrice) {
                issues.push(`Price alert ${index} is missing required fields`);
            }
        });

        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    repairData() {
        console.log('Starting data repair...');

        // Remove duplicates from favorites
        const uniqueFavorites = [];
        const seenIds = new Set();

        this.data.favorites.forEach(item => {
            if (item && item.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueFavorites.push(item);
            }
        });

        this.data.favorites = uniqueFavorites;

        // Clean up invalid price alerts
        this.data.priceAlerts = this.data.priceAlerts.filter(alert =>
            alert && alert.id && alert.productId && alert.targetPrice > 0
        );

        // Ensure all required fields exist
        this.data.favorites.forEach(item => {
            if (!item.addedAt) item.addedAt = Date.now();
            if (!item.id) item.id = this.generateId();
        });

        this.data.recentlyViewed.forEach(item => {
            if (!item.timestamp) item.timestamp = Date.now();
            if (!item.id) item.id = this.generateId();
        });

        // Save repaired data
        this.saveAllData();

        console.log('Data repair completed');
        this.dispatchEvent('dataChanged', { key: 'all', action: 'repair' });
    }

    // Backup and Recovery

    createBackup() {
        const backup = {
            timestamp: Date.now(),
            version: '1.0',
            data: { ...this.data }
        };

        localStorage.setItem('dataManagerBackup', JSON.stringify(backup));
        return backup;
    }

    restoreFromBackup() {
        try {
            const backup = localStorage.getItem('dataManagerBackup');
            if (!backup) {
                throw new Error('No backup found');
            }

            const backupData = JSON.parse(backup);
            if (!backupData.data) {
                throw new Error('Invalid backup format');
            }

            this.data = { ...this.data, ...backupData.data };
            this.saveAllData();
            this.dispatchEvent('dataChanged', { key: 'all', action: 'restore' });

            return { success: true, backupDate: new Date(backupData.timestamp) };

        } catch (error) {
            console.error('Backup restore failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Performance Optimization

    optimizeStorage() {
        // Remove old entries
        this.cleanupOldEntries();

        // Compress data if needed
        const oldSize = JSON.stringify(this.data).length;

        // Remove unnecessary fields
        this.data.recentlyViewed.forEach(item => {
            delete item.description;
            if (item.storeOffers && item.storeOffers.length > 3) {
                item.storeOffers = item.storeOffers.slice(0, 3);
            }
        });

        const newSize = JSON.stringify(this.data).length;
        const saved = oldSize - newSize;

        this.saveAllData();

        return {
            oldSize,
            newSize,
            saved,
            percentSaved: ((saved / oldSize) * 100).toFixed(1)
        };
    }

    getStorageUsage() {
        const usage = {};
        let total = 0;

        Object.keys(this.storageKeys).forEach(key => {
            const size = JSON.stringify(this.data[key]).length;
            usage[key] = {
                size,
                sizeFormatted: this.formatBytes(size),
                items: Array.isArray(this.data[key]) ? this.data[key].length : 'N/A'
            };
            total += size;
        });

        return {
            individual: usage,
            total: {
                size: total,
                sizeFormatted: this.formatBytes(total)
            }
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Public API Status

    isReady() {
        return this.isInitialized;
    }

    getVersion() {
        return '1.0.0';
    }

    // Cleanup

    destroy() {
        // Save final state
        this.saveAllData();

        // Clear event listeners
        this.eventListeners = [];

        // Clear data
        this.data = null;
        this.isInitialized = false;

        console.log('DataManager destroyed');
    }
}

// Make DataManager available globally
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}