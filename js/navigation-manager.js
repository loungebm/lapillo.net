// Dynamic Navigation Manager
// 메뉴 데이터를 기반으로 동적 네비게이션을 생성합니다.

class NavigationManager {
    constructor() {
        this.menus = [];
        this.currentPage = this.getCurrentPage();
    }

    // 현재 페이지 감지
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        const urlParams = new URLSearchParams(window.location.search);
        
        // 카테고리 페이지인 경우
        if (filename === 'category.html') {
            return urlParams.get('category') || 'design';
        }
        
        // 파일명에서 확장자 제거
        const pageName = filename.replace('.html', '');
        
        // index 페이지는 특별 처리
        if (pageName === 'index' || pageName === '') {
            return 'index';
        }
        
        return pageName;
    }

    // Firebase에서 메뉴 로드
    async loadMenus() {
        try {
            if (!window.firebaseService) {
                console.error('Firebase 서비스가 없습니다.');
                this.menus = this.getDefaultMenus();
                return;
            }

            this.menus = await window.firebaseService.getAllMenus();
            console.log('📋 네비게이션 메뉴 로드 완료:', this.menus.length, '개');
        } catch (error) {
            console.error('네비게이션 메뉴 로드 실패:', error);
            this.menus = this.getDefaultMenus();
        }
    }

    // 기본 메뉴 (오프라인용)
    getDefaultMenus() {
        return [
            { id: 'design', name: 'Design', slug: 'design', order: 1, enabled: true },
            { id: 'artwork', name: 'Artwork', slug: 'artwork', order: 2, enabled: true },
            { id: 'exhibition', name: 'Exhibition', slug: 'exhibition', order: 3, enabled: true }
        ];
    }

    // 데스크톱 네비게이션 생성
    generateDesktopNavigation() {
        const enabledMenus = this.menus.filter(menu => menu.enabled).sort((a, b) => a.order - b.order);
        
        return enabledMenus.map(menu => {
            const isActive = this.currentPage === menu.slug;
            const activeClass = isActive ? 'border-b-2 border-gray-900' : '';
            const href = `category.html?category=${menu.id}`;
            
            return `<a href="${href}" id="nav-${menu.id}" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium ${activeClass}">${menu.name}</a>`;
        }).join('\n                        ');
    }

    // 모바일 네비게이션 생성
    generateMobileNavigation() {
        const enabledMenus = this.menus.filter(menu => menu.enabled).sort((a, b) => a.order - b.order);
        
        return enabledMenus.map(menu => {
            const isActive = this.currentPage === menu.slug;
            const activeClass = isActive ? 'border-b-2 border-gray-900' : '';
            const href = `category.html?category=${menu.id}`;
            
            return `<a href="${href}" id="mobile-nav-${menu.id}" class="mobile-nav-link ${activeClass}">${menu.name}</a>`;
        }).join('\n                ');
    }

    // 네비게이션 업데이트
    async updateNavigation() {
        await this.loadMenus();
        
        // 데스크톱 네비게이션 업데이트
        const desktopNav = document.getElementById('desktop-navigation');
        if (desktopNav) {
            const aboutLink = '<a href="index.html#about" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">About</a>';
            const contactLink = '<a href="index.html#contact" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">Contact</a>';
            
            desktopNav.innerHTML = `
                        ${this.generateDesktopNavigation()}
                        ${aboutLink}
                        ${contactLink}
            `.trim();
        }

        // 모바일 네비게이션 업데이트
        const mobileNav = document.getElementById('mobile-navigation');
        if (mobileNav) {
            const aboutLink = '<a href="#about" class="mobile-nav-link">About</a>';
            const contactLink = '<a href="#contact" class="mobile-nav-link">Contact</a>';
            const instagramHTML = `
                <div class="mobile-instagram-wrapper">
                <a href="http://instagram.com/studio_lapillo/" target="_blank" class="mobile-instagram">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                    </svg>
                </a>
                </div>
            `;
            
            mobileNav.innerHTML = `
                ${this.generateMobileNavigation()}
                ${aboutLink}
                ${contactLink}
                ${instagramHTML}
            `.trim();
        }

        console.log('📋 네비게이션 업데이트 완료');
    }

    // 현재 메뉴에 active 클래스 설정 (포트폴리오 상세 페이지용)
    setActiveMenu(categoryId) {
        // 모든 네비게이션 링크에서 active 클래스 제거
        const allNavLinks = document.querySelectorAll('[id^="nav-"], [id^="mobile-nav-"]');
        allNavLinks.forEach(link => {
            link.classList.remove('border-b-2', 'border-gray-900');
        });

        // 해당 카테고리 메뉴에 active 클래스 추가
        const desktopLink = document.getElementById(`nav-${categoryId}`);
        const mobileLink = document.getElementById(`mobile-nav-${categoryId}`);
        
        if (desktopLink) {
            desktopLink.classList.add('border-b-2', 'border-gray-900');
        }
        
        if (mobileLink) {
            mobileLink.classList.add('border-b-2', 'border-gray-900');
        }

        console.log(`📋 Active 메뉴 설정: ${categoryId}`);
    }

    // 활성화된 메뉴 목록 반환
    getEnabledMenus() {
        return this.menus.filter(menu => menu.enabled).sort((a, b) => a.order - b.order);
    }

    // 특정 메뉴 존재 여부 확인
    hasMenu(menuId) {
        return this.menus.some(menu => menu.id === menuId && menu.enabled);
    }
}

// 전역 인스턴스 생성
window.NavigationManager = NavigationManager;
window.navigationManager = new NavigationManager();
