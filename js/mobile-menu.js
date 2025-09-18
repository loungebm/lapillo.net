(function () {
    if (window.__mobileMenuInitialized) {
        return;
    }

    let mobileMenuOpen = false;

    function calculateDynamicMenuStyles() {
        const header = document.querySelector('header');
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        if (header) {
            const headerHeight = header.offsetHeight;
            document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
        }

        const availableHeight = viewportHeight - (header ? header.offsetHeight : 80);

        const menuGap = Math.max(0.6, Math.min(1.2, (availableHeight * 0.08) / 16 * 0.8));
        document.documentElement.style.setProperty('--menu-gap', menuGap + 'rem');

        const fontSize = Math.max(1.4, Math.min(2.2, viewportWidth * 0.045 * 0.81));
        document.documentElement.style.setProperty('--menu-font-size', fontSize + 'rem');

        const instagramMargin = Math.max(2, Math.min(4, availableHeight * 0.08));
        document.documentElement.style.setProperty('--instagram-margin', instagramMargin + 'rem');
    }

    function toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerBtn = document.getElementById('hamburger-btn');

        if (!mobileMenu || !hamburgerBtn) {
            return;
        }

        mobileMenuOpen = !mobileMenuOpen;

        if (mobileMenuOpen) {
            calculateDynamicMenuStyles();
            mobileMenu.style.display = 'block';
            mobileMenu.classList.add('show');
            hamburgerBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.remove('show');
            hamburgerBtn.classList.remove('active');
            document.body.style.overflow = 'auto';

            setTimeout(() => {
                if (!mobileMenuOpen) {
                    mobileMenu.style.display = 'none';
                }
            }, 300);
        }
    }

    function attachHandlers() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileNav = document.getElementById('mobile-navigation');

        if (hamburgerBtn && !hamburgerBtn.__handlerBound) {
            hamburgerBtn.addEventListener('click', toggleMobileMenu);
            hamburgerBtn.__handlerBound = true;
        }

        if (mobileNav && !mobileNav.__handlerBound) {
            mobileNav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    toggleMobileMenu();
                }
            });
            mobileNav.__handlerBound = true;
        }

        window.addEventListener('resize', () => {
            if (mobileMenuOpen) {
                if (window.innerWidth > 768) {
                    toggleMobileMenu();
                } else {
                    calculateDynamicMenuStyles();
                }
            }
        });
    }

    async function waitForHeader() {
        const maxAttempts = 50;
        let attempts = 0;
        return new Promise((resolve) => {
            const timer = setInterval(() => {
                const header = document.querySelector('header');
                const hasMenu = document.getElementById('mobile-menu');
                const hasHamburger = document.getElementById('hamburger-btn');
                attempts++;
                if (header && hasMenu && hasHamburger) {
                    clearInterval(timer);
                    resolve(true);
                }
                if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    resolve(false);
                }
            }, 100);
        });
    }

    async function initMobileMenu() {
        const ready = await waitForHeader();
        if (!ready) return;
        attachHandlers();
    }

    window.initMobileMenu = initMobileMenu;

    document.addEventListener('DOMContentLoaded', () => {
        initMobileMenu();
    });

    window.__mobileMenuInitialized = true;
})();


