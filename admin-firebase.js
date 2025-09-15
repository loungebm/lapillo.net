// Portfolio Admin Management System with Firebase
// Firebase CDN 방식으로 구현된 관리자 시스템

// 이미지 관리 전용 클래스
class ImageManager {
    constructor() {
        this.existingImages = []; // 기존 이미지 URL들
        this.newFiles = []; // 새로 추가된 파일들
        this.container = null; // DOM 컨테이너
        this.reset();
    }
    
    reset() {
        this.existingImages = [];
        this.newFiles = [];
        this.updateContainer();
    }
    
    setContainer() {
        this.container = document.getElementById('detail-images-preview');
    }
    
    updateContainer() {
        this.setContainer();
        if (!this.container) return;
        
        // 컨테이너 완전 초기화
        this.container.innerHTML = '';
        
        // 기존 이미지들 먼저 표시
        this.existingImages.forEach((imageUrl, index) => {
            this.createImageItem(imageUrl, index, false);
        });
        
        // 새로운 파일들 표시
        this.newFiles.forEach((file, index) => {
            const actualIndex = this.existingImages.length + index;
            this.createImageItem(file, actualIndex, true);
        });
        
        this.updateAllIndices();
        this.showImageOrderInfo();
    }
    
    createImageItem(source, index, isNewFile) {
        if (!this.container) return;
        
        const imageItem = document.createElement('div');
        imageItem.className = 'multiple-image-item';
        imageItem.dataset.index = index;
        
        if (isNewFile) {
            imageItem.dataset.isNewFile = 'true';
            imageItem.dataset.fileIndex = index - this.existingImages.length;
            
            // 파일인 경우 FileReader 사용
            const reader = new FileReader();
            reader.onload = (e) => {
                this.renderImageContent(imageItem, e.target.result, index);
            };
            reader.readAsDataURL(source);
        } else {
            imageItem.dataset.imageUrl = source;
            // 캐시 버스터 추가
            const imageUrl = source.includes('?') ? `${source}&t=${Date.now()}` : `${source}?t=${Date.now()}`;
            // URL인 경우 바로 렌더링
            this.renderImageContent(imageItem, imageUrl, index);
        }
        
        this.container.appendChild(imageItem);
    }
    
    renderImageContent(imageItem, imageSrc, index) {
        const totalItems = this.existingImages.length + this.newFiles.length;
        imageItem.innerHTML = `
            <div class="image-order-number">${index + 1}</div>
            <div class="image-arrow-controls">
                <button type="button" class="arrow-btn" onclick="window.imageManager.moveUp(${index})" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button type="button" class="arrow-btn" onclick="window.imageManager.moveDown(${index})" ${index === totalItems - 1 ? 'disabled' : ''}>↓</button>
            </div>
            <img src="${imageSrc}" class="multiple-preview-image" alt="Detail image ${index + 1}" loading="lazy">
            <button type="button" class="remove-preview-btn" onclick="window.imageManager.removeImage(${index})">×</button>
        `;
    }
    
    setExistingImages(imageUrls) {
        this.existingImages = [...imageUrls];
        this.updateContainer();
        console.log('🖼️ 기존 이미지 설정:', this.existingImages.length, '개');
    }
    
    addNewFiles(files) {
        this.newFiles.push(...files);
        this.updateContainer();
        console.log('📎 새로운 파일 추가:', files.length, '개, 총:', this.newFiles.length, '개');
    }
    
    moveUp(index) {
        if (index <= 0) return;
        
        // 전체 항목을 하나의 배열로 관리 (순서 변경 시에만)
        const allItems = [...this.existingImages, ...this.newFiles];
        [allItems[index], allItems[index - 1]] = [allItems[index - 1], allItems[index]];
        
        // 다시 분리
        this.existingImages = allItems.slice(0, this.existingImages.length);
        this.newFiles = allItems.slice(this.existingImages.length);
        
        this.updateContainer();
        console.log('⬆️ 이미지 순서 변경:', index, '->', index - 1);
    }
    
    moveDown(index) {
        const totalItems = this.existingImages.length + this.newFiles.length;
        if (index >= totalItems - 1) return;
        
        // 전체 항목을 하나의 배열로 관리 (순서 변경 시에만)
        const allItems = [...this.existingImages, ...this.newFiles];
        [allItems[index], allItems[index + 1]] = [allItems[index + 1], allItems[index]];
        
        // 원래 길이 기준으로 다시 분리 (실제로는 타입으로 구분해야 함)
        const originalExistingLength = this.existingImages.length;
        this.existingImages = [];
        this.newFiles = [];
        
        allItems.forEach((item, i) => {
            if (typeof item === 'string') {
                // URL인 경우 기존 이미지
                this.existingImages.push(item);
            } else {
                // File 객체인 경우 새로운 파일
                this.newFiles.push(item);
            }
        });
        
        this.updateContainer();
        console.log('⬇️ 이미지 순서 변경:', index, '->', index + 1);
    }
    
    removeImage(index) {
        const totalExisting = this.existingImages.length;
        
        if (index < totalExisting) {
            // 기존 이미지 제거
            this.existingImages.splice(index, 1);
        } else {
            // 새로운 파일 제거
            const fileIndex = index - totalExisting;
            this.newFiles.splice(fileIndex, 1);
        }
        
        this.updateContainer();
        console.log(`🗑️ 이미지 ${index + 1} 제거됨`);
    }
    
    updateAllIndices() {
        if (!this.container) return;
        
        const items = Array.from(this.container.children);
        items.forEach((item, index) => {
            item.dataset.index = index;
            
            const orderNumber = item.querySelector('.image-order-number');
            if (orderNumber) {
                orderNumber.textContent = index + 1;
            }
            
            const upBtn = item.querySelector('.arrow-btn:first-child');
            const downBtn = item.querySelector('.arrow-btn:last-child');
            
            if (upBtn) {
                upBtn.disabled = (index === 0);
                upBtn.onclick = () => this.moveUp(index);
            }
            
            if (downBtn) {
                downBtn.disabled = (index === items.length - 1);
                downBtn.onclick = () => this.moveDown(index);
            }
            
            const removeBtn = item.querySelector('.remove-preview-btn');
            if (removeBtn) {
                removeBtn.onclick = () => this.removeImage(index);
            }
        });
    }
    
    showImageOrderInfo() {
        const infoPanel = document.getElementById('image-order-info');
        if (!infoPanel) return;
        
        const totalImages = this.existingImages.length + this.newFiles.length;
        if (totalImages > 0) {
            infoPanel.classList.remove('hidden');
        } else {
            infoPanel.classList.add('hidden');
        }
    }
    
    getAllFiles() {
        return [...this.newFiles];
    }
    
    getAllImageUrls() {
        // 최종 순서대로 기존 이미지 URL만 반환 (저장 시 사용)
        return [...this.existingImages];
    }
    
    getAllItems() {
        // 전체 항목을 순서대로 반환 (URL + File 객체)
        return [...this.existingImages, ...this.newFiles];
    }
    
