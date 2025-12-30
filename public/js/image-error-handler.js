// Enhanced Image Error Handler with Mobile Optimization
class ImageErrorHandler {
    constructor() {
        this.fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiNEREREREQiLz4KPHBhdGggZD0iTTE1MCAyMDBMMjAwIDE1MEwyNTAgMjAwVjI1MEgxNTBWMjAwWiIgZmlsbD0iI0RERERERCIvPgo8L3N2Zz4=';
        this.loadingImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMjAiIHN0cm9rZT0iI0IwMDAyMCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIj4KPGFUAW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIHZhbHVlcz0iMCAyMDAgMjAwOzM2MCAyMDAgMjAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgo8L2NpcmNsZT4KPC9zdmc+';
        this.init();
    }

    init() {
        // Handle existing images
        this.handleExistingImages();
        
        // Set up observer for new images
        this.setupImageObserver();
        
        // Add CSS for loading states
        this.addLoadingStyles();
    }

    handleExistingImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.setupImageHandlers(img));
    }

    setupImageObserver() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe images that are added later
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                            images.forEach(img => {
                                this.setupImageHandlers(img);
                                imageObserver.observe(img);
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    setupImageHandlers(img) {
        if (img.dataset.handlerSetup) return;
        img.dataset.handlerSetup = 'true';

        // Show loading state
        if (!img.complete && !img.src.startsWith('data:')) {
            img.classList.add('loading');
        }

        img.addEventListener('load', () => {
            img.classList.remove('loading', 'fallback');
            img.classList.add('loaded');
        });

        img.addEventListener('error', () => {
            this.handleImageError(img);
        });

        // Handle images that are already loaded or failed
        if (img.complete) {
            if (img.naturalWidth === 0) {
                this.handleImageError(img);
            } else {
                img.classList.add('loaded');
            }
        }
    }

    loadImage(img) {
        if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
        }
    }

    handleImageError(img) {
        img.classList.remove('loading');
        img.classList.add('fallback');
        
        // Try alternative sources
        if (img.dataset.fallback && img.src !== img.dataset.fallback) {
            img.src = img.dataset.fallback;
            return;
        }

        // Use default fallback
        img.src = this.fallbackImage;
        img.alt = img.alt || 'Image not available';
        
        // Add retry functionality for mobile
        if (this.isMobile()) {
            this.addRetryButton(img);
        }
    }

    addRetryButton(img) {
        if (img.nextElementSibling?.classList.contains('retry-btn')) return;

        const retryBtn = document.createElement('button');
        retryBtn.className = 'retry-btn';
        retryBtn.innerHTML = '↻ Retry';
        retryBtn.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-red);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            z-index: 10;
        `;

        const container = img.parentElement;
        if (container) {
            container.style.position = 'relative';
            container.appendChild(retryBtn);

            retryBtn.addEventListener('click', () => {
                const originalSrc = img.dataset.originalSrc || img.src;
                img.src = '';
                img.classList.add('loading');
                retryBtn.remove();
                setTimeout(() => {
                    img.src = originalSrc + '?retry=' + Date.now();
                }, 100);
            });
        }
    }

    addLoadingStyles() {
        if (document.getElementById('image-loading-styles')) return;

        const style = document.createElement('style');
        style.id = 'image-loading-styles';
        style.textContent = `
            img.loading {
                opacity: 0.7;
                filter: blur(2px);
                background: #f5f5f5;
                animation: pulse 1.5s ease-in-out infinite alternate;
            }

            img.fallback {
                opacity: 0.8;
                filter: grayscale(100%);
                background: #f5f5f5;
            }

            img.loaded {
                opacity: 1;
                filter: none;
                transition: all 0.3s ease;
            }

            @keyframes pulse {
                from { opacity: 0.7; }
                to { opacity: 0.4; }
            }

            .retry-btn:hover {
                background: #8B0000;
                transform: translate(-50%, -50%) scale(1.05);
            }

            /* Mobile-specific improvements */
            @media (max-width: 768px) {
                img.loading {
                    min-height: 200px;
                    background-image: url('${this.loadingImage}');
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 50px 50px;
                }

                .retry-btn {
                    padding: 0.75rem 1.25rem !important;
                    font-size: 0.9rem !important;
                    min-width: 44px;
                    min-height: 44px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Public method to manually handle an image
    handleImage(img) {
        this.setupImageHandlers(img);
    }

    // Public method to preload images
    preloadImages(urls) {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageHandler = new ImageErrorHandler();
    });
} else {
    window.imageHandler = new ImageErrorHandler();
}

// Export for use in other scripts
window.ImageErrorHandler = ImageErrorHandler;