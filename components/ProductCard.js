class ProductCard {
    constructor(container) {
        this.container = container;
        this.products = [];
    }

    render(products, options = {}) {
        this.products = products;
        const { showActions = true, showComparison = false, gridType = 'normal' } = options;

        if (!products || products.length === 0) {
            this.renderEmptyState();
            return;
        }

        const html = products.map(product =>
            this.createProductCardHTML(product, showActions, showComparison, gridType)
        ).join('');

        this.container.innerHTML = html;
        this.attachEventListeners();
        this.loadImagesLazily();
    }

    createProductCardHTML(product, showActions, showComparison, gridType) {
        const isFavorite = window.dataManager?.isFavorite(product.id) || false;
        const isInCompare = window.dataManager?.isInCompare(product.id) || false;
        const discount = product.discount || 0;
        const savings = product.savings || 0;

        return `
            <div class="product-card ${gridType}" data-product-id="${product.id}" data-category="${product.category}">
                ${this.renderCardHeader(product, isFavorite, discount)}
                ${this.renderProductImage(product)}
                ${this.renderProductInfo(product, showActions, isInCompare, showComparison)}
                ${showComparison ? this.renderComparisonInfo(product) : ''}
            </div>
        `;
    }

    renderCardHeader(product, isFavorite, discount) {
        return `
            <div class="card-header">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite('${product.id}')"
                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fas fa-heart"></i>
                </button>
                ${discount > 0 ? `
                    <div class="discount-badge">
                        <i class="fas fa-tag"></i>
                        ${discount}% OFF
                    </div>
                ` : ''}
                ${product.bestDeal ? `
                    <div class="best-deal-badge">
                        <i class="fas fa-star"></i>
                        Best Deal
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProductImage(product) {
        return `
            <div class="product-image-container">
                <img class="product-image lazy-load" 
                     data-src="${product.image}" 
                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 250'%3E%3Crect width='300' height='250' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2394a3b8'%3ELoading...%3C/text%3E%3C/svg%3E"
                     alt="${product.title}" 
                     onerror="this.src='https://via.placeholder.com/300x250/f1f5f9/94a3b8?text=Image+Not+Available'"
                     onclick="viewProduct('${product.id}')">
                <div class="image-overlay">
                    <button class="quick-view-btn" onclick="showQuickView('${product.id}')">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                </div>
            </div>
        `;
    }

    renderProductInfo(product, showActions, isInCompare, showComparison) {
        return `
            <div class="product-info">
                <div class="product-category">
                    <i class="fas fa-tag"></i>
                    ${product.category}
                </div>
                <h3 class="product-title" onclick="viewProduct('${product.id}')" title="${product.title}">
                    ${product.title}
                </h3>
                
                ${this.renderPriceSection(product)}
                ${this.renderRatingSection(product)}
                ${this.renderStoreInfo(product)}
                ${this.renderFeatures(product)}
                
                ${showActions ? this.renderActions(product, isInCompare, showComparison) : ''}
            </div>
        `;
    }

    renderPriceSection(product) {
        return `
            <div class="product-price-section">
                <div class="current-price">
                    ${parseFloat(product.price).toFixed(2)}
                    ${product.originalPrice && product.originalPrice !== product.price ? `
                        <span class="original-price">${parseFloat(product.originalPrice).toFixed(2)}</span>
                    ` : ''}
                </div>
                ${product.savings && product.savings > 0 ? `
                    <div class="savings-info">
                        <i class="fas fa-piggy-bank"></i>
                        Save ${product.savings}
                    </div>
                ` : ''}
                ${product.storeOffers && product.storeOffers.length > 1 ? `
                    <div class="price-range">
                        <i class="fas fa-chart-line"></i>
                        ${product.storeOffers.length} stores: ${Math.min(...product.storeOffers.map(o => parseFloat(o.price))).toFixed(2)} - ${Math.max(...product.storeOffers.map(o => parseFloat(o.price))).toFixed(2)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderRatingSection(product) {
        if (!product.rating) return '';

        const rating = product.rating.rate || product.rating;
        const count = product.rating.count || 0;
        const stars = this.generateStars(rating);

        return `
            <div class="product-rating">
                <div class="stars" title="Rating: ${rating}/5">
                    ${stars}
                </div>
                <span class="rating-text">${rating}</span>
                <span class="rating-count">(${count} reviews)</span>
            </div>
        `;
    }

    renderStoreInfo(product) {
        const store = product.store || product.bestDeal?.store || 'Online Store';
        const availability = product.bestDeal?.availability || 'Check Availability';
        const shipping = product.bestDeal?.shipping || '';

        return `
            <div class="product-store">
                <div class="store-name">
                    <i class="fas fa-store"></i>
                    <strong>${store}</strong>
                </div>
                <div class="availability ${availability.includes('Limited') ? 'limited' : 'available'}">
                    <i class="fas fa-${availability.includes('Limited') ? 'exclamation-triangle' : 'check-circle'}"></i>
                    ${availability}
                </div>
                ${shipping ? `
                    <div class="shipping-info">
                        <i class="fas fa-truck"></i>
                        ${shipping}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderFeatures(product) {
        const features = [];

        if (product.brand) features.push(product.brand);
        if (product.discount && product.discount > 15) features.push('Big Discount');
        if (product.rating && product.rating.rate > 4.5) features.push('Top Rated');
        if (product.bestDeal) features.push('Best Price');

        if (features.length === 0) return '';

        return `
            <div class="product-features">
                ${features.map(feature => `
                    <span class="feature-tag">${feature}</span>
                `).join('')}
            </div>
        `;
    }

    renderActions(product, isInCompare, showComparison) {
        const compareDisabled = !isInCompare && window.dataManager?.getCompareItems().length >= 4;

        return `
            <div class="product-actions">
                <button class="btn btn-primary" onclick="viewProduct('${product.id}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                <div class="secondary-actions">
                    <button class="btn btn-outline ${isInCompare ? 'active' : ''}" 
                            onclick="toggleCompare('${product.id}')"
                            ${compareDisabled ? 'disabled' : ''}
                            title="${isInCompare ? 'Remove from comparison' : 'Add to comparison'}">
                        <i class="fas fa-balance-scale"></i>
                        ${isInCompare ? 'Remove' : 'Compare'}
                    </button>
                    <button class="btn btn-outline" onclick="setPriceAlert('${product.id}')">
                        <i class="fas fa-bell"></i>
                        Alert
                    </button>
                    ${showComparison ? `
                        <button class="btn btn-outline" onclick="shareProduct('${product.id}')">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderComparisonInfo(product) {
        if (!product.storeOffers || product.storeOffers.length < 2) return '';

        return `
            <div class="comparison-info">
                <h4>Price Comparison</h4>
                <div class="store-offers">
                    ${product.storeOffers.slice(0, 3).map(offer => `
                        <div class="store-offer">
                            <span class="store">${offer.store}</span>
                            <span class="price">${offer.price}</span>
                            <span class="availability ${offer.availability.includes('Limited') ? 'limited' : ''}">${offer.availability}</span>
                        </div>
                    `).join('')}
                    ${product.storeOffers.length > 3 ? `
                        <div class="more-offers">
                            +${product.storeOffers.length - 3} more stores
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button class="btn" onclick="clearAllFilters()">
                    <i class="fas fa-refresh"></i>
                    Clear Filters
                </button>
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

    attachEventListeners() {
        // Add hover effects and interactions
        const cards = this.container.querySelectorAll('.product-card');

        cards.forEach(card => {
            const productId = card.dataset.productId;

            // Track hover for analytics
            card.addEventListener('mouseenter', () => {
                this.trackProductView(productId, 'hover');
            });

            // Handle card animations
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    loadImagesLazily() {
        const images = this.container.querySelectorAll('.lazy-load');

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    trackProductView(productId, action) {
        // Analytics tracking
        if (window.analytics) {
            window.analytics.track('product_interaction', {
                productId,
                action,
                timestamp: Date.now()
            });
        }
    }

    // Filter and sort methods
    filterByCategory(category) {
        const cards = this.container.querySelectorAll('.product-card');

        cards.forEach(card => {
            const cardCategory = card.dataset.category?.toLowerCase();
            const shouldShow = !category || category === 'all' || cardCategory === category.toLowerCase();

            card.style.display = shouldShow ? 'block' : 'none';

            if (shouldShow) {
                card.style.animation = 'fadeIn 0.3s ease';
            }
        });
    }

    sortProducts(sortBy) {
        const cards = Array.from(this.container.querySelectorAll('.product-card'));

        cards.sort((a, b) => {
            const productA = this.products.find(p => p.id === a.dataset.productId);
            const productB = this.products.find(p => p.id === b.dataset.productId);

            switch (sortBy) {
                case 'price_low':
                    return parseFloat(productA.price) - parseFloat(productB.price);
                case 'price_high':
                    return parseFloat(productB.price) - parseFloat(productA.price);
                case 'rating':
                    return (productB.rating?.rate || 0) - (productA.rating?.rate || 0);
                case 'name':
                    return productA.title.localeCompare(productB.title);
                case 'discount':
                    return (productB.discount || 0) - (productA.discount || 0);
                default:
                    return 0;
            }
        });

        // Re-append in new order
        cards.forEach(card => this.container.appendChild(card));

        // Add animation
        cards.forEach((card, index) => {
            card.style.animation = `slideUp 0.3s ease ${index * 0.05}s both`;
        });
    }

    // Grid layout methods
    setGridLayout(layout) {
        this.container.className = `products-grid ${layout}`;

        const cards = this.container.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.className = `product-card ${layout}`;
        });
    }

    // Refresh method
    refresh() {
        const cards = this.container.querySelectorAll('.product-card');
        cards.forEach(card => {
            const productId = card.dataset.productId;
            const product = this.products.find(p => p.id === productId);

            if (product) {
                // Update favorite status
                const favoriteBtn = card.querySelector('.favorite-btn');
                const isFavorite = window.dataManager?.isFavorite(productId);
                favoriteBtn.classList.toggle('active', isFavorite);

                // Update compare status
                const compareBtn = card.querySelector('.product-actions .btn-outline');
                const isInCompare = window.dataManager?.isInCompare(productId);
                if (compareBtn) {
                    compareBtn.classList.toggle('active', isInCompare);
                    compareBtn.textContent = isInCompare ? 'Remove' : 'Compare';
                }
            }
        });
    }

    // Animation methods
    animateIn() {
        const cards = this.container.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateOut(callback) {
        const cards = this.container.querySelectorAll('.product-card');
        let completed = 0;

        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.2s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';

                completed++;
                if (completed === cards.length && callback) {
                    setTimeout(callback, 200);
                }
            }, index * 50);
        });
    }

    // Utility methods
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    updateProduct(id, updates) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products[productIndex] = { ...this.products[productIndex], ...updates };

            // Update the card in DOM
            const card = this.container.querySelector(`[data-product-id="${id}"]`);
            if (card) {
                // Re-render this specific card
                const newCardHTML = this.createProductCardHTML(this.products[productIndex], true, false, 'normal');
                card.outerHTML = newCardHTML;
            }
        }
    }

    destroy() {
        // Clean up event listeners and observers
        this.container.innerHTML = '';
    }
}

// Global functions that will be called from the HTML
window.toggleFavorite = function (productId) {
    if (window.dataManager) {
        const product = window.currentProducts?.find(p => p.id === productId);
        if (!product) return;

        if (window.dataManager.isFavorite(productId)) {
            window.dataManager.removeFromFavorites(productId);
        } else {
            window.dataManager.addToFavorites(product);
        }

        // Update UI
        if (window.app) {
            window.app.refreshCurrentView();
        }
    }
};

window.toggleCompare = function (productId) {
    if (window.dataManager) {
        const product = window.currentProducts?.find(p => p.id === productId);
        if (!product) return;

        if (window.dataManager.isInCompare(productId)) {
            window.dataManager.removeFromCompare(productId);
        } else {
            window.dataManager.addToCompare(product);
        }

        // Update UI
        if (window.app) {
            window.app.refreshCurrentView();
        }
    }
};

window.viewProduct = function (productId) {
    const product = window.currentProducts?.find(p => p.id === productId);
    if (product && window.dataManager) {
        window.dataManager.addToRecentlyViewed(product);
    }

    if (window.app) {
        window.app.showProductDetails(productId);
    }
};

window.setPriceAlert = function (productId) {
    const product = window.currentProducts?.find(p => p.id === productId);
    if (!product) return;

    const targetPrice = prompt(`Set price alert for "${product.title}"\nCurrent price: ${product.price}\nAlert me when price drops below:`);

    if (targetPrice && !isNaN(targetPrice) && parseFloat(targetPrice) > 0) {
        window.dataManager?.addPriceAlert(productId, parseFloat(targetPrice), product.title);
    }
};

window.shareProduct = function (productId) {
    const product = window.currentProducts?.find(p => p.id === productId);
    if (!product) return;

    if (navigator.share) {
        navigator.share({
            title: product.title,
            text: `Check out this deal: ${product.title} for ${product.price}`,
            url: window.location.href + `?product=${productId}`
        });
    } else {
        // Fallback to clipboard
        const text = `${product.title} - ${product.price}\n${window.location.href}?product=${productId}`;
        navigator.clipboard.writeText(text).then(() => {
            window.dataManager?.showNotification('Product link copied to clipboard!', 'success');
        });
    }
};

window.showQuickView = function (productId) {
    if (window.app) {
        window.app.showQuickView(productId);
    }
};