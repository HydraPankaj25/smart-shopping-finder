class LoadingComponent {
    constructor(container) {
        this.container = container;
        this.isVisible = false;
        this.currentMessage = '';
        this.loadingType = 'spinner'; // spinner, skeleton, pulse
        this.animationInterval = null;

        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="loading" id="loadingContainer">
                <div class="loading-content">
                    ${this.renderLoadingAnimation()}
                    ${this.renderLoadingText()}
                    ${this.renderProgressBar()}
                </div>
            </div>
        `;
    }

    renderLoadingAnimation() {
        switch (this.loadingType) {
            case 'skeleton':
                return this.renderSkeletonLoader();
            case 'pulse':
                return this.renderPulseLoader();
            case 'dots':
                return this.renderDotsLoader();
            case 'progress':
                return this.renderProgressLoader();
            default:
                return this.renderSpinnerLoader();
        }
    }

    renderSpinnerLoader() {
        return `
            <div class="spinner-container">
                <div class="spinner"></div>
                <div class="spinner-glow"></div>
            </div>
        `;
    }

    renderSkeletonLoader() {
        return `
            <div class="skeleton-loader">
                <div class="skeleton-products">
                    ${Array(6).fill(0).map(() => `
                        <div class="skeleton-card">
                            <div class="skeleton-image"></div>
                            <div class="skeleton-content">
                                <div class="skeleton-line skeleton-title"></div>
                                <div class="skeleton-line skeleton-price"></div>
                                <div class="skeleton-line skeleton-rating"></div>
                                <div class="skeleton-buttons">
                                    <div class="skeleton-button"></div>
                                    <div class="skeleton-button"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPulseLoader() {
        return `
            <div class="pulse-loader">
                <div class="pulse-circle pulse-1"></div>
                <div class="pulse-circle pulse-2"></div>
                <div class="pulse-circle pulse-3"></div>
            </div>
        `;
    }

    renderDotsLoader() {
        return `
            <div class="dots-loader">
                <div class="dot dot-1"></div>
                <div class="dot dot-2"></div>
                <div class="dot dot-3"></div>
            </div>
        `;
    }

    renderProgressLoader() {
        return `
            <div class="progress-loader">
                <div class="progress-ring">
                    <svg width="60" height="60">
                        <circle cx="30" cy="30" r="25" stroke="#e2e8f0" stroke-width="4" fill="none"/>
                        <circle cx="30" cy="30" r="25" stroke="var(--primary)" stroke-width="4" 
                                fill="none" stroke-linecap="round" 
                                stroke-dasharray="157" stroke-dashoffset="157" 
                                class="progress-circle"/>
                    </svg>
                </div>
                <div class="progress-percentage">0%</div>
            </div>
        `;
    }

    renderLoadingText() {
        return `
            <div class="loading-text" id="loadingText">
                <div class="loading-message">Loading products...</div>
                <div class="loading-submessage">Please wait while we fetch the best deals</div>
            </div>
        `;
    }

    renderProgressBar() {
        return `
            <div class="loading-progress" id="loadingProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text">
                    <span id="progressPercent">0%</span>
                    <span id="progressStatus">Initializing...</span>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Listen for loading state changes
        window.addEventListener('loadingStateChange', (event) => {
            const { isLoading, message, type, progress } = event.detail;

            if (isLoading) {
                this.show(message, type);
                if (progress !== undefined) {
                    this.updateProgress(progress);
                }
            } else {
                this.hide();
            }
        });
    }

    show(message = 'Loading...', type = 'spinner', options = {}) {
        this.currentMessage = message;
        this.loadingType = type;
        this.isVisible = true;

        // Re-render with new type if needed
        if (type !== 'spinner') {
            this.render();
        }

        const loadingContainer = document.getElementById('loadingContainer');
        const loadingText = document.getElementById('loadingText');

        if (loadingContainer) {
            loadingContainer.classList.add('active');

            // Update message
            if (loadingText) {
                const messageEl = loadingText.querySelector('.loading-message');
                const submessageEl = loadingText.querySelector('.loading-submessage');

                if (messageEl) messageEl.textContent = message;
                if (submessageEl && options.submessage) {
                    submessageEl.textContent = options.submessage;
                    submessageEl.style.display = 'block';
                } else if (submessageEl) {
                    submessageEl.style.display = 'none';
                }
            }

            // Show progress bar if needed
            if (options.showProgress) {
                this.showProgressBar();
            }

            // Start loading animation effects
            this.startAnimationEffects();

            // Auto-hide after timeout if specified
            if (options.timeout) {
                setTimeout(() => {
                    this.hide();
                }, options.timeout);
            }
        }
    }

    hide() {
        this.isVisible = false;
        const loadingContainer = document.getElementById('loadingContainer');

        if (loadingContainer) {
            loadingContainer.classList.add('fade-out');

            setTimeout(() => {
                loadingContainer.classList.remove('active', 'fade-out');
                this.stopAnimationEffects();
            }, 300);
        }
    }

    updateMessage(message, submessage = null) {
        this.currentMessage = message;
        const messageEl = document.querySelector('.loading-message');
        const submessageEl = document.querySelector('.loading-submessage');

        if (messageEl) {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.textContent = message;
                messageEl.style.opacity = '1';
            }, 150);
        }

        if (submessage && submessageEl) {
            submessageEl.textContent = submessage;
            submessageEl.style.display = 'block';
        }
    }

    updateProgress(percent, status = null) {
        const progressBar = document.getElementById('loadingProgress');
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressStatus = document.getElementById('progressStatus');
        const progressCircle = document.querySelector('.progress-circle');

        if (progressBar) {
            progressBar.style.display = 'block';
        }

        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }

        if (progressPercent) {
            progressPercent.textContent = `${Math.round(percent)}%`;
        }

        if (status && progressStatus) {
            progressStatus.textContent = status;
        }

        // Update circular progress if using progress loader
        if (progressCircle) {
            const circumference = 157; // 2 * π * r (r = 25)
            const offset = circumference - (percent / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }

        // Update percentage text for progress loader
        const percentageEl = document.querySelector('.progress-percentage');
        if (percentageEl) {
            percentageEl.textContent = `${Math.round(percent)}%`;
        }
    }

    showProgressBar() {
        const progressBar = document.getElementById('loadingProgress');
        if (progressBar) {
            progressBar.style.display = 'block';
        }
    }

    hideProgressBar() {
        const progressBar = document.getElementById('loadingProgress');
        if (progressBar) {
            progressBar.style.display = 'none';
        }
    }

    startAnimationEffects() {
        // Add dynamic text effects
        this.startTextAnimation();

        // Add particles effect for enhanced visual appeal
        if (this.loadingType === 'spinner') {
            this.addSpinnerEffects();
        }
    }

    stopAnimationEffects() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // Clear any additional effects
        const particles = document.querySelectorAll('.loading-particle');
        particles.forEach(particle => particle.remove());
    }

    startTextAnimation() {
        const messages = [
            'Searching for the best deals...',
            'Comparing prices across stores...',
            'Finding amazing discounts...',
            'Almost there...',
            'Loading your results...'
        ];

        let messageIndex = 0;
        this.animationInterval = setInterval(() => {
            if (this.isVisible) {
                messageIndex = (messageIndex + 1) % messages.length;
                this.updateMessage(messages[messageIndex]);
            }
        }, 2000);
    }

    addSpinnerEffects() {
        const spinnerContainer = document.querySelector('.spinner-container');
        if (!spinnerContainer) return;

        // Add floating particles
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'loading-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary);
                border-radius: 50%;
                opacity: 0.6;
                animation: float-particle ${2 + Math.random() * 2}s infinite ease-in-out;
                animation-delay: ${Math.random() * 2}s;
                top: ${20 + Math.random() * 60}%;
                left: ${20 + Math.random() * 60}%;
            `;
            spinnerContainer.appendChild(particle);
        }
    }

    // Preset loading scenarios
    showSearchLoading() {
        this.show('Searching products...', 'spinner', {
            submessage: 'Finding the best deals across multiple stores'
        });
    }

    showDataLoading() {
        this.show('Loading data...', 'skeleton', {
            submessage: 'Preparing your personalized experience'
        });
    }

    showPriceComparison() {
        this.show('Comparing prices...', 'progress', {
            showProgress: true,
            submessage: 'Analyzing offers from different retailers'
        });
    }

    showApiLoading() {
        this.show('Connecting to services...', 'dots', {
            submessage: 'Establishing secure connections'
        });
    }

    // Simulate loading progress for demos
    simulateProgress(duration = 3000, callback = null) {
        let progress = 0;
        const interval = 50;
        const increment = (100 * interval) / duration;

        const progressInterval = setInterval(() => {
            progress += increment + Math.random() * 5;
            progress = Math.min(progress, 100);

            this.updateProgress(progress, this.getProgressStatus(progress));

            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    this.hide();
                    if (callback) callback();
                }, 500);
            }
        }, interval);
    }

    getProgressStatus(progress) {
        if (progress < 20) return 'Initializing...';
        if (progress < 40) return 'Connecting to APIs...';
        if (progress < 60) return 'Fetching product data...';
        if (progress < 80) return 'Processing results...';
        if (progress < 95) return 'Finalizing...';
        return 'Complete!';
    }

    // State management
    isLoading() {
        return this.isVisible;
    }

    getCurrentMessage() {
        return this.currentMessage;
    }

    setLoadingType(type) {
        this.loadingType = type;
        if (this.isVisible) {
            this.render();
        }
    }

    // Integration with external loading states
    showForPromise(promise, message = 'Loading...', type = 'spinner') {
        this.show(message, type);

        return promise
            .finally(() => {
                this.hide();
            });
    }

    // Advanced loading with multiple steps
    showStepLoading(steps, currentStep = 0) {
        if (currentStep >= steps.length) {
            this.hide();
            return;
        }

        const step = steps[currentStep];
        const progress = ((currentStep + 1) / steps.length) * 100;

        this.show(step.message, 'progress', {
            showProgress: true,
            submessage: step.submessage || ''
        });

        this.updateProgress(progress, `Step ${currentStep + 1} of ${steps.length}`);

        // Auto-advance to next step
        if (step.duration) {
            setTimeout(() => {
                this.showStepLoading(steps, currentStep + 1);
            }, step.duration);
        }
    }

    // Cleanup
    destroy() {
        this.stopAnimationEffects();
        this.container.innerHTML = '';
    }
}

// Global loading functions for easy access
window.showLoading = function (message, type = 'spinner', options = {}) {
    if (window.loadingComponent) {
        window.loadingComponent.show(message, type, options);
    }
};

window.hideLoading = function () {
    if (window.loadingComponent) {
        window.loadingComponent.hide();
    }
};

window.updateLoadingProgress = function (percent, status) {
    if (window.loadingComponent) {
        window.loadingComponent.updateProgress(percent, status);
    }
};

// Add CSS animations
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    @keyframes float-particle {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
        }
    }

    .loading.fade-out {
        opacity: 0;
        transform: translateY(-10px);
    }

    .spinner-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 70px;
        height: 70px;
        border: 2px solid transparent;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: conic-gradient(from 0deg, transparent, var(--primary), transparent);
        animation: spin 2s linear infinite;
        opacity: 0.3;
    }

    .skeleton-card {
        background: white;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: var(--shadow);
    }

    .skeleton-image {
        width: 100%;
        height: 200px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 10px;
        margin-bottom: 15px;
    }

    .skeleton-line {
        height: 16px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 8px;
        margin-bottom: 10px;
    }

    .skeleton-title {
        height: 20px;
        width: 80%;
    }

    .skeleton-price {
        height: 18px;
        width: 60%;
    }

    .skeleton-rating {
        height: 16px;
        width: 40%;
    }

    .skeleton-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }

    .skeleton-button {
        flex: 1;
        height: 40px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 8px;
    }

    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    .pulse-loader {
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;
    }

    .pulse-circle {
        width: 15px;
        height: 15px;
        background: var(--primary);
        border-radius: 50%;
        animation: pulse-scale 1.4s infinite ease-in-out;
    }

    .pulse-2 {
        animation-delay: 0.2s;
    }

    .pulse-3 {
        animation-delay: 0.4s;
    }

    @keyframes pulse-scale {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1.2);
            opacity: 1;
        }
    }

    .dots-loader {
        display: flex;
        gap: 8px;
    }

    .dot {
        width: 12px;
        height: 12px;
        background: var(--primary);
        border-radius: 50%;
        animation: dot-bounce 1.4s infinite ease-in-out both;
    }

    .dot-2 {
        animation-delay: 0.16s;
    }

    .dot-3 {
        animation-delay: 0.32s;
    }

    @keyframes dot-bounce {
        0%, 80%, 100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1);
        }
    }

    .progress-ring {
        position: relative;
    }

    .progress-circle {
        transform: rotate(-90deg);
        transform-origin: center;
        transition: stroke-dashoffset 0.3s ease;
    }

    .progress-percentage {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: 600;
        color: var(--primary);
    }
`;

document.head.appendChild(loadingStyles);