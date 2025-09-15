// Component Loader
// 공통 헤더와 푸터를 동적으로 로드합니다.

class ComponentLoader {
    constructor() {
        this.componentsLoaded = false;
    }

    // 컴포넌트 로드
    async loadComponents() {
        try {
            console.log('🔄 컴포넌트 로딩 시작...');
            
            // 헤더 로드
            await this.loadComponent('header', 'components/header.html');
            
            // 푸터 로드  
            await this.loadComponent('footer', 'components/footer.html');
            
            // 헤더 이벤트 초기화
            this.initializeHeaderEvents();
            
            this.componentsLoaded = true;
            console.log('✅ 컴포넌트 로딩 완료');
            
            // 컴포넌트 로딩 완료 이벤트 발생
            document.dispatchEvent(new CustomEvent('componentsLoaded'));
            
        } catch (error) {
            console.error('❌ 컴포넌트 로딩 실패:', error);
        }
    }

    // 개별 컴포넌트 로드
    async loadComponent(elementId, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
                console.log(`✅ ${elementId} 컴포넌트 로드 완료`);
            } else {
                console.warn(`⚠️ ${elementId} 요소를 찾을 수 없습니다`);
            }
        } catch (error) {
            console.error(`❌ ${elementId} 컴포넌트 로드 실패:`, error);
        }
    }

    // 헤더 이벤트 초기화
    initializeHeaderEvents() {
        // 햄버거 메뉴 이벤트
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (hamburgerBtn && mobileMenu) {
            let isOpen = false;

            function toggleMenu() {
                isOpen = !isOpen;
                const hamburgerLines = hamburgerBtn.querySelector('.hamburger-lines');
                const closeLines = hamburgerBtn.querySelector('.close-lines');
                
                if (isOpen) {
                    mobileMenu.classList.add('active');
                    hamburgerLines.style.display = 'none';
                    closeLines.style.display = 'block';
                } else {
                    mobileMenu.classList.remove('active');
                    hamburgerLines.style.display = 'block';
                    closeLines.style.display = 'none';
                }
            }

            hamburgerBtn.addEventListener('click', toggleMenu);

            // 메뉴 링크 클릭 시 메뉴 닫기
            const menuLinks = mobileMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (isOpen) {
                        toggleMenu();
                    }
                });
            });

            // 화면 크기 변경 시 메뉴 닫기
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768 && isOpen) {
                    toggleMenu();
                }
            });
        }
    }

    // 컴포넌트 로딩 완료 여부 확인
    isLoaded() {
        return this.componentsLoaded;
    }
}

// 전역 함수 추가 (개별 컴포넌트 로드용)
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentPath} status: ${response.status}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            console.log(`✅ ${componentPath} 컴포넌트 로드 완료`);
        } else {
            console.warn(`⚠️ ${elementId} 요소를 찾을 수 없습니다.`);
        }
    } catch (error) {
        console.error(`❌ 컴포넌트 로드 중 오류 발생 (${componentPath}):`, error);
    }
}

// 전역 인스턴스 생성
window.ComponentLoader = ComponentLoader;
window.componentLoader = new ComponentLoader();
window.loadComponent = loadComponent;