    clear() {
        this.reset();
    }
}

class PortfolioManager {
    constructor() {
        this.portfolios = [];
        this.menus = [];
        this.currentEditId = null;
        this.currentMenuEditId = null;
        this.uploadInProgress = false;
        this.pendingFiles = [];
        this.firebaseService = null;
        this.imageManager = new ImageManager(); // 새로운 이미지 관리자
        window.imageManager = this.imageManager; // 전역 접근 가능하도록
        // init()는 외부에서 await로 호출됨
    }

    async init() {
        console.log('🔄 PortfolioManager.init() 시작');
        
        // Firebase 초기화 대기
        this.firebaseService = window.firebaseService;
        if (!this.firebaseService) {
            console.error('Firebase가 초기화되지 않았습니다.');
            this.showAlert('Firebase 연결에 실패했습니다. 설정을 확인해주세요.', 'error');
            return;
        }

        console.log('✅ Firebase 서비스 확인됨');
        
        try {
            await this.loadPortfolios();
            console.log('✅ 포트폴리오 로드 완료');
            
            await this.loadMenus();
            console.log('✅ 메뉴 로드 완료');
            
            this.bindEvents();
            console.log('✅ 이벤트 바인딩 완료');
            
            this.renderPortfolios();
            console.log('✅ 포트폴리오 렌더링 완료');
            
            this.renderMenus();
            console.log('✅ 메뉴 렌더링 완료');
            
            this.setupRealtimeUpdates();
            console.log('✅ 실시간 업데이트 설정 완료');
        } catch (error) {
            console.error('❌ PortfolioManager 초기화 중 에러:', error);
            this.showAlert('데이터 로딩에 실패했습니다: ' + error.message, 'error');
        }
    }

    // Firebase에서 포트폴리오 데이터 로드
    async loadPortfolios() {
        try {
            this.portfolios = await this.firebaseService.getAllPortfolios();
            console.log('포트폴리오 데이터 로드 완료:', this.portfolios.length, '개');
        } catch (error) {
            console.error('포트폴리오 로드 실패:', error);
            this.showAlert('데이터 로드에 실패했습니다.', 'error');
            // 실패 시 기본 데이터 사용
            this.portfolios = this.getDefaultPortfolio();
        }
    }

    // Firebase에서 메뉴 데이터 로드
    async loadMenus() {
        try {
            this.menus = await this.firebaseService.getAllMenus();
            console.log('메뉴 데이터 로드 완료:', this.menus.length, '개');
            // 포트폴리오 카테고리 옵션 업데이트
            this.updateCategoryOptions();
        } catch (error) {
            console.error('메뉴 로드 실패:', error);
            this.showAlert('메뉴 데이터 로드에 실패했습니다.', 'error');
            // 실패 시 기본 메뉴 사용
            this.menus = this.firebaseService.getDefaultMenus();
        }
    }

