// Utility Functions for Smart Shopping Finder

/**
 * DOM Helper Functions
 */
const DOM = {
    // Query selector shortcuts
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    // Element creation with attributes
    create(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className' || key === 'class') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    },

    // Add multiple event listeners
    addEvents(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    },

    // Show/hide elements with animation
    show(element, animation = 'fadeIn') {
        element.style.display = 'block';
        element.classList.add(animation);
    },

    hide(element, animation = 'fadeOut') {
        element.classList.add(animation);
        setTimeout(() => {
            element.style.display = 'none';
            element.classList.remove(animation);
        }, 300);
    },

    // Smooth scroll to element
    scrollTo(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = elementPosition - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
};

/**
 * String Utility Functions
 */
const StringUtils = {
    // Truncate text with ellipsis
    truncate(text, length, suffix = '...') {
        if (!text || text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    },

    // Capitalize first letter
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    // Convert to title case
    titleCase(text) {
        if (!text) return '';
        return text.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    // Generate slug from text
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    },

    // Extract keywords from text
    extractKeywords(text, minLength = 3) {
        if (!text) return [];

        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length >= minLength)
            .filter((word, index, arr) => arr.indexOf(word) === index);
    },

    // Highlight search terms in text
    highlightSearch(text, searchTerm) {
        if (!text || !searchTerm) return text;

        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    // Format currency
    formatCurrency(amount, currency = 'USD', locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format percentage
    formatPercentage(value, decimals = 1) {
        return `${parseFloat(value).toFixed(decimals)}%`;
    }
};

/**
 * Number Utility Functions
 */
const NumberUtils = {
    // Format large numbers
    formatLargeNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Generate random number in range
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Round to specific decimal places
    roundTo(num, places = 2) {
        return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
    },

    // Calculate discount percentage
    calculateDiscount(original, sale) {
        if (!original || original <= sale) return 0;
        return Math.round(((original - sale) / original) * 100);
    },

    // Calculate savings
    calculateSavings(original, sale) {
        return Math.max(0, original - sale);
    },

    // Parse price from string
    parsePrice(priceString) {
        if (typeof priceString === 'number') return priceString;
        const match = priceString.match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    }
};

/**
 * Date Utility Functions
 */
const DateUtils = {
    // Format date for display
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },

    // Format relative time (ago)
    timeAgo(date) {
        const now = new Date();
        const target = new Date(date);
        const diffInMs = now - target;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

        return this.formatDate(date);
    },

    // Check if date is today
    isToday(date) {
        const today = new Date();
        const target = new Date(date);

        return today.toDateString() === target.toDateString();
    },

    // Get date range string
    getDateRange(startDate, endDate) {
        const start = this.formatDate(startDate);
        const end = this.formatDate(endDate);

        return `${start} - ${end}`;
    }
};

/**
 * Array Utility Functions
 */
const ArrayUtils = {
    // Remove duplicates from array
    unique(arr, key = null) {
        if (!key) {
            return [...new Set(arr)];
        }

        const seen = new Set();
        return arr.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    },

    // Shuffle array
    shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Group array by key
    groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const value = item[key];
            groups[value] = groups[value] || [];
            groups[value].push(item);
            return groups;
        }, {});
    },

    // Sort array by multiple criteria
    multiSort(arr, criteria) {
        return arr.sort((a, b) => {
            for (const criterion of criteria) {
                const { key, direction = 'asc' } = criterion;
                const aVal = a[key];
                const bVal = b[key];

                let result = 0;
                if (aVal < bVal) result = -1;
                if (aVal > bVal) result = 1;

                if (direction === 'desc') result *= -1;
                if (result !== 0) return result;
            }
            return 0;
        });
    },

    // Chunk array into smaller arrays
    chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    },

    // Find items by fuzzy search
    fuzzySearch(arr, searchTerm, keys = ['name', 'title']) {
        if (!searchTerm) return arr;

        const term = searchTerm.toLowerCase();

        return arr.filter(item => {
            return keys.some(key => {
                const value = item[key];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(term);
                }
                return false;
            });
        });
    }
};

/**
 * URL and Navigation Utilities
 */
const URLUtils = {
    // Get query parameters
    getParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};

        for (const [key, value] of params) {
            result[key] = value;
        }

        return result;
    },

    // Set query parameters
    setParams(params) {
        const url = new URL(window.location);

        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        });

        window.history.replaceState({}, '', url);
    },

    // Build URL with parameters
    buildUrl(baseUrl, params) {
        const url = new URL(baseUrl);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });

        return url.toString();
    },

    // Get current page hash
    getHash() {
        return window.location.hash.substring(1);
    },

    // Set page hash
    setHash(hash) {
        window.location.hash = hash;
    }
};

/**
 * Local Storage Utilities
 */
