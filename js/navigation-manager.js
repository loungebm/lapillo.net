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
            
            return `<a href="${menu.slug}.html" id="nav-${menu.id}" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium ${activeClass}">${menu.name}</a>`;
        }).join('\n                        ');
    }

    // 모바일 네비게이션 생성
    generateMobileNavigation() {
        const enabledMenus = this.menus.filter(menu => menu.enabled).sort((a, b) => a.order - b.order);
        
        return enabledMenus.map(menu => {
            const isActive = this.currentPage === menu.slug;
            const activeClass = isActive ? 'border-b-2 border-gray-900' : '';
            
            return `<a href="${menu.slug}.html" id="mobile-nav-${menu.id}" class="mobile-nav-link ${activeClass}">${menu.name}</a>`;
        }).join('\n                ');
    }

    // 네비게이션 업데이트
    async updateNavigation() {
        await this.loadMenus();
        
        // 데스크톱 네비게이션 업데이트
        const desktopNav = document.querySelector('nav.flex.space-x-8');
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
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            const aboutLink = '<a href="index.html#about" class="mobile-nav-link">About</a>';
            const contactLink = '<a href="index.html#contact" class="mobile-nav-link">Contact</a>';
            const instagramWrapper = mobileNav.querySelector('.mobile-instagram-wrapper');
            
            // 기존 링크들 제거 (인스타그램 제외)
            const links = mobileNav.querySelectorAll('a:not(.mobile-instagram)');
            links.forEach(link => link.remove());
            
            // 새 링크들 추가
            const newLinksHTML = `
                ${this.generateMobileNavigation()}
                ${aboutLink}
                ${contactLink}
            `;
            
            if (instagramWrapper) {
                instagramWrapper.insertAdjacentHTML('beforebegin', newLinksHTML);
            } else {
                mobileNav.innerHTML = newLinksHTML + mobileNav.innerHTML;
            }
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