    // 메뉴 목록 렌더링
    renderMenus() {
        const container = document.getElementById('menu-list');
        
        if (!container) {
            console.error('⚠️ menu-list 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        if (this.menus.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">메뉴가 없습니다.</p>';
            return;
        }

        container.innerHTML = this.menus.map(menu => `
            <div class="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div class="flex items-center gap-4">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        ${menu.order}
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">${menu.name}</h4>
                        <p class="text-sm text-gray-500">ID: ${menu.id}</p>
                    </div>
                    ${menu.enabled ? 
                        '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">활성</span>' : 
                        '<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">비활성</span>'
                    }
                </div>
                <div class="flex gap-2">
                    <button onclick="editMenuSafe('${menu.id}')" class="btn-secondary text-sm">편집</button>
                    ${menu.isDeletable ? 
                        `<button onclick="deleteMenuSafe('${menu.id}')" class="btn-secondary text-sm text-red-600">삭제</button>` : 
                        '<span class="text-xs text-gray-400">기본 메뉴</span>'
                    }
                </div>
            </div>
        `).join('');
    }

    // 메뉴 추가 폼 표시
    showAddMenuForm() {
        console.log('➕ 새 메뉴 추가 모드');
        this.currentMenuEditId = null;
        this.clearMenuForm();
        
        const formTitle = document.getElementById('menu-form-title');
        const menuForm = document.getElementById('menu-form');
        const menuNameInput = document.getElementById('menu-name');
        
        if (formTitle) formTitle.textContent = '새 메뉴 추가';
        if (menuForm) menuForm.classList.remove('hidden');
        if (menuNameInput) menuNameInput.focus();
    }

    // 메뉴 편집
    editMenu(menuId) {
        console.log('📝 메뉴 편집:', menuId);
        
        const menu = this.menus.find(m => m.id === menuId);
        if (!menu) {
            console.error('❌ 메뉴를 찾을 수 없음:', menuId);
            this.showAlert(`메뉴를 찾을 수 없습니다: ${menuId}`, 'error');
            return;
        }

        this.currentMenuEditId = menuId;
        this.fillMenuForm(menu);
        
        const formTitle = document.getElementById('menu-form-title');
        const menuForm = document.getElementById('menu-form');
        const menuNameInput = document.getElementById('menu-name');
        
        if (formTitle) formTitle.textContent = '메뉴 편집';
        if (menuForm) menuForm.classList.remove('hidden');
        if (menuNameInput) menuNameInput.focus();
    }

    // 메뉴 폼에 데이터 채우기
    fillMenuForm(menu) {
        const elements = {
            'menu-id': menu.id,
            'menu-name': menu.name || '',
            'menu-order': menu.order || 1
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            } else {
                console.warn(`⚠️ 메뉴 폼 요소를 찾을 수 없음: ${id}`);
            }
        });
    }

    // 메뉴 폼 초기화
    clearMenuForm() {
        const form = document.getElementById('menu-edit-form');
        const menuId = document.getElementById('menu-id');
        
        if (form) form.reset();
        if (menuId) menuId.value = '';
    }

    // 메뉴 폼 숨기기
    hideMenuForm() {
        const menuForm = document.getElementById('menu-form');
        if (menuForm) menuForm.classList.add('hidden');
        
        this.currentMenuEditId = null;
        this.clearMenuForm();
    }

    // 메뉴 저장
    async saveMenu(menuData) {
        try {
            await this.firebaseService.saveMenu(menuData);
            await this.loadMenus();
            this.renderMenus();
            this.hideMenuForm();
            this.showAlert('메뉴가 성공적으로 저장되었습니다!', 'success');
        } catch (error) {
            console.error('메뉴 저장 실패:', error);
            this.showAlert('메뉴 저장 중 오류가 발생했습니다: ' + error.message, 'error');
        }
    }

    // 메뉴 삭제
    async deleteMenu(menuId) {
        if (!confirm('정말로 이 메뉴를 삭제하시겠습니까?\n\n⚠️ 해당 카테고리의 포트폴리오들은 Design 카테고리로 이동됩니다.')) return;

        try {
            // 해당 카테고리의 포트폴리오들을 design으로 변경
            const categoryPortfolios = this.portfolios.filter(p => p.category === menuId);
            
            for (const portfolio of categoryPortfolios) {
                portfolio.category = 'design';
                await this.firebaseService.savePortfolio(portfolio);
            }
            
            // 메뉴 삭제
            await this.firebaseService.deleteMenu(menuId);
            
            await this.loadMenus();
            await this.loadPortfolios();
            this.renderMenus();
            this.renderPortfolios();
            
            this.showAlert('메뉴가 삭제되었습니다. 관련 포트폴리오는 Design 카테고리로 이동되었습니다.', 'success');
        } catch (error) {
            console.error('메뉴 삭제 실패:', error);
            this.showAlert('메뉴 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
        }
    }

    // 메뉴 ID 변경 시 기존 메뉴 삭제 후 새 ID로 포트폴리오 재할당
    async deleteMenuAndReassign(oldId, newId) {
        try {
            console.log(`🔄 메뉴 ID 변경: ${oldId} → ${newId}`);
            
            // 해당 카테고리의 포트폴리오들을 새 ID로 변경
            const categoryPortfolios = this.portfolios.filter(p => p.category === oldId);
            
            console.log(`📦 ${categoryPortfolios.length}개의 포트폴리오를 '${newId}' 카테고리로 이동`);
            
            for (const portfolio of categoryPortfolios) {
                await this.firebaseService.savePortfolio({
                    ...portfolio,
                    category: newId
                });
            }

            // 기존 메뉴 삭제
            await this.firebaseService.deleteMenu(oldId);
            
            console.log(`✅ 메뉴 ID 변경 완료: ${oldId} → ${newId}`);
            
        } catch (error) {
            console.error('❌ 메뉴 ID 변경 실패:', error);
            throw error;
        }
    }

    // 포트폴리오 카테고리 옵션 업데이트
    updateCategoryOptions() {
        const categorySelect = document.getElementById('portfolio-category');
        if (!categorySelect) return;

        // 기존 옵션 제거 (첫 번째 "선택하세요" 옵션은 유지)
        while (categorySelect.children.length > 1) {
            categorySelect.removeChild(categorySelect.lastChild);
        }

        // 활성화된 메뉴들을 옵션으로 추가
        this.menus
            .filter(menu => menu.enabled)
            .forEach(menu => {
                const option = document.createElement('option');
                option.value = menu.id;
                option.textContent = menu.name;
                categorySelect.appendChild(option);
            });
    }

    // 기본 포트폴리오 데이터
    getDefaultPortfolio() {
        return [{
            id: 'pumdt',
            title: '품듯한의원', // 기존 호환성
            englishTitle: 'PUMDT Korean Medicine Clinic',
            koreanTitle: '품듯한의원 - 브랜드 디자인',
            thumbnail: './img/IMG_9699.jpg',
            description: '제주시 소재, <품듯한의원> 을 위한 브랜드 디자인 프로젝트. \'나 스스로를 사려깊게\' 라는 타이틀로 일방적 서비스 제공이 아닌 편안한 소통, 환자 스스로 좋은 습관을 찾도록 돕는 의료 서비스가 목적이다.', // 기존 호환성
            koreanDescription: '제주시 소재, <품듯한의원> 을 위한 브랜드 디자인 프로젝트. \'나 스스로를 사려깊게\' 라는 타이틀로 일방적 서비스 제공이 아닌 편안한 소통, 환자 스스로 좋은 습관을 찾도록 돕는 의료 서비스가 목적이다.\n\n양팔을 벌려 지친 마음까지 품어주는 사람의 형상, 한의원을 통해 상승하는 신체 에너지를 표현하는 곡선 그래픽이 특징이다. 패키지의 색감 및 소재 또한 긴장감 없이 편안한 느낌을 받을 수 있도록 선별되었다.',
            englishDescription: 'Brand design project for PUMDT Korean Medicine Clinic located in Jeju City. With the title "Thoughtfully caring for oneself," the goal is to provide medical services that encourage comfortable communication and help patients find good habits on their own, rather than providing unilateral services.\n\nThe design features the shape of a person spreading their arms to embrace even tired hearts, and curved graphics expressing the rising body energy through the clinic. The colors and materials of the package were also selected to provide a comfortable feeling without tension.',
            project: 'Branding,Package design',
            client: 'PUMDT Korean medicine clinic',
            date: 'Feb, 2022',
            category: 'design', // 카테고리 추가
            subcategory: 'branding', // 서브카테고리 추가
            images: [
                './img/design/pumdt/IMG_1842.jpg',
                './img/design/pumdt/IMG_1855.jpg',
                './img/design/pumdt/IMG_1962.jpg',
                './img/design/pumdt/IMG_1964.jpg',
                './img/design/pumdt/IMG_2066.jpg',
                './img/design/pumdt/IMG_3092.jpg',
                './img/design/pumdt/IMG_3094.jpg',
                './img/design/pumdt/IMG_3109.jpg',
                './img/design/pumdt/IMG_3155.jpg',
                './img/design/pumdt/IMG_3373.jpg',
                './img/design/pumdt/IMG_3391.jpg',
                './img/design/pumdt/IMG_3416.jpg',
                './img/design/pumdt/IMG_3440.jpg',
                './img/design/pumdt/IMG_9696.jpg',
                './img/design/pumdt/IMG_9721.jpg',
                './img/design/pumdt/IMG_9729.jpg',
                './img/design/pumdt/IMG_9746.jpg'
            ],
            createdAt: '2022-02-01',
            updatedAt: '2022-02-01'
        }];
    }

    // 실시간 업데이트 설정
    setupRealtimeUpdates() {
        this.firebaseService.onPortfoliosChange((portfolios) => {
            this.portfolios = portfolios;
            this.renderPortfolios();
            console.log('실시간 업데이트:', portfolios.length, '개 포트폴리오');
        });
    }

    // Firebase에 포트폴리오 데이터 저장
    async savePortfolios() {
        // 개별 저장 방식이므로 여기서는 아무것도 하지 않음
        console.log('Firebase는 개별 저장 방식을 사용합니다.');
    }

    // 이벤트 바인딩
    bindEvents() {
        const form = document.getElementById('portfolio-edit-form');
        
        if (!form) {
            console.error('❌ portfolio-edit-form을 찾을 수 없습니다');
            return;
        }
        
        // 새 이벤트 리스너 추가 (화살표 함수로 this 바인딩 유지)
        form.addEventListener('submit', (e) => {
            console.log('🎯 폼 제출 이벤트 감지');
            e.preventDefault();
            this.handleSubmit(e);
        });
        
        console.log('✅ 폼 이벤트 바인딩 완료');
        
        // 메뉴 폼 이벤트 바인딩
        const menuForm = document.getElementById('menu-edit-form');
        if (menuForm) {
            menuForm.addEventListener('submit', (e) => {
                console.log('🎯 메뉴 폼 제출 이벤트 감지');
                e.preventDefault();
                this.handleMenuSubmit(e);
            });
            console.log('✅ 메뉴 폼 이벤트 바인딩 완료');
        }
        
        // 드래그 앤 드롭 이벤트 설정
        this.setupDragAndDrop();
        
        // 모달 이벤트 설정
        this.setupModalEvents();
    }

    // 로딩 모달 표시
    showSaveLoadingModal() {
        const modal = document.getElementById('save-loading-modal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('💾 저장 로딩 모달 표시');
        }
    }

    // 로딩 모달 숨김
    hideSaveLoadingModal() {
        const modal = document.getElementById('save-loading-modal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('💾 저장 로딩 모달 숨김');
        }
    }

    // 파일 입력 필드 초기화 (중복 업로드 방지)
    clearFileInputs() {
        const thumbnailFile = document.getElementById('thumbnail-file');
        const detailImagesFile = document.getElementById('detail-images-file');
        
        if (thumbnailFile) {
            thumbnailFile.value = '';
            console.log('🧹 썸네일 파일 입력 초기화');
        }
        
        if (detailImagesFile) {
            detailImagesFile.value = '';
            console.log('🧹 상세 이미지 파일 입력 초기화');
        }
    }

    // 포트폴리오 목록 렌더링
    renderPortfolios() {
        const container = document.getElementById('portfolio-list');
        
        if (!container) {
            console.error('⚠️ portfolio-list 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        if (this.portfolios.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">포트폴리오가 없습니다.</p>';
            return;
        }

        // Firebase에서 이미 createdAt 기준으로 정렬된 데이터를 사용
        console.log('🎨 포트폴리오 렌더링:', this.portfolios.map(p => ({id: p.id, title: p.englishTitle || p.title})));
        container.innerHTML = this.portfolios.map(portfolio => `
            <div class="portfolio-row">
                <img src="${portfolio.thumbnail}" alt="${portfolio.englishTitle || portfolio.title}" class="portfolio-thumbnail">
                <div class="portfolio-title">
                    ${portfolio.englishTitle || portfolio.title}
                    ${portfolio.koreanTitle ? `<br><span class="text-sm text-gray-500">${portfolio.koreanTitle}</span>` : ''}
                </div>
                <div class="portfolio-category">
                    <span class="category-badge" data-category="${portfolio.category || 'design'}">${portfolio.category || 'design'}</span>
                </div>
                <div class="portfolio-actions">
                    <button onclick="editPortfolioSafe('${portfolio.id}')" class="btn-secondary">편집</button>
                    <button onclick="deletePortfolioSafe('${portfolio.id}')" class="btn-secondary text-red-600">삭제</button>
                    <a href="portfolio-detail.html?id=${portfolio.id}" target="_blank" class="btn-secondary">미리보기</a>
                </div>
            </div>
        `).join('');
    }

    // 새 포트폴리오 추가 폼 표시
    showAddForm() {
        console.log('➕ 새 포트폴리오 추가 모드');
        this.currentEditId = null;
        this.clearForm();
        
        const formTitle = document.getElementById('form-title');
        const portfolioForm = document.getElementById('portfolio-form');
        const englishTitleInput = document.getElementById('portfolio-english-title');
        
        if (formTitle) {
            formTitle.textContent = '새 포트폴리오 추가';
        }
        if (portfolioForm) {
            portfolioForm.classList.remove('hidden');
        }
        if (englishTitleInput) {
            englishTitleInput.focus();
        }
        
        // 이미지 선택 상태도 초기화
        if (typeof clearSelection === 'function') {
            clearSelection();
        }
    }

    // 포트폴리오 편집
    editPortfolio(id) {
        console.log('📝 editPortfolio 함수 실행:', id);
        console.log('📝 현재 portfolios 배열:', this.portfolios.length, '개');
        
        const portfolio = this.portfolios.find(p => p.id === id);
        console.log('📝 찾은 포트폴리오:', portfolio ? '존재함' : '없음');
        
        if (!portfolio) {
            console.error('❌ 포트폴리오를 찾을 수 없음:', id);
            alert(`포트폴리오를 찾을 수 없습니다: ${id}`);
            return;
        }

        console.log('📝 편집 모드 설정 시작');
        this.currentEditId = id;
        
        try {
            this.fillForm(portfolio);
            console.log('📝 폼 채우기 완료');
            
            const formTitle = document.getElementById('form-title');
            const portfolioForm = document.getElementById('portfolio-form');
            const englishTitleInput = document.getElementById('portfolio-english-title');
            
            if (formTitle) formTitle.textContent = '포트폴리오 편집';
            if (portfolioForm) portfolioForm.classList.remove('hidden');
            if (englishTitleInput) englishTitleInput.focus();
            
            console.log('📝 편집 폼 표시 완료');
        } catch (error) {
            console.error('📝 편집 폼 설정 중 오류:', error);
            alert('편집 폼 설정 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // 폼에 데이터 채우기
    fillForm(portfolio) {
        const elements = {
            'portfolio-id': portfolio.id,
            'portfolio-english-title': portfolio.englishTitle || portfolio.title || '',
            'portfolio-korean-title': portfolio.koreanTitle || '',
            'portfolio-korean-description': portfolio.koreanDescription || portfolio.description || '',
            'portfolio-english-description': portfolio.englishDescription || '',
            'portfolio-project': portfolio.project || '',
            'portfolio-client': portfolio.client || '',
            'portfolio-date': portfolio.date || '',
            'portfolio-category': portfolio.category || 'design', // 기본값 설정
            'portfolio-subcategory': portfolio.subcategory || ''
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            } else {
                console.warn(`⚠️ 폼 요소를 찾을 수 없음: ${id}`);
            }
        });
        
        // 기존 이미지 미리보기 표시
        console.log('🖼️ 편집할 포트폴리오 이미지 정보:', {
            id: portfolio.id,
            thumbnail: portfolio.thumbnail,
            detailImages: portfolio.images?.length || 0,
            detailImageUrls: portfolio.images
        });
        
        if (portfolio.thumbnail) {
            this.showExistingThumbnail(portfolio.thumbnail);
        }
        if (portfolio.images && portfolio.images.length > 0) {
            this.showExistingDetailImages(portfolio.images);
        }
    }

    // 폼 초기화
    clearForm() {
        const form = document.getElementById('portfolio-edit-form');
        const portfolioId = document.getElementById('portfolio-id');
        
        if (form) {
            form.reset();
        } else {
            console.warn('⚠️ 폼을 찾을 수 없음: portfolio-edit-form');
        }
        
        if (portfolioId) {
            portfolioId.value = '';
        }
        
        // 파일 입력 필드도 명시적으로 초기화
        this.clearFileInputs();
        
        this.clearImagePreviews();
    }

    // 폼 숨기기
    hideForm() {
        // 업로드 진행 중이고 실제로 파일 업로드가 있을 때만 확인창 표시
        if (this.uploadInProgress) {
            const hasNewFiles = document.getElementById('thumbnail-file').files.length > 0 || 
                               document.getElementById('detail-images-file').files.length > 0;
            
            if (hasNewFiles && !confirm('파일 업로드가 진행 중입니다. 정말 취소하시겠습니까?')) {
                return;
            }
            this.hideUploadModal();
        }
        
        const portfolioForm = document.getElementById('portfolio-form');
        if (portfolioForm) {
            portfolioForm.classList.add('hidden');
        } else {
            console.warn('⚠️ 폼을 찾을 수 없음: portfolio-form');
        }
        
        this.currentEditId = null;
        this.clearForm();
    }

    // 폼 제출 처리
    async handleSubmit(e) {
        try {
            if (e) e.preventDefault();
            console.log('📝 폼 제출 시작');
        
            // Firebase 서비스 확인
            if (!this.firebaseService) {
                console.error('❌ Firebase 서비스가 초기화되지 않았습니다');
                this.showAlert('Firebase 연결에 실패했습니다. 페이지를 새로고침해주세요.', 'error');
                return;
            }
            
            if (this.uploadInProgress) {
                this.showAlert('업로드가 진행 중입니다. 잠시만 기다려주세요.', 'error');
                return;
            }
            
            // 필수 필드 검증 (null 체크 강화)
            const englishTitleEl = document.getElementById('portfolio-english-title');
            const koreanTitleEl = document.getElementById('portfolio-korean-title');
            const englishDescriptionEl = document.getElementById('portfolio-english-description');
            const koreanDescriptionEl = document.getElementById('portfolio-korean-description');
            const projectEl = document.getElementById('portfolio-project');
            const clientEl = document.getElementById('portfolio-client');
            const dateEl = document.getElementById('portfolio-date');
            const categoryEl = document.getElementById('portfolio-category');
            const subcategoryEl = document.getElementById('portfolio-subcategory');
            
            if (!englishTitleEl || !koreanDescriptionEl || !projectEl || !clientEl || !dateEl || !categoryEl) {
                console.error('❌ 필수 입력 필드를 찾을 수 없습니다');
                this.showAlert('페이지에 오류가 있습니다. 새로고침 후 다시 시도해주세요.', 'error');
                return;
            }
            
            const englishTitle = englishTitleEl.value || '';
            const koreanTitle = koreanTitleEl ? koreanTitleEl.value || '' : '';
            const englishDescription = englishDescriptionEl ? englishDescriptionEl.value || '' : '';
            const koreanDescription = koreanDescriptionEl.value || '';
            const project = projectEl.value || '';
            const client = clientEl.value || '';
            const date = dateEl.value || '';
            const category = categoryEl.value || '';
            const subcategory = subcategoryEl ? subcategoryEl.value || '' : '';
        
            console.log('🔍 필드 값 확인:', {
                englishTitle: englishTitle || '(비어있음)',
                koreanDescription: koreanDescription || '(비어있음)',
                project: project || '(비어있음)',
                client: client || '(비어있음)',
                date: date || '(비어있음)',
                category: category || '(비어있음)'
            });
            
            if (!englishTitle || !koreanDescription || !project || !client || !date || !category) {
                console.log('❌ 필수 필드 누락');
                this.showAlert('모든 필수 필드를 입력해주세요. (카테고리 선택은 필수입니다)', 'error');
                return;
            }
            
            // 업로드할 파일들 수집 (ImageManager에서)
            const thumbnailFile = document.getElementById('thumbnail-file').files[0];
            const detailFiles = this.imageManager.getAllFiles(); // ImageManager에서 새로운 파일들 가져오기
            
            // 기존 이미지 URL들 (ImageManager에서)
            const existingThumbnail = this.currentEditId ? 
                this.portfolios.find(p => p.id === this.currentEditId)?.thumbnail : null;
            
            // 기존 이미지들 (ImageManager에서 가져오기)
            let existingImages = this.imageManager.getAllImageUrls();
            console.log('📋 ImageManager에서 가져온 기존 이미지:', existingImages.length, '개');
            console.log('📋 ImageManager에서 가져온 새로운 파일:', detailFiles.length, '개');
            
        this.uploadInProgress = true;
        this.showSaveLoadingModal();
            
            let thumbnailUrl = existingThumbnail;
            let imageUrls = [...existingImages]; // 기존 이미지 복사
            
            // 포트폴리오 ID 생성 (새로운 경우) 또는 기존 ID 사용
            const portfolioId = this.currentEditId || this.generateId(englishTitle);
            
            console.log('📸 이미지 처리 시작:', {
                기존이미지개수: existingImages.length,
                새썸네일파일: thumbnailFile ? thumbnailFile.name : '없음',
                새상세이미지파일수: detailFiles.length
            });
            
            // 썸네일 업로드 (포트폴리오별 폴더)
            if (thumbnailFile) {
                console.log('📸 썸네일 업로드 시작:', thumbnailFile.name);
                const thumbnailResult = await this.firebaseService.uploadImage(thumbnailFile, `portfolios/${portfolioId}/thumbnails`);
                thumbnailUrl = thumbnailResult.url;
                console.log('✅ 썸네일 업로드 완료:', thumbnailUrl);
                this.showAlert('썸네일 업로드 완료', 'success');
            }
            
            // 새 썸네일이 있는 경우 검증
            if (!thumbnailUrl && !thumbnailFile) {
                this.showAlert('썸네일 이미지는 필수입니다.', 'error');
                this.uploadInProgress = false;
                return;
            }
            
            // 상세 이미지들 업로드 및 순서 재정렬
            if (detailFiles.length > 0) {
                console.log('📸 새로운 상세 이미지 업로드 시작:', detailFiles.length, '개');
                const uploadPromises = detailFiles.map(file => 
                    this.firebaseService.uploadImage(file, `portfolios/${portfolioId}/details`)
                );
                const uploadResults = await Promise.all(uploadPromises);
                const newImageUrls = uploadResults.map(result => result.url);
                
                console.log('✅ 새로운 이미지 업로드 완료:', newImageUrls.length, '개');
                this.showAlert(`${detailFiles.length}개 이미지 업로드 완료`, 'success');
                
                // ImageManager의 순서에 따라 최종 이미지 배열 생성
                const allItems = this.imageManager.getAllItems();
                imageUrls = [];
                
                let existingIndex = 0;
                let newIndex = 0;
                
                allItems.forEach(item => {
                    if (typeof item === 'string') {
                        // 기존 이미지 URL
                        imageUrls.push(item);
                        existingIndex++;
                    } else {
                        // 새로운 파일 (업로드된 URL로 대체)
                        if (newIndex < newImageUrls.length) {
                            imageUrls.push(newImageUrls[newIndex]);
                            newIndex++;
                        }
                    }
                });
                
                console.log('🔄 ImageManager 순서에 따른 최종 배열:', imageUrls.length, '개');
            } else {
                console.log('📸 새로운 상세 이미지 없음, 기존 이미지만 사용:', imageUrls.length, '개');
            }
            
            const portfolioData = {
                id: portfolioId,
                englishTitle,
                koreanTitle,
                title: englishTitle, // 기존 호환성을 위해 유지
                englishDescription,
                koreanDescription,
                description: koreanDescription, // 기존 호환성을 위해 유지
                project,
                client,
                date,
                category,
                subcategory,
                thumbnail: thumbnailUrl,
                images: imageUrls,
                createdAt: this.currentEditId ? 
                    this.portfolios.find(p => p.id === this.currentEditId)?.createdAt : 
                    new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };
            
            // Firebase에 저장
            console.log('🔥 Firebase 저장 시도:', {
                ...portfolioData,
                images: portfolioData.images.map(url => url.substring(url.lastIndexOf('/') + 1))
            });
            console.log('🔥 이미지 순서 (전체 URL):', portfolioData.images);
            console.log('🔥 Firebase 서비스 상태:', this.firebaseService);
            
            const saveResult = await this.firebaseService.savePortfolio(portfolioData);
            console.log('🔥 Firebase 저장 결과:', saveResult);
            
            // 저장 후 데이터 새로고침
            await this.loadPortfolios();
            console.log('✅ 데이터 새로고침 완료');
            
            // 로딩 모달 숨김
            this.hideSaveLoadingModal();
            
            // 파일 입력 필드 초기화 (중복 업로드 방지)
            this.clearFileInputs();
            
            // ImageManager도 초기화
            this.imageManager.clear();
            
            // 편집 모드였다면 업데이트된 데이터로 폼을 다시 채움
            if (this.currentEditId) {
                const updatedPortfolio = this.portfolios.find(p => p.id === this.currentEditId);
                if (updatedPortfolio) {
                    console.log('🔄 편집 폼을 업데이트된 데이터로 새로고침');
                    this.fillForm(updatedPortfolio);
                    
                    // 기존 이미지 미리보기 다시 표시 (새로운 순서 반영)
                    if (updatedPortfolio.thumbnail) {
                        this.showExistingThumbnail(updatedPortfolio.thumbnail);
                    }
                    if (updatedPortfolio.images && updatedPortfolio.images.length > 0) {
                        this.showExistingDetailImages(updatedPortfolio.images);
                    }
                    
                    this.showAlert('포트폴리오가 성공적으로 저장되었습니다! 변경사항이 반영되었습니다.', 'success');
                } else {
                    this.hideForm();
                    this.showAlert('포트폴리오가 성공적으로 저장되었습니다!', 'success');
                }
            } else {
                this.hideForm();
                this.showAlert('포트폴리오가 성공적으로 저장되었습니다!', 'success');
            }
            
            console.log('✅ 저장 프로세스 완료');
            
        } catch (error) {
            console.error('💥 저장 오류 상세:', error);
            console.error('💥 오류 스택:', error.stack);
            console.error('💥 오류 메시지:', error.message);
            console.error('💥 오류 타입:', typeof error);
            
            // 로딩 모달 숨김
            this.hideSaveLoadingModal();
            
            this.showAlert('저장 중 오류가 발생했습니다: ' + (error.message || error.toString()), 'error');
        } finally {
            this.uploadInProgress = false;
            console.log('🔄 업로드 상태 리셋');
        }
    }

    // 메뉴 폼 제출 처리
    async handleMenuSubmit(e) {
        try {
            if (e) e.preventDefault();
            console.log('📝 메뉴 폼 제출 시작');

            // 필수 필드 검증
            const menuNameEl = document.getElementById('menu-name');
            const menuOrderEl = document.getElementById('menu-order');
            
            if (!menuNameEl || !menuOrderEl) {
                console.error('❌ 메뉴 필수 입력 필드를 찾을 수 없습니다');
                this.showAlert('페이지에 오류가 있습니다. 새로고침 후 다시 시도해주세요.', 'error');
                return;
            }
            
            const menuName = menuNameEl.value.trim();
            const menuOrder = parseInt(menuOrderEl.value) || 1;
            
            console.log('🔍 메뉴 필드 값 확인:', {
                name: menuName || '(비어있음)',
                order: menuOrder
            });
            
            if (!menuName) {
                console.log('❌ 메뉴 필수 필드 누락');
                this.showAlert('메뉴명은 필수입니다.', 'error');
                return;
            }

            // 메뉴명 유효성 검사 (영문, 숫자, 하이픈만 허용)
            if (!/^[a-zA-Z0-9-]+$/.test(menuName)) {
                this.showAlert('메뉴명은 영문 대소문자, 숫자, 하이픈(-)만 사용 가능합니다.', 'error');
                return;
            }

            // 중복 확인 (편집 중인 메뉴 제외)
            const existingMenu = this.menus.find(m => 
                m.name === menuName && m.id !== this.currentMenuEditId
            );
            
            if (existingMenu) {
                this.showAlert('이미 존재하는 메뉴명입니다.', 'error');
                return;
            }

            // 메뉴 ID 처리
            let menuId;
            
            if (this.currentMenuEditId) {
                // 기존 메뉴 편집 시
                const newId = menuName.toLowerCase();
                if (this.currentMenuEditId !== newId) {
                    // ID가 변경되는 경우 경고 및 확인
                    const confirmChange = confirm(
                        `메뉴명 변경으로 인해 메뉴 ID가 "${this.currentMenuEditId}"에서 "${newId}"로 변경됩니다.\n` +
                        `이 변경사항은 해당 카테고리의 모든 포트폴리오에 영향을 줄 수 있습니다.\n\n` +
                        `계속하시겠습니까?`
                    );
                    
                    if (!confirmChange) {
                        console.log('👤 사용자가 메뉴 ID 변경을 취소했습니다');
                        return;
                    }
                    
                    // 기존 메뉴 삭제 후 새로운 ID로 생성
                    await this.deleteMenuAndReassign(this.currentMenuEditId, newId);
                }
                menuId = newId;
            } else {
                // 새 메뉴 생성 시
                menuId = menuName.toLowerCase();
            }
            
            const menuData = {
                id: menuId,
                name: menuName,
                order: menuOrder,
                enabled: true,
                isDeletable: menuId !== 'design' // Design 메뉴는 삭제 불가
            };
            
            console.log('💾 메뉴 저장 시도:', menuData);
            
            await this.saveMenu(menuData);
            
        } catch (error) {
            console.error('💥 메뉴 저장 오류:', error);
            this.showAlert('메뉴 저장 중 오류가 발생했습니다: ' + error.message, 'error');
        }
    }

    // 포트폴리오 삭제
    async deletePortfolio(id) {
        if (!confirm('정말로 이 포트폴리오를 삭제하시겠습니까?\n\n⚠️ 관련된 모든 이미지도 함께 삭제됩니다.')) return;

        try {
            const portfolio = this.portfolios.find(p => p.id === id);
            if (portfolio) {
                // 이미지들 먼저 삭제
                await this.firebaseService.deletePortfolioImages(portfolio);
                
                // 포트폴리오 문서 삭제
                await this.firebaseService.deletePortfolio(id);
                
                this.showAlert('포트폴리오가 삭제되었습니다.', 'success');
            }
        } catch (error) {
            console.error('삭제 오류:', error);
            this.showAlert('삭제 중 오류가 발생했습니다: ' + error.message, 'error');
        }
    }

    // ID 생성
    generateId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9가-힣]/g, '')
            .substring(0, 20) + '_' + Date.now();
    }

    // 상세페이지 생성 (기존과 동일)
    generateDetailPage(portfolio) {
        const projectLinks = portfolio.project.split(',')
            .map(p => `<a href="#" class="project-link">${p.trim()}</a>`)
            .join(', ');

        const imageElements = portfolio.images.map(img => `
                <div class="project-image">
                    <img src="${img}" alt="${portfolio.title} Image">
                </div>`).join('\n                ');

        const descriptionParagraphs = portfolio.description.split('\n\n')
            .map(p => `<p>${p}</p>`)
            .join('\n                        ');

        // 상세페이지 HTML 생성 및 다운로드 (기존 코드와 동일)
        // ... (기존 generateDetailPage 내용 그대로 사용)
        this.showAlert('상세페이지가 생성되었습니다.', 'success');
    }

    // 기존 유틸리티 함수들 (그대로 유지)
    showExistingThumbnail(imagePath) {
        const previewContainer = document.getElementById('thumbnail-preview');
        const previewImg = document.getElementById('thumbnail-preview-img');
        
        if (previewContainer && previewImg) {
            previewImg.src = imagePath;
            previewContainer.classList.remove('hidden');
        }
    }

    showExistingDetailImages(imagePaths) {
        console.log('🔄 기존 상세 이미지 표시:', imagePaths.length, '개');
        // 새로운 ImageManager를 사용하여 기존 이미지 설정
        this.imageManager.setExistingImages(imagePaths);
    }

    clearImagePreviews() {
        const thumbnailPreview = document.getElementById('thumbnail-preview');
        
        if (thumbnailPreview) {
            thumbnailPreview.classList.add('hidden');
        }
        
        // ImageManager를 사용하여 상세 이미지 정리
        this.imageManager.clear();
        
        console.log('🧹 이미지 미리보기 모두 정리됨');
    }

    // 이미지 순서 정보 표시
    showImageOrderInfo() {
        const infoPanel = document.getElementById('image-order-info');
        const container = document.getElementById('detail-images-preview');
        
        if (!infoPanel) {
            console.warn('⚠️ image-order-info 요소를 찾을 수 없음');
            return;
        }
        
        if (container && container.children.length > 0) {
            infoPanel.classList.remove('hidden');
            console.log('📋 이미지 순서 정보 패널 표시됨');
        } else {
            infoPanel.classList.add('hidden');
            console.log('📋 이미지 순서 정보 패널 숨김');
        }
    }

    // 기존 상세 이미지 개별 제거
    removeExistingDetailImage(index) {
        if (!this.currentEditId) return;
        
        const portfolio = this.portfolios.find(p => p.id === this.currentEditId);
        if (!portfolio || !portfolio.images) return;
        
        // 이미지 배열에서 해당 인덱스 제거
        portfolio.images.splice(index, 1);
        
        // 미리보기 다시 렌더링
        this.showExistingDetailImages(portfolio.images);
        
        this.showAlert(`이미지가 제거되었습니다. (${portfolio.images.length}개 남음)`, 'success');
    }

    // 드래그 앤 드롭 설정
    setupDragAndDrop() {
        const thumbnailLabel = document.querySelector('label[for="thumbnail-file"]');
        const detailImagesLabel = document.querySelector('label[for="detail-images-file"]');

        [thumbnailLabel, detailImagesLabel].forEach(label => {
            if (!label) return;

            label.addEventListener('dragover', (e) => {
                e.preventDefault();
                label.classList.add('drag-over');
            });

            label.addEventListener('dragleave', (e) => {
                e.preventDefault();
                label.classList.remove('drag-over');
            });

            label.addEventListener('drop', (e) => {
                e.preventDefault();
                label.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    if (label.getAttribute('for') === 'thumbnail-file') {
                        document.getElementById('thumbnail-file').files = files;
                        previewThumbnail(document.getElementById('thumbnail-file'));
                    } else {
                        document.getElementById('detail-images-file').files = files;
                        previewDetailImages(document.getElementById('detail-images-file'));
                    }
                }
            });
        });
    }

    // 모달 이벤트 설정 (기존과 동일)
    setupModalEvents() {
        // 기존 모달 관련 코드 유지
    }

    // 알림 표시
    showAlert(message, type = 'success') {
        const container = document.getElementById('alert-container');
        const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alertClass}`;
        alertElement.textContent = message;
        
        container.appendChild(alertElement);
        
        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    }
}

// 전역 함수들
function showAddForm() {
    if (window.portfolioManager) {
        window.portfolioManager.showAddForm();
    }
}

function hideForm() {
    if (window.portfolioManager) {
        window.portfolioManager.hideForm();
    }
}

// 썸네일 이미지 미리보기
function previewThumbnail(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        portfolioManager.showAlert('이미지 파일만 업로드 가능합니다.', 'error');
        input.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        portfolioManager.showAlert('파일 크기는 5MB 이하여야 합니다.', 'error');
        input.value = '';
        return;
    }
    
    const previewContainer = document.getElementById('thumbnail-preview');
    const previewImg = document.getElementById('thumbnail-preview-img');
    
    if (previewContainer && previewImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// 썸네일 미리보기 제거
function removeThumbnailPreview() {
    const previewContainer = document.getElementById('thumbnail-preview');
    const fileInput = document.getElementById('thumbnail-file');
    
    if (previewContainer) previewContainer.classList.add('hidden');
    if (fileInput) fileInput.value = '';
}

// 상세 이미지들 미리보기
function previewDetailImages(input) {
    const files = Array.from(input.files);
    if (files.length === 0) return;
    
    // 이미지 파일 검증
    for (const file of files) {
        if (!file.type.startsWith('image/')) {
            portfolioManager.showAlert('이미지 파일만 업로드 가능합니다.', 'error');
            input.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            portfolioManager.showAlert('각 파일의 크기는 5MB 이하여야 합니다.', 'error');
            input.value = '';
            return;
        }
    }
    
    // 새로운 ImageManager를 사용하여 파일 추가
    window.imageManager.addNewFiles(files);
    
    // 파일 입력 초기화 (중복 방지)
    input.value = '';
    
    console.log(`📷 새로운 이미지 ${files.length}개가 ImageManager에 추가됨`);
}

// ImageManager 전역 함수들 (호환성을 위해)
function removeDetailImageByIndex(index) {
    if (window.imageManager) {
        window.imageManager.removeImage(index);
    }
}

function moveImageUp(index) {
    if (window.imageManager) {
        window.imageManager.moveUp(index);
    }
}

function moveImageDown(index) {
    if (window.imageManager) {
        window.imageManager.moveDown(index);
    }
}

function updateImageOrder() {
    if (window.imageManager) {
        window.imageManager.updateAllIndices();
    }
}

// 전역 스코프에 함수들 바인딩
window.showAddForm = showAddForm;
window.hideForm = hideForm;
window.previewThumbnail = previewThumbnail;
window.removeThumbnailPreview = removeThumbnailPreview;
window.previewDetailImages = previewDetailImages;
window.removeDetailImageByIndex = removeDetailImageByIndex;
window.moveImageUp = moveImageUp;
window.moveImageDown = moveImageDown;
window.updateImageOrder = updateImageOrder;

// 전역 편집/삭제 함수들 (안전한 접근)
window.editPortfolioSafe = function(id) {
    console.log('🔧 편집 버튼 클릭:', id);
    console.log('🔧 portfolioManager 상태:', window.portfolioManager);
    console.log('🔧 editPortfolio 함수 존재:', typeof window.portfolioManager?.editPortfolio);
    
    // ID 유효성 검사
    if (!id) {
        console.error('❌ 포트폴리오 ID가 없습니다:', id);
        alert('포트폴리오 ID가 올바르지 않습니다.');
        return;
    }
    
    // DOM 요소들이 준비되었는지 확인
    const requiredElements = ['portfolio-form', 'form-title', 'portfolio-english-title'];
    const missingElements = requiredElements.filter(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`❌ DOM 요소 없음: ${elementId}`);
            return true;
        }
        return false;
    });
    
    if (missingElements.length > 0) {
        console.error('❌ 필요한 DOM 요소가 없습니다:', missingElements);
        alert('페이지가 완전히 로드되지 않았습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    if (window.portfolioManager && typeof window.portfolioManager.editPortfolio === 'function') {
        try {
            console.log('🔧 editPortfolio 함수 호출 시작');
            window.portfolioManager.editPortfolio(id);
            console.log('🔧 editPortfolio 함수 호출 완료');
        } catch (error) {
            console.error('🔧 editPortfolio 호출 중 오류:', error);
            alert('편집 중 오류가 발생했습니다: ' + error.message);
        }
    } else {
        console.error('❌ portfolioManager가 초기화되지 않았습니다');
        console.error('❌ portfolioManager:', window.portfolioManager);
        console.error('❌ editPortfolio 타입:', typeof window.portfolioManager?.editPortfolio);
        alert('시스템이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
};

window.deletePortfolioSafe = function(id) {
    console.log('🗑️ 삭제 버튼 클릭:', id);
    if (window.portfolioManager && typeof window.portfolioManager.deletePortfolio === 'function') {
        window.portfolioManager.deletePortfolio(id);
    } else {
        console.error('❌ portfolioManager가 초기화되지 않았습니다');
        alert('시스템이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
};

// 전역 메뉴 관리 함수들
window.showAddMenuForm = function() {
    if (window.portfolioManager && typeof window.portfolioManager.showAddMenuForm === 'function') {
        window.portfolioManager.showAddMenuForm();
    } else {
        console.error('❌ portfolioManager가 초기화되지 않았습니다');
        alert('시스템이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
};

window.hideMenuForm = function() {
    if (window.portfolioManager && typeof window.portfolioManager.hideMenuForm === 'function') {
        window.portfolioManager.hideMenuForm();
    } else {
        console.error('❌ portfolioManager가 초기화되지 않았습니다');
    }
};

window.editMenuSafe = function(id) {
    console.log('🔧 메뉴 편집 버튼 클릭:', id);
    
    if (!id) {
        console.error('❌ 메뉴 ID가 없습니다:', id);
        alert('메뉴 ID가 올바르지 않습니다.');
        return;
    }
    
    if (window.portfolioManager && typeof window.portfolioManager.editMenu === 'function') {
        try {
            console.log('🔧 editMenu 함수 호출 시작');
            window.portfolioManager.editMenu(id);
            console.log('🔧 editMenu 함수 호출 완료');
        } catch (error) {
            console.error('🔧 editMenu 호출 중 오류:', error);
            alert('메뉴 편집 중 오류가 발생했습니다: ' + error.message);
        }
    } else {
        console.error('❌ portfolioManager가 초기화되지 않았습니다');
        alert('시스템이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
};

window.deleteMenuSafe = function(id) {
    console.log('🗑️ 메뉴 삭제 버튼 클릭:', id);
    
    if (!id) {
        console.error('❌ 메뉴 ID가 없습니다:', id);
        alert('메뉴 ID가 올바르지 않습니다.');
        return;
    }
    
    if (window.portfolioManager && typeof window.portfolioManager.deleteMenu === 'function') {
        try {
            console.log('🗑️ deleteMenu 함수 호출 시작');
            window.portfolioManager.deleteMenu(id);
            console.log('🗑️ deleteMenu 함수 호출 완료');
        } catch (error) {
            console.error('🗑️ deleteMenu 호출 중 오류:', error);
            alert('메뉴 삭제 중 오류가 발생했습니다: ' + error.message);
        }
    } else {
        console.error('❌ portfolioManager가 초기화되지 않았습니다');
        alert('시스템이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
};

// 새로운 이미지 순서 관리 시스템 (인스타그램 스타일)
// 기존 화살표 버튼 및 순서 관리 함수들은 ImageManager로 완전 대체됨

// 앱 초기화
let portfolioManager;

async function initializeApp() {
    console.log('🔄 앱 초기화 시작...');
    
    // 필수 DOM 요소들이 있는지 확인
    const requiredElements = ['portfolio-list', 'portfolio-form', 'form-title', 'alert-container'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ 필수 DOM 요소가 없습니다:', missingElements);
        setTimeout(initializeApp, 100); // 100ms 후 재시도
        return;
    }
    
    // Firebase 로드 확인 후 초기화
    if (typeof firebase !== 'undefined' && window.firebaseService) {
        console.log('✅ Firebase 라이브러리 및 서비스 확인됨');
        try {
            portfolioManager = new PortfolioManager();
            window.portfolioManager = portfolioManager;
            
            // 비동기 초기화 완료까지 대기
            await portfolioManager.init();
            
            console.log('✅ PortfolioManager 완전 초기화 완료');
            console.log('🔧 편집/삭제 함수 테스트:', {
                editFunction: typeof window.editPortfolioSafe,
                deleteFunction: typeof window.deletePortfolioSafe,
                managerObject: typeof window.portfolioManager,
                portfolioCount: portfolioManager.portfolios.length
            });
        } catch (error) {
            console.error('❌ PortfolioManager 초기화 실패:', error);
            const alertContainer = document.getElementById('alert-container');
            if (alertContainer) {
                alertContainer.innerHTML = 
                    '<div class="alert alert-error">시스템 초기화에 실패했습니다. 페이지를 새로고침해주세요.</div>';
            }
        }
    } else {
        console.error('❌ Firebase가 로드되지 않았습니다.');
        console.log('Firebase 상태:', {
            firebaseLoaded: typeof firebase !== 'undefined',
            firebaseServiceExists: !!window.firebaseService
        });
        
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = 
                '<div class="alert alert-error">Firebase 연결에 실패했습니다. 페이지를 새로고침해주세요.</div>';
        }
        // Firebase 로딩을 기다려서 재시도
        setTimeout(initializeApp, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM 로딩 완료');
    // 약간의 지연 후 초기화 (Firebase 로딩 대기)
    setTimeout(initializeApp, 200);
});