const StorageUtils = {
    // Set item with expiration
    setItem(key, value, expirationMs = null) {
        const item = {
            value: value,
            timestamp: Date.now(),
            expiration: expirationMs ? Date.now() + expirationMs : null
        };

        try {
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    // Get item with expiration check
    getItem(key, defaultValue = null) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return defaultValue;

            const item = JSON.parse(itemStr);

            // Check expiration
            if (item.expiration && Date.now() > item.expiration) {
                localStorage.removeItem(key);
                return defaultValue;
            }

            return item.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    // Remove item
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    // Clear expired items
    clearExpired() {
        const now = Date.now();
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item.expiration && now > item.expiration) {
                    keysToRemove.push(key);
                }
            } catch (error) {
                // Skip invalid JSON items
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        return keysToRemove.length;
    },

    // Get storage usage
    getUsage() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        return {
            used: totalSize,
            usedFormatted: this.formatBytes(totalSize),
            available: 5242880 - totalSize, // 5MB typical limit
            percentage: Math.round((totalSize / 5242880) * 100)
        };
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

/**
 * Device and Browser Detection
 */
const DeviceUtils = {
    // Check if mobile device
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Check if tablet
    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    // Check if desktop
    isDesktop() {
        return window.innerWidth > 1024;
    },

    // Get device type
    getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    },

    // Check if touch device
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Get browser info
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';

        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';

        return {
            name: browser,
            userAgent: ua,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    },

    // Check feature support
    supports: {
        localStorage: () => {
            try {
                const test = '__test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },

        serviceWorker: () => 'serviceWorker' in navigator,

        notifications: () => 'Notification' in window,

        geolocation: () => 'geolocation' in navigator,

        webShare: () => 'share' in navigator,

        intersectionObserver: () => 'IntersectionObserver' in window,

        resizeObserver: () => 'ResizeObserver' in window
    }
};

/**
 * Image Utilities
 */
const ImageUtils = {
    // Lazy load images
    lazyLoad(selector = '.lazy-load') {
        if (!DeviceUtils.supports.intersectionObserver()) {
            // Fallback for browsers without IntersectionObserver
            DOM.$(selector).forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });

        DOM.$(selector).forEach(img => imageObserver.observe(img));
    },

    // Create placeholder image URL
    placeholder(width, height, text = 'Loading...', bgColor = 'f1f5f9', textColor = '94a3b8') {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23${bgColor}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23${textColor}' font-family='sans-serif' font-size='16'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
    },

    // Check if image exists
    async exists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Get image dimensions
    getDimensions(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = url;
        });
    }
};

/**
 * Performance Utilities
 */
const PerformanceUtils = {
    // Debounce function calls
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    // Throttle function calls
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Measure execution time
    measure(name, func) {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    // Async measure
    async measureAsync(name, func) {
        const start = performance.now();
        const result = await func();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    // Memory usage (if available)
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
};

/**
 * Animation Utilities
 */
const AnimationUtils = {
    // Animate element property
    animate(element, properties, duration = 300, easing = 'ease') {
        return new Promise((resolve) => {
            const initialStyles = getComputedStyle(element);
            const keyframes = [];

            // Create keyframes
            const fromFrame = {};
            const toFrame = {};

            Object.entries(properties).forEach(([prop, value]) => {
                fromFrame[prop] = initialStyles[prop];
                toFrame[prop] = value;
            });

            keyframes.push(fromFrame, toFrame);

            const animation = element.animate(keyframes, {
                duration,
                easing,
                fill: 'forwards'
            });

            animation.addEventListener('finish', resolve);
        });
    },

    // Fade in element
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        return this.animate(element, { opacity: '1' }, duration);
    },

    // Fade out element
    fadeOut(element, duration = 300) {
        return this.animate(element, { opacity: '0' }, duration)
            .then(() => {
                element.style.display = 'none';
            });
    },

    // Slide down
    slideDown(element, duration = 300) {
        const height = element.scrollHeight;
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';

        return this.animate(element, { height: `${height}px` }, duration)
            .then(() => {
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            });
    },

    // Slide up
    slideUp(element, duration = 300) {
        const height = element.scrollHeight;
        element.style.height = `${height}px`;
        element.style.overflow = 'hidden';

        return this.animate(element, { height: '0px' }, duration)
            .then(() => {
                element.style.display = 'none';
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            });
    }
};

/**
 * Color Utilities
 */
const ColorUtils = {
    // Convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Convert RGB to hex
    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    },

    // Get contrasting text color
    getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return '#000000';

        // Calculate luminance
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    },

    // Generate random color
    randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }
};

/**
 * Validation Utilities
 */
const ValidationUtils = {
    // Email validation
    isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // URL validation
    isUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Phone number validation (basic)
    isPhone(phone) {
        const regex = /^\+?[\d\s\-\(\)]{10,}$/;
        return regex.test(phone);
    },

    // Price validation
    isValidPrice(price) {
        const num = parseFloat(price);
        return !isNaN(num) && num >= 0;
    },

    // Required field validation
    isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    // Length validation
    hasLength(value, min, max = Infinity) {
        const length = value ? value.toString().length : 0;
        return length >= min && length <= max;
    }
};

/**
 * Export utilities to global scope
 */
window.Utils = {
    DOM,
    String: StringUtils,
    Number: NumberUtils,
    Date: DateUtils,
    Array: ArrayUtils,
    URL: URLUtils,
    Storage: StorageUtils,
    Device: DeviceUtils,
    Image: ImageUtils,
    Performance: PerformanceUtils,
    Animation: AnimationUtils,
    Color: ColorUtils,
    Validation: ValidationUtils
};

// Initialize utility functions
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading
    ImageUtils.lazyLoad();

    // Clean up expired storage items
    StorageUtils.clearExpired();

    // Add utility classes to body based on device
    document.body.classList.add(`device-${DeviceUtils.getDeviceType()}`);

    if (DeviceUtils.isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
});

// Export individual utilities for easy access
window.DOM = DOM;
window.StringUtils = StringUtils;
window.NumberUtils = NumberUtils;
window.DateUtils = DateUtils;
window.ArrayUtils = ArrayUtils;
window.URLUtils = URLUtils;
window.StorageUtils = StorageUtils;
window.DeviceUtils = DeviceUtils;
window.ImageUtils = ImageUtils;
window.PerformanceUtils = PerformanceUtils;
window.AnimationUtils = AnimationUtils;
window.ColorUtils = ColorUtils;
window.ValidationUtils = ValidationUtils;