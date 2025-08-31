class APIService {
    constructor() {
        // Multiple free APIs for product data
        this.apis = {
            fakestore: 'https://fakestoreapi.com/products',
            platzi: 'https://api.escuelajs.co/api/v1/products',
            dummyjson: 'https://dummyjson.com/products',
            jsonplaceholder: 'https://jsonplaceholder.typicode.com/photos' // For additional images
        };

        // API rotation for better data variety
        this.currentApiIndex = 0;
        this.maxRetries = 3;

        // Price comparison stores simulation
        this.stores = [
            { name: 'Amazon', priceMultiplier: 1.0, reliability: 0.95 },
            { name: 'eBay', priceMultiplier: 0.85, reliability: 0.90 },
            { name: 'Walmart', priceMultiplier: 0.92, reliability: 0.98 },
            { name: 'Target', priceMultiplier: 0.88, reliability: 0.96 },
            { name: 'Best Buy', priceMultiplier: 1.05, reliability: 0.94 },
            { name: 'Costco', priceMultiplier: 0.90, reliability: 0.97 },
            { name: 'Home Depot', priceMultiplier: 0.95, reliability: 0.93 },
            { name: 'Newegg', priceMultiplier: 1.02, reliability: 0.91 }
        ];

        this.initializeStatusIndicator();
    }

    async searchProducts(query = '', limit = 20) {
        try {
            // Try multiple APIs for better results
            const results = await Promise.allSettled([
                this.fetchFromFakeStore(query, Math.ceil(limit / 2)),
                this.fetchFromDummyJSON(query, Math.ceil(limit / 2)),
                this.fetchFromPlatzi(query, Math.ceil(limit / 2))
            ]);

            let allProducts = [];

            // Combine results from all APIs
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    allProducts = allProducts.concat(result.value);
                }
            });

            // Remove duplicates and limit results
            const uniqueProducts = this.removeDuplicates(allProducts);
            const limitedProducts = uniqueProducts.slice(0, limit);

            // Enhance products with price comparison
            const enhancedProducts = limitedProducts.map(product =>
                this.enhanceProductWithPriceComparison(product)
            );

            this.updateApiStatus('online');
            return enhancedProducts;

        } catch (error) {
            console.error('Search failed:', error);
            this.updateApiStatus('offline');

            // Return cached/fallback data if available
            return this.getFallbackProducts(query, limit);
        }
    }

    async fetchFromFakeStore(query = '', limit = 10) {
        try {
            const response = await axios.get(this.apis.fakestore, {
                timeout: 10000,
                params: { limit: 20 }
            });

            let products = response.data;

            // Filter by query if provided
            if (query) {
                products = products.filter(product =>
                    product.title.toLowerCase().includes(query.toLowerCase()) ||
                    product.category.toLowerCase().includes(query.toLowerCase()) ||
                    product.description.toLowerCase().includes(query.toLowerCase())
                );
            }

            return products.slice(0, limit).map(product => ({
                id: `fs_${product.id}`,
                title: product.title,
                price: parseFloat(product.price),
                image: product.image,
                category: product.category,
                description: product.description,
                rating: product.rating,
                source: 'FakeStore API'
            }));

        } catch (error) {
            console.error('FakeStore API error:', error);
            return [];
        }
    }

    async fetchFromDummyJSON(query = '', limit = 10) {
        try {
            const response = await axios.get(`${this.apis.dummyjson}?limit=30&skip=0`, {
                timeout: 10000
            });

            let products = response.data.products;

            // Filter by query if provided
            if (query) {
                products = products.filter(product =>
                    product.title.toLowerCase().includes(query.toLowerCase()) ||
                    product.category.toLowerCase().includes(query.toLowerCase()) ||
                    product.description.toLowerCase().includes(query.toLowerCase()) ||
                    product.brand.toLowerCase().includes(query.toLowerCase())
                );
            }

            return products.slice(0, limit).map(product => ({
                id: `dj_${product.id}`,
                title: product.title,
                price: parseFloat(product.price),
                image: product.thumbnail || product.images[0],
                category: product.category,
                description: product.description,
                rating: {
                    rate: product.rating,
                    count: Math.floor(Math.random() * 1000) + 100
                },
                brand: product.brand,
                discount: product.discountPercentage,
                source: 'DummyJSON API'
            }));

        } catch (error) {
            console.error('DummyJSON API error:', error);
            return [];
        }
    }

    async fetchFromPlatzi(query = '', limit = 10) {
        try {
            const response = await axios.get(`${this.apis.platzi}?offset=0&limit=30`, {
                timeout: 10000
            });

            let products = response.data;

            // Filter by query if provided
            if (query) {
                products = products.filter(product =>
                    product.title.toLowerCase().includes(query.toLowerCase()) ||
                    product.category.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.description.toLowerCase().includes(query.toLowerCase())
                );
            }

            return products.slice(0, limit).map(product => ({
                id: `platzi_${product.id}`,
                title: product.title,
                price: parseFloat(product.price),
                image: product.images[0] || product.category.image,
                category: product.category.name,
                description: product.description,
                rating: {
                    rate: (Math.random() * 2 + 3).toFixed(1), // 3-5 rating
                    count: Math.floor(Math.random() * 500) + 50
                },
                source: 'Platzi API'
            }));

        } catch (error) {
            console.error('Platzi API error:', error);
            return [];
        }
    }

    enhanceProductWithPriceComparison(product) {
        const basePrice = product.price;
        const stores = this.getRandomStores(3, 5); // Get 3-5 random stores

        const storeOffers = stores.map(store => ({
            store: store.name,
            price: (basePrice * store.priceMultiplier * (0.9 + Math.random() * 0.2)).toFixed(2),
            availability: Math.random() > (1 - store.reliability) ? 'In Stock' : 'Limited Stock',
            shipping: this.getRandomShipping(),
            rating: (4 + Math.random()).toFixed(1)
        }));

        // Sort by price to show best deal first
        storeOffers.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

        const bestPrice = parseFloat(storeOffers[0].price);
        const worstPrice = parseFloat(storeOffers[storeOffers.length - 1].price);
        const savings = (worstPrice - bestPrice).toFixed(2);

        return {
            ...product,
            originalPrice: worstPrice,
            price: bestPrice,
            savings: savings,
            discount: Math.round(((worstPrice - bestPrice) / worstPrice) * 100),
            storeOffers: storeOffers,
            bestDeal: storeOffers[0],
            totalStores: storeOffers.length
        };
    }

    getRandomStores(min = 3, max = 5) {
        const shuffled = [...this.stores].sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        return shuffled.slice(0, count);
    }

    getRandomShipping() {
        const options = [
            'Free Shipping',
            'Free 2-Day Shipping',
            '$4.99 Shipping',
            '$7.99 Shipping',
            'Free Pickup',
            'Same Day Delivery'
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    removeDuplicates(products) {
        const seen = new Set();
        return products.filter(product => {
            const key = product.title.toLowerCase().substring(0, 30);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    getFallbackProducts(query = '', limit = 20) {
        // Fallback data when APIs are unavailable
        const fallbackProducts = [
            {
                id: 'fallback_1',
                title: 'Apple iPhone 14 Pro Max 128GB',
                price: 999.99,
                originalPrice: 1199.99,
                image: 'https://via.placeholder.com/300x300/667eea/ffffff?text=iPhone+14+Pro',
                category: 'Electronics',
                description: 'Latest iPhone with A16 Bionic chip',
                rating: { rate: 4.8, count: 2547 },
                discount: 17,
                source: 'Fallback Data'
            },
            {
                id: 'fallback_2',
                title: 'Samsung Galaxy S23 Ultra 256GB',
                price: 849.99,
                originalPrice: 1049.99,
                image: 'https://via.placeholder.com/300x300/764ba2/ffffff?text=Galaxy+S23',
                category: 'Electronics',
                description: 'Premium Android smartphone',
                rating: { rate: 4.7, count: 1823 },
                discount: 19,
                source: 'Fallback Data'
            }
        ];

        if (query) {
            return fallbackProducts.filter(product =>
                product.title.toLowerCase().includes(query.toLowerCase())
            );
        }

        return fallbackProducts;
    }

    async getProductDetails(productId) {
        try {
            // Extract API prefix and ID
            const [apiPrefix, id] = productId.split('_');

            switch (apiPrefix) {
                case 'fs':
                    return await this.getFakeStoreDetails(id);
                case 'dj':
                    return await this.getDummyJSONDetails(id);
                case 'platzi':
                    return await this.getPlatziDetails(id);
                default:
                    throw new Error('Unknown product source');
            }
        } catch (error) {
            console.error('Failed to get product details:', error);
            return null;
        }
    }

    async getFakeStoreDetails(id) {
        const response = await axios.get(`${this.apis.fakestore}/${id}`);
        return response.data;
    }

    async getDummyJSONDetails(id) {
        const response = await axios.get(`${this.apis.dummyjson}/${id}`);
        return response.data;
    }

    async getPlatziDetails(id) {
        const response = await axios.get(`${this.apis.platzi}/${id}`);
        return response.data;
    }

    // Price tracking simulation
    async getPriceHistory(productId, days = 30) {
        // Simulate price history data
        const history = [];
        const basePrice = Math.random() * 500 + 50;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const priceVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
            const price = basePrice * (1 + priceVariation);

            history.push({
                date: date.toISOString().split('T')[0],
                price: price.toFixed(2)
            });
        }

        return history;
    }

    // Category-based search
    async searchByCategory(category, limit = 20) {
        try {
            const results = await Promise.allSettled([
                this.fetchFromFakeStore('', limit).then(products =>
                    products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
                ),
                this.fetchFromDummyJSON('', limit).then(products =>
                    products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
                )
            ]);

            let categoryProducts = [];
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    categoryProducts = categoryProducts.concat(result.value);
                }
            });

            return categoryProducts.slice(0, limit);
        } catch (error) {
            console.error('Category search failed:', error);
            return [];
        }
    }

    // Get trending products
    async getTrendingProducts(limit = 10) {
        try {
            const allProducts = await this.searchProducts('', 50);

            // Sort by rating and randomize for "trending" effect
            return allProducts
                .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
                .sort(() => Math.random() - 0.5) // Add randomness
                .slice(0, limit);
        } catch (error) {
            console.error('Failed to get trending products:', error);
            return [];
        }
    }

    // Price alert simulation
    setPriceAlert(productId, targetPrice) {
        const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        alerts.push({
            productId,
            targetPrice,
            createdAt: new Date().toISOString(),
            active: true
        });
        localStorage.setItem('priceAlerts', JSON.stringify(alerts));

        // Simulate alert checking (in real app, this would be server-side)
        setTimeout(() => {
            this.checkPriceAlerts();
        }, Math.random() * 10000 + 5000); // Check in 5-15 seconds
    }

    checkPriceAlerts() {
        const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        const activeAlerts = alerts.filter(alert => alert.active);

        activeAlerts.forEach(alert => {
            // Simulate price drop (20% chance)
            if (Math.random() < 0.2) {
                this.triggerPriceAlert(alert);
            }
        });
    }

    triggerPriceAlert(alert) {
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Price Drop Alert!', {
                body: `Product price dropped below ${alert.targetPrice}`,
                icon: '/assets/images/logo.png'
            });
        }

        // Mark alert as triggered
        const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        const updatedAlerts = alerts.map(a =>
            a.productId === alert.productId ? { ...a, active: false, triggeredAt: new Date().toISOString() } : a
        );
        localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    }

    initializeStatusIndicator() {
        const statusEl = document.createElement('div');
        statusEl.className = 'api-status offline';
        statusEl.textContent = 'Offline';
        statusEl.id = 'apiStatus';
        document.body.appendChild(statusEl);
    }

    updateApiStatus(status) {
        const statusEl = document.getElementById('apiStatus');
        if (statusEl) {
            statusEl.className = `api-status ${status}`;
            statusEl.textContent = status === 'online' ? 'APIs Online' : 'Limited Mode';
        }
    }

    // Network status monitoring
    monitorNetworkStatus() {
        window.addEventListener('online', () => {
            this.updateApiStatus('online');
            console.log('Network connection restored');
        });

        window.addEventListener('offline', () => {
            this.updateApiStatus('offline');
            console.log('Network connection lost');
        });
    }

    // Initialize monitoring on app start
    init() {
        this.monitorNetworkStatus();

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Initial status check
        this.searchProducts('', 1).then(() => {
            this.updateApiStatus('online');
        }).catch(() => {
            this.updateApiStatus('offline');
        });
    }
}