class SearchComponent {
    constructor(container) {
        this.container = container;
        this.currentQuery = '';
        this.filters = {
            category: 'all',
            minPrice: 0,
            maxPrice: 10000,
            minRating: 0,
            sortBy: 'relevance',
            inStock: false
        };
        this.suggestions = [];
        this.searchHistory = [];

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.loadSearchHistory();
        this.setupAutoComplete();
    }

    render() {
        this.container.innerHTML = `
            <div class="search-container">
                ${this.renderSearchBox()}
                ${this.renderFilters()}
                ${this.renderErrorMessage()}
                ${this.renderSuccessMessage()}
            </div>
        `;
    }

    renderSearchBox() {
        return `
            <div class="search-box-container">
                <div class="search-box">
                    <div class="search-input-group">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="searchInput" 
                               placeholder="Search for products, brands, categories..."
                               value="${this.currentQuery}"
                               autocomplete="off">
                        <div class="search-actions">
                            ${this.currentQuery ? `
                                <button class="clear-search-btn" id="clearSearch" title="Clear search">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            <button class="search-btn" id="searchBtn">
                                <i class="fas fa-search"></i>
                                Search
                            </button>
                        </div>
                    </div>
                    
                    <!-- Search Suggestions Dropdown -->
                    <div class="search-suggestions" id="searchSuggestions"></div>
                    
                    <!-- Search History Dropdown -->
                    <div class="search-history" id="searchHistory"></div>
                </div>
                
                <!-- Quick Search Categories -->
                <div class="quick-categories">
                    <span class="category-label">Quick Search:</span>
                    <button class="category-chip" data-category="electronics">
                        <i class="fas fa-laptop"></i> Electronics
                    </button>
                    <button class="category-chip" data-category="clothing">
                        <i class="fas fa-tshirt"></i> Clothing
                    </button>
                    <button class="category-chip" data-category="home">
                        <i class="fas fa-home"></i> Home & Garden
                    </button>
                    <button class="category-chip" data-category="books">
                        <i class="fas fa-book"></i> Books
                    </button>
                    <button class="category-chip" data-category="sports">
                        <i class="fas fa-futbol"></i> Sports
                    </button>
                </div>
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="filters-container" id="filtersContainer">
                <div class="filters-header">
                    <h3>
                        <i class="fas fa-sliders-h"></i>
                        Filters
                    </h3>
                    <button class="toggle-filters-btn" id="toggleFilters">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                
                <div class="filters-content" id="filtersContent">
                    <div class="filters-row">
                        <!-- Category Filter -->
                        <div class="filter-group">
                            <label for="categoryFilter">Category</label>
                            <select id="categoryFilter" class="filter-select">
                                <option value="all">All Categories</option>
                                <option value="electronics" ${this.filters.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                                <option value="clothing" ${this.filters.category === 'clothing' ? 'selected' : ''}>Clothing</option>
                                <option value="home" ${this.filters.category === 'home' ? 'selected' : ''}>Home & Garden</option>
                                <option value="books" ${this.filters.category === 'books' ? 'selected' : ''}>Books</option>
                                <option value="sports" ${this.filters.category === 'sports' ? 'selected' : ''}>Sports</option>
                            </select>
                        </div>
                        
                        <!-- Price Range Filter -->
                        <div class="filter-group">
                            <label>Price Range</label>
                            <div class="price-range">
                                <input type="number" id="minPrice" placeholder="Min" value="${this.filters.minPrice}" min="0">
                                <span>to</span>
                                <input type="number" id="maxPrice" placeholder="Max" value="${this.filters.maxPrice}" min="0">
                            </div>
                        </div>
                        
                        <!-- Rating Filter -->
                        <div class="filter-group">
                            <label for="ratingFilter">Minimum Rating</label>
                            <select id="ratingFilter" class="filter-select">
                                <option value="0" ${this.filters.minRating === 0 ? 'selected' : ''}>All Ratings</option>
                                <option value="4" ${this.filters.minRating === 4 ? 'selected' : ''}>4+ Stars</option>
                                <option value="3" ${this.filters.minRating === 3 ? 'selected' : ''}>3+ Stars</option>
                                <option value="2" ${this.filters.minRating === 2 ? 'selected' : ''}>2+ Stars</option>
                            </select>
                        </div>
                        
                        <!-- Sort By Filter -->
                        <div class="filter-group">
                            <label for="sortBy">Sort By</label>
                            <select id="sortBy" class="filter-select">
                                <option value="relevance" ${this.filters.sortBy === 'relevance' ? 'selected' : ''}>Relevance</option>
                                <option value="price_low" ${this.filters.sortBy === 'price_low' ? 'selected' : ''}>Price: Low to High</option>
                                <option value="price_high" ${this.filters.sortBy === 'price_high' ? 'selected' : ''}>Price: High to Low</option>
                                <option value="rating" ${this.filters.sortBy === 'rating' ? 'selected' : ''}>Customer Rating</option>
                                <option value="discount" ${this.filters.sortBy === 'discount' ? 'selected' : ''}>Discount %</option>
                                <option value="name" ${this.filters.sortBy === 'name' ? 'selected' : ''}>Name A-Z</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="filters-row">
                        <!-- Availability Filter -->
                        <div class="filter-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="inStock" ${this.filters.inStock ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                In Stock Only
                            </label>
                        </div>
                        
                        <!-- Filter Actions -->
                        <div class="filter-actions">
                            <button class="btn btn-outline btn-small" id="clearFilters">
                                <i class="fas fa-refresh"></i>
                                Clear Filters
                            </button>
                            <button class="btn btn-small" id="applyFilters">
                                <i class="fas fa-filter"></i>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderErrorMessage() {
        return `<div class="error-message" id="errorMessage"></div>`;
    }

    renderSuccessMessage() {
        return `<div class="success-message" id="successMessage"></div>`;
    }

    attachEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const clearSearch = document.getElementById('clearSearch');
        const toggleFilters = document.getElementById('toggleFilters');
        const applyFilters = document.getElementById('applyFilters');
        const clearFilters = document.getElementById('clearFilters');

        // Search functionality
        searchBtn?.addEventListener('click', () => this.handleSearch());
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Real-time search suggestions
        searchInput?.addEventListener('input', (e) => {
            this.currentQuery = e.target.value;
            this.showSearchSuggestions(e.target.value);
            this.updateClearButton();
        });

        // Search input focus/blur
        searchInput?.addEventListener('focus', () => {
            this.showSearchHistory();
        });

        searchInput?.addEventListener('blur', () => {
            // Delay hiding to allow clicks on suggestions
            setTimeout(() => {
                this.hideSearchSuggestions();
                this.hideSearchHistory();
            }, 200);
        });

        // Clear search
        clearSearch?.addEventListener('click', () => {
            this.clearSearch();
        });

        // Filter toggles
        toggleFilters?.addEventListener('click', () => {
            this.toggleFiltersVisibility();
        });

        // Apply filters
        applyFilters?.addEventListener('click', () => {
            this.applyFilters();
        });

        // Clear filters
        clearFilters?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Quick category chips
        const categoryChips = document.querySelectorAll('.category-chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.searchByCategory(category);
            });
        });

        // Filter change listeners
        this.attachFilterListeners();
    }

    attachFilterListeners() {
        const filterInputs = [
            'categoryFilter', 'minPrice', 'maxPrice', 'ratingFilter', 'sortBy', 'inStock'
        ];

        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateFilters();
                });
            }
        });
    }

    async handleSearch() {
        const query = this.currentQuery.trim();

        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        if (query.length < 2) {
            this.showError('Search term must be at least 2 characters');
            return;
        }

        this.hideError();
        this.addToSearchHistory(query);

        try {
            if (window.app) {
                await window.app.performSearch(query, this.filters);
                this.showSuccess(`Found results for "${query}"`);
            }
        } catch (error) {
            this.showError('Search failed. Please try again.');
            console.error('Search error:', error);
        }
    }

    async showSearchSuggestions(query) {
        if (!query || query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }

        try {
            // Get suggestions from API or local data
            const suggestions = await this.generateSuggestions(query);
            this.renderSuggestions(suggestions);
        } catch (error) {
            console.error('Error generating suggestions:', error);
        }
    }

    async generateSuggestions(query) {
        // Simulate API call for suggestions
        const commonProducts = [
            'iPhone', 'Samsung Galaxy', 'MacBook', 'AirPods', 'Nike Shoes',
            'Adidas Sneakers', 'PlayStation', 'Xbox', 'Coffee Maker', 'Headphones',
            'Wireless Charger', 'Smart Watch', 'Bluetooth Speaker', 'Gaming Chair',
            'Monitor', 'Keyboard', 'Mouse', 'Camera', 'Tablet', 'Laptop'
        ];

        const lowerQuery = query.toLowerCase();
        const matches = commonProducts.filter(product =>
            product.toLowerCase().includes(lowerQuery)
        ).slice(0, 6);

        // Add search history matches
        const historyMatches = this.searchHistory
            .filter(term => term.toLowerCase().includes(lowerQuery))
            .slice(0, 3);

        return {
            products: matches,
            history: historyMatches
        };
    }

    renderSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;

        if (suggestions.products.length === 0 && suggestions.history.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        let html = '<div class="suggestions-content">';

        if (suggestions.products.length > 0) {
            html += '<div class="suggestion-group">';
            html += '<div class="suggestion-header">Suggested Products</div>';
            suggestions.products.forEach(product => {
                html += `
                    <div class="suggestion-item" onclick="selectSuggestion('${product}')">
                        <i class="fas fa-search"></i>
                        <span>${this.highlightQuery(product, this.currentQuery)}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (suggestions.history.length > 0) {
            html += '<div class="suggestion-group">';
            html += '<div class="suggestion-header">Recent Searches</div>';
            suggestions.history.forEach(term => {
                html += `
                    <div class="suggestion-item" onclick="selectSuggestion('${term}')">
                        <i class="fas fa-history"></i>
                        <span>${this.highlightQuery(term, this.currentQuery)}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        suggestionsContainer.innerHTML = html;
        suggestionsContainer.style.display = 'block';
    }

    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    showSearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        if (!historyContainer || this.searchHistory.length === 0) return;

        let html = '<div class="history-content">';
        html += '<div class="history-header">';
        html += '<span>Recent Searches</span>';
        html += '<button class="clear-history-btn" onclick="clearSearchHistory()">Clear All</button>';
        html += '</div>';

        this.searchHistory.slice(0, 8).forEach(term => {
            html += `
                <div class="history-item" onclick="selectSuggestion('${term}')">
                    <i class="fas fa-history"></i>
                    <span>${term}</span>
                    <button class="remove-history-btn" onclick="removeFromHistory('${term}')" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        html += '</div>';
        historyContainer.innerHTML = html;
        historyContainer.style.display = 'block';
    }

    hideSearchSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    hideSearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        if (historyContainer) {
            historyContainer.style.display = 'none';
        }
    }

    selectSuggestion(suggestion) {
        this.currentQuery = suggestion;
        document.getElementById('searchInput').value = suggestion;
        this.updateClearButton();
        this.hideSearchSuggestions();
        this.hideSearchHistory();
        this.handleSearch();
    }

    clearSearch() {
        this.currentQuery = '';
        document.getElementById('searchInput').value = '';
        this.updateClearButton();
        this.hideSearchSuggestions();

        // Clear search results
        if (window.app) {
            window.app.clearSearch();
        }
    }

    updateClearButton() {
        const clearButton = document.getElementById('clearSearch');
        const searchActions = document.querySelector('.search-actions');

        if (this.currentQuery.trim()) {
            if (!clearButton) {
                const newClearButton = document.createElement('button');
                newClearButton.className = 'clear-search-btn';
                newClearButton.id = 'clearSearch';
                newClearButton.title = 'Clear search';
                newClearButton.innerHTML = '<i class="fas fa-times"></i>';
                newClearButton.addEventListener('click', () => this.clearSearch());

                const searchBtn = document.getElementById('searchBtn');
                searchActions.insertBefore(newClearButton, searchBtn);
            }
        } else if (clearButton) {
            clearButton.remove();
        }
    }

    searchByCategory(category) {
        this.filters.category = category;
        this.currentQuery = category;
        document.getElementById('searchInput').value = category;
        document.getElementById('categoryFilter').value = category;

        this.updateClearButton();
        this.handleSearch();
    }

    toggleFiltersVisibility() {
        const filtersContent = document.getElementById('filtersContent');
        const toggleButton = document.getElementById('toggleFilters');
        const isVisible = filtersContent.style.display !== 'none';

        filtersContent.style.display = isVisible ? 'none' : 'block';
        toggleButton.innerHTML = isVisible ?
            '<i class="fas fa-chevron-down"></i>' :
            '<i class="fas fa-chevron-up"></i>';
    }

    updateFilters() {
        this.filters = {
            category: document.getElementById('categoryFilter')?.value || 'all',
            minPrice: parseFloat(document.getElementById('minPrice')?.value) || 0,
            maxPrice: parseFloat(document.getElementById('maxPrice')?.value) || 10000,
            minRating: parseInt(document.getElementById('ratingFilter')?.value) || 0,
            sortBy: document.getElementById('sortBy')?.value || 'relevance',
            inStock: document.getElementById('inStock')?.checked || false
        };

        // Save filters to localStorage
        localStorage.setItem('searchFilters', JSON.stringify(this.filters));
    }

    applyFilters() {
        this.updateFilters();

        if (window.app) {
            window.app.applyFilters(this.filters);
            this.showSuccess('Filters applied successfully');
        }
    }

    clearFilters() {
        this.filters = {
            category: 'all',
            minPrice: 0,
            maxPrice: 10000,
            minRating: 0,
            sortBy: 'relevance',
            inStock: false
        };

        // Update UI
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('minPrice').value = '0';
        document.getElementById('maxPrice').value = '10000';
        document.getElementById('ratingFilter').value = '0';
        document.getElementById('sortBy').value = 'relevance';
        document.getElementById('inStock').checked = false;

        // Clear from localStorage
        localStorage.removeItem('searchFilters');

        // Apply cleared filters
        this.applyFilters();
        this.showSuccess('Filters cleared');
    }

    addToSearchHistory(query) {
        if (!query || this.searchHistory.includes(query)) return;

        this.searchHistory.unshift(query);
        this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10

        // Save to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));

        // Add to data manager if available
        if (window.dataManager) {
            window.dataManager.addToSearchHistory(query);
        }
    }

    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('searchHistory');
            this.searchHistory = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            this.searchHistory = [];
        }

        // Load filters
        try {
            const savedFilters = localStorage.getItem('searchFilters');
            if (savedFilters) {
                this.filters = { ...this.filters, ...JSON.parse(savedFilters) };
            }
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    }

    removeFromSearchHistory(term) {
        this.searchHistory = this.searchHistory.filter(item => item !== term);
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        this.showSearchHistory(); // Refresh display
    }

    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
        this.hideSearchHistory();
        this.showSuccess('Search history cleared');
    }

    setupAutoComplete() {
        // Initialize any third-party autocomplete if needed
        // This could integrate with external suggestion APIs
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');

            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.classList.remove('active');
        }
    }

    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = message;
            successElement.classList.add('active');

            setTimeout(() => {
                this.hideSuccess();
            }, 3000);
        }
    }

    hideSuccess() {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.classList.remove('active');
        }
    }

    // Voice search functionality (if supported)
    initVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.currentQuery = transcript;
                document.getElementById('searchInput').value = transcript;
                this.updateClearButton();
                this.handleSearch();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showError('Voice search failed. Please try again.');
            };

            // Add voice search button
            this.addVoiceSearchButton();
        }
    }

    addVoiceSearchButton() {
        const searchActions = document.querySelector('.search-actions');
        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-search-btn';
        voiceButton.title = 'Voice search';
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';

        voiceButton.addEventListener('click', () => {
            if (this.recognition) {
                voiceButton.classList.add('listening');
                this.recognition.start();

                setTimeout(() => {
                    voiceButton.classList.remove('listening');
                }, 5000);
            }
        });

        const searchBtn = document.getElementById('searchBtn');
        searchActions.insertBefore(voiceButton, searchBtn);
    }

    // Search analytics
    trackSearch(query, resultCount) {
        if (window.analytics) {
            window.analytics.track('search_performed', {
                query: query,
                resultCount: resultCount,
                filters: this.filters,
                timestamp: Date.now()
            });
        }
    }

    // Get current state
    getCurrentQuery() {
        return this.currentQuery;
    }

    getCurrentFilters() {
        return { ...this.filters };
    }

    // Set query programmatically
    setQuery(query) {
        this.currentQuery = query;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = query;
            this.updateClearButton();
        }
    }

    // Update filters programmatically
    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.updateFilterUI();
    }

    updateFilterUI() {
        // Update all filter UI elements
        const elements = {
            'categoryFilter': this.filters.category,
            'minPrice': this.filters.minPrice,
            'maxPrice': this.filters.maxPrice,
            'ratingFilter': this.filters.minRating,
            'sortBy': this.filters.sortBy,
            'inStock': this.filters.inStock
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    // Destroy component
    destroy() {
        // Clean up event listeners
        if (this.recognition) {
            this.recognition.abort();
        }

        this.container.innerHTML = '';
    }
}

// Global functions for suggestions and history
window.selectSuggestion = function (suggestion) {
    if (window.searchComponent) {
        window.searchComponent.selectSuggestion(suggestion);
    }
};

window.removeFromHistory = function (term) {
    if (window.searchComponent) {
        window.searchComponent.removeFromSearchHistory(term);
    }
};

window.clearSearchHistory = function () {
    if (window.searchComponent) {
        window.searchComponent.clearSearchHistory();
    }
};

window.clearAllFilters = function () {
    if (window.searchComponent) {
        window.searchComponent.clearFilters();
    }
};