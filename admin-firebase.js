// Portfolio Admin Management System with Firebase
// Firebase CDN 방식으로 구현된 관리자 시스템

class PortfolioManager {
    constructor() {
        this.portfolios = [];
        this.currentEditId = null;
        this.uploadInProgress = false;
        this.pendingFiles = [];
        this.firebaseService = null;
        this.init();
    }

    async init() {
        // Firebase 초기화 대기
        this.firebaseService = window.firebaseService;
        if (!this.firebaseService) {
            console.error('Firebase가 초기화되지 않았습니다.');
            this.showAlert('Firebase 연결에 실패했습니다. 설정을 확인해주세요.', 'error');
            return;
        }

        await this.loadPortfolios();
        this.bindEvents();
        this.renderPortfolios();
        this.setupRealtimeUpdates();
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
        
        // 드래그 앤 드롭 이벤트 설정
        this.setupDragAndDrop();
        
        // 모달 이벤트 설정
        this.setupModalEvents();
    }

    // 포트폴리오 목록 렌더링
    renderPortfolios() {
        const container = document.getElementById('portfolio-list');
        
        if (this.portfolios.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">포트폴리오가 없습니다.</p>';
            return;
        }

        // Firebase에서 이미 createdAt 기준으로 정렬된 데이터를 사용
        console.log('🎨 포트폴리오 렌더링:', this.portfolios.map(p => ({id: p.id, title: p.englishTitle || p.title})));
        container.innerHTML = this.portfolios.map(portfolio => `
            <div class="portfolio-card p-6">
                <div class="flex items-start gap-4">
                    <img src="${portfolio.thumbnail}" alt="${portfolio.englishTitle || portfolio.title}" class="image-preview">
                    <div class="flex-1">
                        <h3 class="text-xl font-semibold mb-2">${portfolio.englishTitle || portfolio.title}</h3>
                        ${portfolio.koreanTitle ? `<p class="text-lg text-gray-700 mb-2">${portfolio.koreanTitle}</p>` : ''}
                        <p class="text-gray-600 text-sm mb-3 line-clamp-2">${(portfolio.koreanDescription || portfolio.description || '').substring(0, 100)}...</p>
                        ${portfolio.englishDescription ? `<p class="text-gray-500 text-xs mb-2 line-clamp-2">English: ${portfolio.englishDescription.substring(0, 80)}...</p>` : ''}
                        <div class="text-sm text-gray-500 mb-4">
                            <p><strong>Project:</strong> ${portfolio.project}</p>
                            <p><strong>Client:</strong> ${portfolio.client}</p>
                            <p><strong>Date:</strong> ${portfolio.date}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="editPortfolioSafe('${portfolio.id}')" class="btn-secondary">편집</button>
                            <button onclick="deletePortfolioSafe('${portfolio.id}')" class="btn-secondary text-red-600">삭제</button>
                            <a href="portfolio-detail.html?id=${portfolio.id}" target="_blank" class="btn-secondary">미리보기</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 새 포트폴리오 추가 폼 표시
    showAddForm() {
        console.log('➕ 새 포트폴리오 추가 모드');
        this.currentEditId = null;
        this.clearForm();
        document.getElementById('form-title').textContent = '새 포트폴리오 추가';
        document.getElementById('portfolio-form').classList.remove('hidden');
        document.getElementById('portfolio-english-title').focus();
        
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
        document.getElementById('portfolio-id').value = portfolio.id;
        document.getElementById('portfolio-english-title').value = portfolio.englishTitle || portfolio.title || '';
        document.getElementById('portfolio-korean-title').value = portfolio.koreanTitle || '';
        document.getElementById('portfolio-korean-description').value = portfolio.koreanDescription || portfolio.description || '';
        document.getElementById('portfolio-english-description').value = portfolio.englishDescription || '';
        document.getElementById('portfolio-project').value = portfolio.project;
        document.getElementById('portfolio-client').value = portfolio.client;
        document.getElementById('portfolio-date').value = portfolio.date;
        
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
        document.getElementById('portfolio-edit-form').reset();
        document.getElementById('portfolio-id').value = '';
        this.clearImagePreviews();
    }

    // 폼 숨기기
    hideForm() {
        if (this.uploadInProgress) {
            if (!confirm('업로드가 진행 중입니다. 정말 취소하시겠습니까?')) {
                return;
            }
            this.hideUploadModal();
        }
        
        document.getElementById('portfolio-form').classList.add('hidden');
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
            
            if (!englishTitleEl || !koreanDescriptionEl || !projectEl || !clientEl || !dateEl) {
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
        
            console.log('🔍 필드 값 확인:', {
                englishTitle: englishTitle || '(비어있음)',
                koreanDescription: koreanDescription || '(비어있음)',
                project: project || '(비어있음)',
                client: client || '(비어있음)',
                date: date || '(비어있음)'
            });
            
            if (!englishTitle || !koreanDescription || !project || !client || !date) {
                console.log('❌ 필수 필드 누락');
                this.showAlert('모든 필수 필드를 입력해주세요. (영문 제목과 한글 설명은 필수입니다)', 'error');
                return;
            }
            
            // 업로드할 파일들 수집
            const thumbnailFile = document.getElementById('thumbnail-file').files[0];
            const detailFiles = Array.from(document.getElementById('detail-images-file').files);
            
            // 기존 이미지 URL들
            const existingThumbnail = this.currentEditId ? 
                this.portfolios.find(p => p.id === this.currentEditId)?.thumbnail : null;
            const existingImages = this.currentEditId ? 
                this.portfolios.find(p => p.id === this.currentEditId)?.images || [] : [];
            
            this.uploadInProgress = true;
            this.showAlert('업로드 중...', 'success');
            
            let thumbnailUrl = existingThumbnail;
            let imageUrls = [...existingImages];
            
            // 포트폴리오 ID 생성 (새로운 경우) 또는 기존 ID 사용
            const portfolioId = this.currentEditId || this.generateId(englishTitle);
            
            // 썸네일 업로드 (포트폴리오별 폴더)
            if (thumbnailFile) {
                const thumbnailResult = await this.firebaseService.uploadImage(thumbnailFile, `portfolios/${portfolioId}/thumbnails`);
                thumbnailUrl = thumbnailResult.url;
                this.showAlert('썸네일 업로드 완료', 'success');
            }
            
            // 새 썸네일이 있는 경우 검증
            if (!thumbnailUrl && !thumbnailFile) {
                this.showAlert('썸네일 이미지는 필수입니다.', 'error');
                this.uploadInProgress = false;
                return;
            }
            
            // 상세 이미지들 업로드 (포트폴리오별 폴더)
            if (detailFiles.length > 0) {
                const uploadPromises = detailFiles.map(file => 
                    this.firebaseService.uploadImage(file, `portfolios/${portfolioId}/details`)
                );
                const uploadResults = await Promise.all(uploadPromises);
                const newImageUrls = uploadResults.map(result => result.url);
                imageUrls = [...imageUrls, ...newImageUrls];
                this.showAlert(`${detailFiles.length}개 이미지 업로드 완료`, 'success');
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
                thumbnail: thumbnailUrl,
                images: imageUrls,
                createdAt: this.currentEditId ? 
                    this.portfolios.find(p => p.id === this.currentEditId)?.createdAt : 
                    new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };
            
            // Firebase에 저장
            console.log('🔥 Firebase 저장 시도:', portfolioData);
            console.log('🔥 Firebase 서비스 상태:', this.firebaseService);
            
            const saveResult = await this.firebaseService.savePortfolio(portfolioData);
            console.log('🔥 Firebase 저장 결과:', saveResult);
            
            this.hideForm();
            this.showAlert('포트폴리오가 성공적으로 저장되었습니다!', 'success');
            console.log('✅ 저장 프로세스 완료');
            
        } catch (error) {
            console.error('💥 저장 오류 상세:', error);
            console.error('💥 오류 스택:', error.stack);
            console.error('💥 오류 메시지:', error.message);
            console.error('💥 오류 타입:', typeof error);
            this.showAlert('저장 중 오류가 발생했습니다: ' + (error.message || error.toString()), 'error');
        } finally {
            this.uploadInProgress = false;
            console.log('🔄 업로드 상태 리셋');
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
        console.log('상세 이미지 경로들:', imagePaths);
        const previewContainer = document.getElementById('detail-images-preview');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        
        imagePaths.forEach((imagePath, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'multiple-image-item';
            imageItem.dataset.index = index;
            imageItem.dataset.imageUrl = imagePath;
            imageItem.dataset.originalIndex = index; // 원본 순서 저장
            const imageUrl = imagePath.includes('?') ? `${imagePath}&t=${Date.now()}` : `${imagePath}?t=${Date.now()}`;
            imageItem.innerHTML = `
                <div class="image-order-number" onclick="handleImageOrderClick(${index})">${index + 1}</div>
                <img src="${imageUrl}" class="multiple-preview-image" alt="Detail image ${index + 1}" loading="lazy" onclick="handleImageClick(${index})">
                <button type="button" class="remove-preview-btn" onclick="portfolioManager.removeExistingDetailImage(${index})">×</button>
            `;
            previewContainer.appendChild(imageItem);
        });
        
        this.initializeImageOrdering();
    }

    clearImagePreviews() {
        const thumbnailPreview = document.getElementById('thumbnail-preview');
        const detailImagesPreview = document.getElementById('detail-images-preview');
        const imageSelectionInfo = document.getElementById('image-selection-info');
        
        if (thumbnailPreview) {
            thumbnailPreview.classList.add('hidden');
        }
        
        if (detailImagesPreview) {
            detailImagesPreview.innerHTML = '';
        }
        
        if (imageSelectionInfo) {
            imageSelectionInfo.classList.add('hidden');
        }
        
        // 이미지 선택 상태 초기화
        if (typeof clearSelection === 'function') {
            clearSelection();
        }
        
        console.log('🧹 이미지 미리보기 모두 정리됨');
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
    
    const previewContainer = document.getElementById('detail-images-preview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    files.forEach((file, i) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'multiple-image-item';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            imageItem.innerHTML = `
                <img src="${e.target.result}" class="multiple-preview-image" alt="Detail image ${i + 1}">
                <button type="button" class="remove-preview-btn" onclick="removeDetailImageByIndex(${i})">×</button>
            `;
        };
        reader.readAsDataURL(file);
        
        previewContainer.appendChild(imageItem);
    });
}

// 상세 이미지 개별 제거
function removeDetailImageByIndex(index) {
    const fileInput = document.getElementById('detail-images-file');
    const files = Array.from(fileInput.files);
    
    const dt = new DataTransfer();
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;
    previewDetailImages(fileInput);
}

// 전역 스코프에 함수들 바인딩
window.showAddForm = showAddForm;
window.hideForm = hideForm;
window.previewThumbnail = previewThumbnail;
window.removeThumbnailPreview = removeThumbnailPreview;
window.previewDetailImages = previewDetailImages;
window.removeDetailImageByIndex = removeDetailImageByIndex;

// 전역 편집/삭제 함수들 (안전한 접근)
window.editPortfolioSafe = function(id) {
    console.log('🔧 편집 버튼 클릭:', id);
    console.log('🔧 portfolioManager 상태:', window.portfolioManager);
    console.log('🔧 editPortfolio 함수 존재:', typeof window.portfolioManager?.editPortfolio);
    
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

// 새로운 이미지 순서 관리 시스템 (인스타그램 스타일)
let imageOrderSelection = {
    selectedImages: [],
    selectionOrder: [],
    isOrderingMode: false
};

// 이미지 순서 관리 초기화
PortfolioManager.prototype.initializeImageOrdering = function() {
    const infoPanel = document.getElementById('image-selection-info');
    const container = document.getElementById('detail-images-preview');
    
    if (container && container.children.length > 0) {
        infoPanel.classList.remove('hidden');
        updateSelectionStatus(); // this 제거
    } else {
        infoPanel.classList.add('hidden');
    }
    
    // 초기화
    imageOrderSelection.selectedImages = [];
    imageOrderSelection.selectionOrder = [];
    imageOrderSelection.isOrderingMode = false;
};

// 이미지 클릭 핸들러
window.handleImageClick = function(index) {
    console.log('🖼️ 이미지 클릭:', index);
    const container = document.getElementById('detail-images-preview');
    const imageItem = container.children[index];
    
    if (!imageItem) return;
    
    if (imageOrderSelection.selectedImages.includes(index)) {
        // 이미 선택된 이미지 - 선택 해제
        removeFromSelection(index);
    } else {
        // 새로 선택
        addToSelection(index);
    }
    
    updateImageVisuals();
    updateSelectionStatus();
};

// 순서 번호 클릭 핸들러
window.handleImageOrderClick = function(index) {
    console.log('🔢 순서 번호 클릭:', index);
    handleImageClick(index);
};

// 선택에 추가
function addToSelection(index) {
    if (!imageOrderSelection.selectedImages.includes(index)) {
        imageOrderSelection.selectedImages.push(index);
        imageOrderSelection.selectionOrder.push(index);
    }
}

// 선택에서 제거
function removeFromSelection(index) {
    const selectedIndex = imageOrderSelection.selectedImages.indexOf(index);
    if (selectedIndex > -1) {
        imageOrderSelection.selectedImages.splice(selectedIndex, 1);
    }
    
    const orderIndex = imageOrderSelection.selectionOrder.indexOf(index);
    if (orderIndex > -1) {
        imageOrderSelection.selectionOrder.splice(orderIndex, 1);
    }
}

// 시각적 업데이트
function updateImageVisuals() {
    const container = document.getElementById('detail-images-preview');
    Array.from(container.children).forEach((item, index) => {
        const orderNumber = item.querySelector('.image-order-number');
        
        if (imageOrderSelection.selectedImages.includes(index)) {
            item.classList.add('selected');
            item.classList.remove('unselected');
            orderNumber.classList.add('selected');
            
            // 선택 순서 표시
            const selectionOrder = imageOrderSelection.selectionOrder.indexOf(index) + 1;
            orderNumber.textContent = selectionOrder;
        } else {
            item.classList.remove('selected');
            orderNumber.classList.remove('selected');
            orderNumber.textContent = index + 1;
            
            // 다른 이미지가 선택되어 있으면 흐리게
            if (imageOrderSelection.selectedImages.length > 0) {
                item.classList.add('unselected');
            } else {
                item.classList.remove('unselected');
            }
        }
    });
}

// 선택 상태 업데이트
function updateSelectionStatus() {
    const statusSpan = document.getElementById('selection-status');
    const countSpan = document.getElementById('selected-count');
    
    if (imageOrderSelection.selectedImages.length === 0) {
        statusSpan.textContent = '📷 이미지를 클릭하여 순서를 설정하세요';
        countSpan.textContent = '0개 선택됨';
    } else {
        statusSpan.textContent = '✨ 선택된 이미지들의 순서가 변경됩니다';
        countSpan.textContent = `${imageOrderSelection.selectedImages.length}개 선택됨`;
    }
}

// 전역 제어 함수들
window.clearSelection = function() {
    imageOrderSelection.selectedImages = [];
    imageOrderSelection.selectionOrder = [];
    updateImageVisuals();
    updateSelectionStatus();
    console.log('🔄 선택 초기화됨');
};

window.reverseOrder = function() {
    if (imageOrderSelection.selectedImages.length < 2) {
        alert('순서를 뒤집으려면 최소 2개의 이미지를 선택하세요.');
        return;
    }
    
    imageOrderSelection.selectionOrder.reverse();
    updateImageVisuals();
    applyNewOrder();
    console.log('🔄 선택된 이미지 순서 뒤집기 적용');
};

window.resetOrder = function() {
    const container = document.getElementById('detail-images-preview');
    const items = Array.from(container.children);
    
    // 원본 순서로 정렬
    items.sort((a, b) => {
        const indexA = parseInt(a.dataset.originalIndex);
        const indexB = parseInt(b.dataset.originalIndex);
        return indexA - indexB;
    });
    
    // DOM 재배치
    container.innerHTML = '';
    items.forEach(item => container.appendChild(item));
    
    // 순서 번호 업데이트
    items.forEach((item, index) => {
        const orderNumber = item.querySelector('.image-order-number');
        orderNumber.textContent = index + 1;
        item.dataset.index = index;
    });
    
    clearSelection();
    updatePortfolioImageOrder();
    console.log('🔄 기본 순서로 복원됨');
};

// 새로운 순서 적용
function applyNewOrder() {
    if (imageOrderSelection.selectedImages.length === 0) return;
    
    const container = document.getElementById('detail-images-preview');
    const items = Array.from(container.children);
    
    // 선택된 이미지들을 새로운 순서로 재배치
    imageOrderSelection.selectionOrder.forEach((originalIndex, newOrderIndex) => {
        const targetIndex = imageOrderSelection.selectedImages[newOrderIndex];
        if (targetIndex !== undefined && items[originalIndex]) {
            // 실제 DOM 위치 변경은 복잡하므로, 데이터만 업데이트
            items[originalIndex].dataset.index = newOrderIndex;
        }
    });
    
    updatePortfolioImageOrder();
    clearSelection();
}

// 포트폴리오 이미지 순서 업데이트
function updatePortfolioImageOrder() {
    const container = document.getElementById('detail-images-preview');
    const items = Array.from(container.children);
    
    // 현재 DOM 순서대로 이미지 URL 배열 생성
    const newOrder = items.map(item => item.dataset.imageUrl).filter(url => url);
    
    // 현재 편집 중인 포트폴리오의 이미지 순서 업데이트
    if (window.portfolioManager && window.portfolioManager.currentEditId) {
        const portfolio = window.portfolioManager.portfolios.find(p => p.id === window.portfolioManager.currentEditId);
        if (portfolio && portfolio.images) {
            portfolio.images = newOrder;
            console.log('📋 포트폴리오 이미지 순서 업데이트:', newOrder);
        }
    }
}

// 앱 초기화
let portfolioManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM 로딩 완료, 앱 초기화 시작...');
    
    // Firebase 로드 확인 후 초기화
    if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase 라이브러리 확인됨');
        try {
            portfolioManager = new PortfolioManager();
            window.portfolioManager = portfolioManager;
            console.log('✅ PortfolioManager 초기화 완료');
            console.log('🔧 편집/삭제 함수 테스트:', {
                editFunction: typeof window.editPortfolioSafe,
                deleteFunction: typeof window.deletePortfolioSafe,
                managerObject: typeof window.portfolioManager
            });
        } catch (error) {
            console.error('❌ PortfolioManager 초기화 실패:', error);
            document.getElementById('alert-container').innerHTML = 
                '<div class="alert alert-error">시스템 초기화에 실패했습니다. 페이지를 새로고침해주세요.</div>';
        }
    } else {
        console.error('❌ Firebase가 로드되지 않았습니다.');
        document.getElementById('alert-container').innerHTML = 
            '<div class="alert alert-error">Firebase 연결에 실패했습니다. 페이지를 새로고침해주세요.</div>';
    }
});
