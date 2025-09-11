// Portfolio Admin Management System

class PortfolioManager {
    constructor() {
        this.portfolios = [];
        this.currentEditId = null;
        this.uploadInProgress = false;
        this.pendingFiles = [];
        this.loadPortfolios();
        this.bindEvents();
        this.renderPortfolios();
    }

    // LocalStorage에서 포트폴리오 데이터 로드
    loadPortfolios() {
        const stored = localStorage.getItem('portfolios');
        if (stored) {
            this.portfolios = JSON.parse(stored);
        } else {
            // 기본 데이터 (PUMDT 포트폴리오)
            this.portfolios = [{
                id: 'pumdt',
                title: '품듯한의원',
                thumbnail: './img/IMG_9699.jpg',
                description: '제주시 소재, <품듯한의원> 을 위한 브랜드 디자인 프로젝트. \'나 스스로를 사려깊게\' 라는 타이틀로 일방적 서비스 제공이 아닌 편안한 소통, 환자 스스로 좋은 습관을 찾도록 돕는 의료 서비스가 목적이다.\n\n양팔을 벌려 지친 마음까지 품어주는 사람의 형상, 한의원을 통해 상승하는 신체 에너지를 표현하는 곡선 그래픽이 특징이다. 패키지의 색감 및 소재 또한 긴장감 없이 편안한 느낌을 받을 수 있도록 선별되었다.',
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
            this.savePortfolios();
        }
    }

    // LocalStorage에 포트폴리오 데이터 저장
    savePortfolios() {
        localStorage.setItem('portfolios', JSON.stringify(this.portfolios));
        this.updateIndexPage();
    }

    // 이벤트 바인딩
    bindEvents() {
        const form = document.getElementById('portfolio-edit-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
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

        // 최신 순으로 정렬
        const sortedPortfolios = [...this.portfolios].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        container.innerHTML = sortedPortfolios.map(portfolio => `
            <div class="portfolio-card p-6">
                <div class="flex items-start gap-4">
                    <img src="${this.getImageSrc(portfolio.thumbnail)}" alt="${portfolio.title}" class="image-preview">
                    <div class="flex-1">
                        <h3 class="text-xl font-semibold mb-2">${portfolio.title}</h3>
                        <p class="text-gray-600 text-sm mb-3 line-clamp-2">${portfolio.description.substring(0, 100)}...</p>
                        <div class="text-sm text-gray-500 mb-4">
                            <p><strong>Project:</strong> ${portfolio.project}</p>
                            <p><strong>Client:</strong> ${portfolio.client}</p>
                            <p><strong>Date:</strong> ${portfolio.date}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="portfolioManager.editPortfolio('${portfolio.id}')" class="btn-secondary">편집</button>
                            <button onclick="portfolioManager.deletePortfolio('${portfolio.id}')" class="btn-secondary text-red-600">삭제</button>
                            <a href="${portfolio.id}.html" target="_blank" class="btn-secondary">미리보기</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 새 포트폴리오 추가 폼 표시
    showAddForm() {
        this.currentEditId = null;
        this.clearForm();
        document.getElementById('form-title').textContent = '새 포트폴리오 추가';
        document.getElementById('portfolio-form').classList.remove('hidden');
        document.getElementById('portfolio-title').focus();
    }

    // 포트폴리오 편집
    editPortfolio(id) {
        const portfolio = this.portfolios.find(p => p.id === id);
        if (!portfolio) return;

        this.currentEditId = id;
        this.fillForm(portfolio);
        document.getElementById('form-title').textContent = '포트폴리오 편집';
        document.getElementById('portfolio-form').classList.remove('hidden');
        document.getElementById('portfolio-title').focus();
    }

    // 폼에 데이터 채우기
    fillForm(portfolio) {
        document.getElementById('portfolio-id').value = portfolio.id;
        document.getElementById('portfolio-title').value = portfolio.title;
        document.getElementById('portfolio-thumbnail').value = portfolio.thumbnail;
        document.getElementById('portfolio-description').value = portfolio.description;
        document.getElementById('portfolio-project').value = portfolio.project;
        document.getElementById('portfolio-client').value = portfolio.client;
        document.getElementById('portfolio-date').value = portfolio.date;
        document.getElementById('portfolio-images').value = portfolio.images.join('\n');
        
        // 기존 이미지 미리보기 표시
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
        
        // 이미지 미리보기 초기화
        this.clearImagePreviews();
    }

    // 폼 숨기기
    hideForm() {
        // 업로드 중인 경우 확인
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
        e.preventDefault();
        
        if (this.uploadInProgress) {
            this.showAlert('업로드가 진행 중입니다. 잠시만 기다려주세요.', 'error');
            return;
        }
        
        // 필수 필드 검증
        const title = document.getElementById('portfolio-title').value;
        const description = document.getElementById('portfolio-description').value;
        const project = document.getElementById('portfolio-project').value;
        const client = document.getElementById('portfolio-client').value;
        const date = document.getElementById('portfolio-date').value;
        
        if (!title || !description || !project || !client || !date) {
            this.showAlert('모든 필수 필드를 입력해주세요.', 'error');
            return;
        }
        
        // 업로드할 파일들 수집
        const thumbnailFile = document.getElementById('thumbnail-file').files[0];
        const detailFiles = Array.from(document.getElementById('detail-images-file').files);
        const existingThumbnail = document.getElementById('portfolio-thumbnail').value;
        const existingImages = document.getElementById('portfolio-images').value
            .split('\n')
            .map(img => img.trim())
            .filter(img => img.length > 0);
        
        // 썸네일이 없는 경우 검증
        if (!thumbnailFile && !existingThumbnail) {
            this.showAlert('썸네일 이미지는 필수입니다.', 'error');
            return;
        }
        
        // 업로드할 파일이 있는 경우 모달 표시
        const filesToUpload = [];
        if (thumbnailFile) filesToUpload.push({ file: thumbnailFile, type: 'thumbnail' });
        detailFiles.forEach(file => filesToUpload.push({ file, type: 'detail' }));
        
        if (filesToUpload.length > 0) {
            this.showUploadModal(filesToUpload, {
                title, description, project, client, date,
                existingThumbnail, existingImages
            });
        } else {
            // 업로드할 파일이 없는 경우 바로 저장
            const formData = {
                title, description, project, client, date,
                thumbnail: existingThumbnail,
                images: existingImages
            };
            
            if (this.currentEditId) {
                this.updatePortfolio(this.currentEditId, formData);
            } else {
                this.addPortfolio(formData);
            }
        }
    }

    // 새 포트폴리오 추가
    addPortfolio(data) {
        const id = this.generateId(data.title);
        const portfolio = {
            id,
            ...data,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        this.portfolios.push(portfolio);
        this.savePortfolios();
        this.renderPortfolios();
        this.hideForm();
        this.generateDetailPage(portfolio);
        this.showAlert('포트폴리오가 성공적으로 추가되었습니다.', 'success');
    }

    // 포트폴리오 업데이트
    updatePortfolio(id, data) {
        const index = this.portfolios.findIndex(p => p.id === id);
        if (index === -1) return;

        this.portfolios[index] = {
            ...this.portfolios[index],
            ...data,
            updatedAt: new Date().toISOString().split('T')[0]
        };

        this.savePortfolios();
        this.renderPortfolios();
        this.hideForm();
        this.generateDetailPage(this.portfolios[index]);
        this.showAlert('포트폴리오가 성공적으로 업데이트되었습니다.', 'success');
    }

    // 포트폴리오 삭제
    deletePortfolio(id) {
        if (!confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) return;

        this.portfolios = this.portfolios.filter(p => p.id !== id);
        this.savePortfolios();
        this.renderPortfolios();
        this.showAlert('포트폴리오가 삭제되었습니다.', 'success');
    }

    // ID 생성 (제목을 기반으로)
    generateId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9가-힣]/g, '')
            .substring(0, 20) + '_' + Date.now();
    }

    // 상세페이지 생성
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

        const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.title} - lapillo</title>
    <link href="https://cdn.jsdelivr.net/npm/@shadcn/ui@latest/dist/tailwind.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="studio-lapillo.css">
</head>
<body class="bg-white font-sans">
    <!-- Header -->
    <header class="bg-white">
        <div class="header-container">
            <div class="flex justify-between items-center h-20">
                <!-- Mobile Hamburger Menu -->
                <div class="mobile-hamburger md:hidden">
                    <button class="hamburger-button" id="hamburger-btn">
                        <svg class="hamburger-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path class="hamburger-lines" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            <path class="close-lines" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" style="display: none;"></path>
                        </svg>
                    </button>
                </div>

                <!-- Desktop Left side: Logo and Navigation -->
                <div class="hidden md:flex items-center space-x-12">
                    <!-- Logo -->
                    <div class="flex-shrink-0">
                        <a href="index.html">
                            <img src="./img/lapillo_logo_web.png" alt="lapillo" style="height: 6rem;" class="w-auto logo-desktop">
                        </a>
                    </div>
                    
                    <!-- Navigation Menu -->
                    <nav class="flex space-x-8">
                        <a href="index.html#design" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">Design</a>
                        <a href="index.html#artwork" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">Artwork</a>
                        <a href="index.html#about" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">About</a>
                        <a href="index.html#contact" class="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">Contact</a>
                    </nav>
                </div>

                <!-- Mobile Logo (centered) -->
                <div class="mobile-logo md:hidden flex-1 flex justify-center">
                    <a href="index.html">
                        <img src="./img/lapillo_logo_web.png" alt="lapillo" class="logo-mobile">
                    </a>
                </div>
                
                <!-- Desktop Right side: Instagram Icon -->
                <div class="hidden md:flex items-center">
                    <a href="http://instagram.com/studio_lapillo/" target="_blank" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                        </svg>
                    </a>
                </div>

                <!-- Mobile Spacer (to balance hamburger) -->
                <div class="mobile-spacer md:hidden w-6"></div>
            </div>
        </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" id="mobile-menu">
        <div class="mobile-menu-content">
            <nav class="mobile-nav">
                <a href="index.html#design" class="mobile-nav-link">Design</a>
                <a href="index.html#artwork" class="mobile-nav-link">Artwork</a>
                <a href="index.html#about" class="mobile-nav-link">About</a>
                <a href="index.html#contact" class="mobile-nav-link">Contact</a>
                <div class="mobile-instagram-wrapper">
                <a href="http://instagram.com/studio_lapillo/" target="_blank" class="mobile-instagram">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                    </svg>
                </a>
                </div>
            </nav>
        </div>
    </div>

    <!-- Main Content -->
    <main class="py-6">
        <div class="project-detail-wrapper">
            <!-- Title Section - 1 Column -->
            <div class="project-title-section">
                <h1 class="project-title">${portfolio.title}</h1>
            </div>
            
            <!-- Text Section - 2 Columns -->
            <div class="project-text-section">
                <!-- Left Column -->
                <div class="project-text-left">
                    <div class="project-description">
                        ${descriptionParagraphs}
                    </div>
                </div>
                
                <!-- Right Column -->
                <div class="project-text-right">
                    <div class="project-info">
                        <p class="project-meta"><strong>Project</strong> | ${projectLinks}</p>
                        <p class="project-meta"><strong>Client</strong> | ${portfolio.client}</p>
                        <p class="project-meta"><strong>${portfolio.date}</strong></p>
                    </div>
                </div>
            </div>

            <!-- Images Section - 1 Column -->
            <div class="project-images-section">
                ${imageElements}
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white py-12">
        <div class="footer-container">
            <div class="footer-grid">
                <!-- Left Column -->
                <div class="footer-column">
                    <p class="footer-text">Lapillo </p>
                    <p class="footer-text">studio.lapillo@gmail.com</p>
                </div>
                
                <!-- Right Column -->
                <div class="footer-column">
                    <p class="footer-text">&nbsp;</p>
                    <p class="footer-text">&copy; 2025 Lapillo. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.getElementById('hamburger-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const hamburgerLines = document.querySelector('.hamburger-lines');
            const closeLines = document.querySelector('.close-lines');
            
            let isOpen = false;

            function toggleMenu() {
                isOpen = !isOpen;
                console.log('Menu toggle:', isOpen);
                
                if (isOpen) {
                    // 메뉴 열기
                    mobileMenu.style.display = 'flex';
                    mobileMenu.style.position = 'fixed';
                    mobileMenu.style.top = '0';
                    mobileMenu.style.left = '0';
                    mobileMenu.style.width = '100%';
                    mobileMenu.style.height = '100vh';
                    mobileMenu.style.background = 'white';
                    mobileMenu.style.zIndex = '9999';
                    mobileMenu.style.flexDirection = 'column';
                    mobileMenu.style.justifyContent = 'center';
                    mobileMenu.style.alignItems = 'center';
                    mobileMenu.style.gap = '3rem';
                    
                    // X 버튼 추가
                    if (!document.getElementById('mobile-close-btn')) {
                        const closeBtn = document.createElement('button');
                        closeBtn.id = 'mobile-close-btn';
                        closeBtn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
                        closeBtn.style.cssText = 'position: absolute; top: 2rem; left: 2rem; background: none; border: none; cursor: pointer; padding: 0.5rem; z-index: 10000; color: #333;';
                        closeBtn.addEventListener('click', toggleMenu);
                        mobileMenu.appendChild(closeBtn);
                    }
                    
                    // 메뉴 링크 폰트 사이즈 변경
                    const menuLinks = mobileMenu.querySelectorAll('a');
                    menuLinks.forEach(link => {
                        if (!link.classList.contains('mobile-instagram')) {
                            link.style.fontSize = '1.8rem';
                        }
                    });
                    
                    hamburgerLines.style.display = 'none';
                    closeLines.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                } else {
                    // 메뉴 닫기
                    mobileMenu.style.display = 'none';
                    
                    // X 버튼 제거
                    const closeBtn = document.getElementById('mobile-close-btn');
                    if (closeBtn) {
                        closeBtn.remove();
                    }
                    
                    hamburgerLines.style.display = 'block';
                    closeLines.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }

            // 햄버거 버튼 클릭
            hamburger.addEventListener('click', toggleMenu);

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
        });
    </script>
</body>
</html>`;

        // 파일 다운로드 제안
        this.downloadDetailPage(portfolio.id, htmlContent);
    }

    // 상세페이지 다운로드
    downloadDetailPage(filename, content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // index.html 업데이트
    updateIndexPage() {
        // 최신 순으로 정렬된 포트폴리오 생성
        const sortedPortfolios = [...this.portfolios].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        const gridItems = sortedPortfolios.map(portfolio => `
                <!-- ${portfolio.title} -->
                <a class="grid-item" href="${portfolio.id}.html">
                    <div class="grid-image">
                        <div class="grid-image-inner-wrapper">
                            <img src="${portfolio.thumbnail}" alt="${portfolio.title}" class="portfolio-image">
                        </div>
                    </div>
                    <div class="portfolio-text">
                        <h3 class="portfolio-title">${portfolio.title}</h3>
                    </div>
                </a>`).join('\n                ');

        // 새로운 index.html 콘텐츠 생성 알림
        this.showAlert(`index.html을 수동으로 업데이트해주세요. 포트폴리오 그리드 섹션을 다음 내용으로 교체하세요:`, 'success');
        console.log('Portfolio Grid HTML:', gridItems);
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

    // 이미지 미리보기 초기화
    clearImagePreviews() {
        const thumbnailPreview = document.getElementById('thumbnail-preview');
        const detailImagesPreview = document.getElementById('detail-images-preview');
        
        if (thumbnailPreview) {
            thumbnailPreview.classList.add('hidden');
        }
        
        if (detailImagesPreview) {
            detailImagesPreview.innerHTML = '';
        }
        
        // hidden 필드도 초기화
        document.getElementById('portfolio-thumbnail').value = '';
        document.getElementById('portfolio-images').value = '';
    }

    // 기존 썸네일 이미지 미리보기 표시
    showExistingThumbnail(imagePath) {
        const previewContainer = document.getElementById('thumbnail-preview');
        const previewImg = document.getElementById('thumbnail-preview-img');
        
        if (previewContainer && previewImg) {
            previewImg.src = this.getImageSrc(imagePath);
            previewContainer.classList.remove('hidden');
        }
    }

    // 기존 상세 이미지들 미리보기 표시
    showExistingDetailImages(imagePaths) {
        const previewContainer = document.getElementById('detail-images-preview');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        
        imagePaths.forEach((imagePath, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'multiple-image-item';
            imageItem.innerHTML = `
                <img src="${this.getImageSrc(imagePath)}" class="multiple-preview-image" alt="Detail image ${index + 1}">
                <button type="button" class="remove-preview-btn" onclick="removeDetailImage(${index})">×</button>
            `;
            previewContainer.appendChild(imageItem);
        });
    }

    // Base64로 이미지 인코딩
    async encodeImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // GitHub Pages용 이미지 파일 처리
    async saveImageFile(file, folder = 'img') {
        // GitHub Pages에서는 파일을 직접 저장할 수 없으므로
        // 사용자가 수동으로 이미지를 img 폴더에 추가하도록 안내
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `upload_${timestamp}.${extension}`;
        const filepath = `./${folder}/${filename}`;
        
        // Base64 데이터를 localStorage에 저장 (임시)
        const base64Data = await this.encodeImageToBase64(file);
        
        // 이미지 데이터와 함께 다운로드 안내
        const imageData = {
            filename: filename,
            filepath: filepath,
            data: base64Data,
            originalName: file.name,
            instruction: `이 이미지를 ${filepath} 경로에 저장하고 Git에 커밋해주세요.`
        };
        
        // 이미지 파일 다운로드 제안
        this.downloadImageFile(file, filename);
        
        let savedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
        savedImages[filepath] = imageData;
        localStorage.setItem('uploadedImages', JSON.stringify(savedImages));
        
        return filepath;
    }

    // 이미지 파일 다운로드 헬퍼
    downloadImageFile(file, filename) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // 사용자에게 안내 메시지
        this.showAlert(`이미지가 다운로드되었습니다. img 폴더에 저장 후 Git에 커밋해주세요: ${filename}`, 'success');
    }

    // 업로드된 이미지 표시를 위한 헬퍼 함수
    getImageSrc(imagePath) {
        // 기존 파일 경로인 경우 그대로 반환
        if (!imagePath.startsWith('./img/upload_')) {
            return imagePath;
        }
        
        // 업로드된 파일인 경우 localStorage에서 base64 데이터 가져오기
        const savedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
        const imageData = savedImages[imagePath];
        
        if (imageData && imageData.data) {
            return imageData.data;
        }
        
        return imagePath; // fallback
    }

    // 모달 이벤트 설정
    setupModalEvents() {
        const uploadCancelBtn = document.getElementById('upload-cancel-btn');
        const uploadConfirmBtn = document.getElementById('upload-confirm-btn');
        const modalBackdrop = document.getElementById('modal-backdrop');

        // 취소 버튼
        uploadCancelBtn.addEventListener('click', () => {
            this.cancelUpload();
        });

        // 저장 버튼
        uploadConfirmBtn.addEventListener('click', () => {
            this.confirmUpload();
        });

        // 배경 클릭 시 닫기
        modalBackdrop.addEventListener('click', () => {
            this.cancelUpload();
        });
    }

    // 업로드 모달 표시
    showUploadModal(filesToUpload, formData) {
        this.pendingFiles = filesToUpload;
        this.pendingFormData = formData;
        
        const modal = document.getElementById('upload-modal');
        const backdrop = document.getElementById('modal-backdrop');
        const fileList = document.getElementById('upload-file-list');
        const progressText = document.getElementById('upload-progress-text');
        const progressFill = document.getElementById('upload-progress-fill');
        const confirmBtn = document.getElementById('upload-confirm-btn');

        // 초기화
        progressText.textContent = '업로드 준비완료';
        progressFill.style.width = '0%';
        confirmBtn.disabled = false;

        // 파일 목록 생성
        fileList.innerHTML = filesToUpload.map((item, index) => {
            const fileSize = this.formatFileSize(item.file.size);
            const fileType = item.type === 'thumbnail' ? '썸네일' : '상세 이미지';
            
            return `
                <div class="upload-file-item" data-index="${index}">
                    <div class="upload-file-info">
                        <div class="upload-file-icon">IMG</div>
                        <div class="upload-file-details">
                            <div class="upload-file-name">${item.file.name}</div>
                            <div class="upload-file-size">${fileSize} • ${fileType}</div>
                        </div>
                    </div>
                    <div class="upload-file-status ready">준비완료</div>
                </div>
            `;
        }).join('');

        // 모달 표시
        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // 업로드 모달 숨기기
    hideUploadModal() {
        const modal = document.getElementById('upload-modal');
        const backdrop = document.getElementById('modal-backdrop');
        
        backdrop.classList.add('hidden');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        this.pendingFiles = [];
        this.pendingFormData = null;
        this.uploadInProgress = false;
    }

    // 업로드 취소
    cancelUpload() {
        if (this.uploadInProgress) {
            if (!confirm('업로드가 진행 중입니다. 정말 취소하시겠습니까?')) {
                return;
            }
        }
        
        this.hideUploadModal();
        this.showAlert('업로드가 취소되었습니다.', 'error');
    }

    // 업로드 확인
    async confirmUpload() {
        if (this.uploadInProgress) return;
        
        this.uploadInProgress = true;
        const confirmBtn = document.getElementById('upload-confirm-btn');
        const cancelBtn = document.getElementById('upload-cancel-btn');
        const progressText = document.getElementById('upload-progress-text');
        const progressFill = document.getElementById('upload-progress-fill');
        
        confirmBtn.disabled = true;
        cancelBtn.disabled = true;
        progressText.textContent = '업로드 중...';
        
        try {
            const uploadedFiles = {
                thumbnail: this.pendingFormData.existingThumbnail,
                images: [...this.pendingFormData.existingImages]
            };
            
            // 파일 업로드 처리
            for (let i = 0; i < this.pendingFiles.length; i++) {
                const fileItem = this.pendingFiles[i];
                const statusElement = document.querySelector(`[data-index="${i}"] .upload-file-status`);
                
                // 상태 업데이트
                statusElement.textContent = '업로드 중...';
                statusElement.className = 'upload-file-status uploading';
                
                try {
                    // 파일 업로드 시뮬레이션
                    await this.simulateFileUpload(fileItem.file);
                    const filepath = await this.saveImageFile(fileItem.file);
                    
                    if (fileItem.type === 'thumbnail') {
                        uploadedFiles.thumbnail = filepath;
                    } else {
                        uploadedFiles.images.push(filepath);
                    }
                    
                    // 성공 상태 업데이트
                    statusElement.textContent = '완료';
                    statusElement.className = 'upload-file-status completed';
                    
                } catch (error) {
                    // 에러 상태 업데이트
                    statusElement.textContent = '실패';
                    statusElement.className = 'upload-file-status error';
                    throw error;
                }
                
                // 진행률 업데이트
                const progress = ((i + 1) / this.pendingFiles.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `업로드 중... ${i + 1}/${this.pendingFiles.length}`;
            }
            
            // 모든 파일 업로드 완료
            progressText.textContent = '업로드 완료!';
            progressFill.style.width = '100%';
            
            // 포트폴리오 저장
            const finalFormData = {
                ...this.pendingFormData,
                thumbnail: uploadedFiles.thumbnail,
                images: uploadedFiles.images
            };
            
            if (this.currentEditId) {
                this.updatePortfolio(this.currentEditId, finalFormData);
            } else {
                this.addPortfolio(finalFormData);
            }
            
            // 잠시 대기 후 모달 닫기
            setTimeout(() => {
                this.hideUploadModal();
            }, 1000);
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showAlert('업로드 중 오류가 발생했습니다.', 'error');
            
            confirmBtn.disabled = false;
            cancelBtn.disabled = false;
            this.uploadInProgress = false;
        }
    }

    // 파일 업로드 시뮬레이션 (실제 업로드 지연 시뮬레이션)
    async simulateFileUpload(file) {
        // 파일 크기에 따른 업로드 시간 시뮬레이션
        const delay = Math.min(file.size / (1024 * 1024) * 500, 2000); // 최대 2초
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // 파일 크기 포맷팅
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 전역 함수들
function showAddForm() {
    if (window.portfolioManager) {
        window.portfolioManager.showAddForm();
    } else {
        console.error('portfolioManager not initialized');
    }
}

function hideForm() {
    if (window.portfolioManager) {
        window.portfolioManager.hideForm();
    } else {
        console.error('portfolioManager not initialized');
    }
}


// 썸네일 이미지 미리보기
function previewThumbnail(input) {
    const file = input.files[0];
    if (!file) return;
    
    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
        portfolioManager.showAlert('이미지 파일만 업로드 가능합니다.', 'error');
        input.value = '';
        return;
    }
    
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
        portfolioManager.showAlert('파일 크기는 5MB 이하여야 합니다.', 'error');
        input.value = '';
        return;
    }
    
    const previewContainer = document.getElementById('thumbnail-preview');
    const previewImg = document.getElementById('thumbnail-preview-img');
    
    if (previewContainer && previewImg) {
        // 미리보기 표시
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        
        // hidden 필드 초기화 (실제 업로드는 저장 시에 진행)
        document.getElementById('portfolio-thumbnail').value = '';
    }
}

// 썸네일 미리보기 제거
function removeThumbnailPreview() {
    const previewContainer = document.getElementById('thumbnail-preview');
    const fileInput = document.getElementById('thumbnail-file');
    const hiddenInput = document.getElementById('portfolio-thumbnail');
    
    if (previewContainer) previewContainer.classList.add('hidden');
    if (fileInput) fileInput.value = '';
    if (hiddenInput) hiddenInput.value = '';
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
    
    // 미리보기 생성
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
    
    // hidden 필드 초기화 (실제 업로드는 저장 시에 진행)
    document.getElementById('portfolio-images').value = '';
}

// 상세 이미지 개별 제거 (기존 업로드된 이미지용)
function removeDetailImage(index) {
    const hiddenInput = document.getElementById('portfolio-images');
    const imagePaths = hiddenInput.value.split('\n').filter(path => path.trim());
    
    // 배열에서 해당 인덱스 제거
    imagePaths.splice(index, 1);
    hiddenInput.value = imagePaths.join('\n');
    
    // 미리보기 다시 렌더링
    const previewContainer = document.getElementById('detail-images-preview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    imagePaths.forEach((imagePath, newIndex) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'multiple-image-item';
        imageItem.innerHTML = `
            <img src="${portfolioManager.getImageSrc(imagePath)}" class="multiple-preview-image" alt="Detail image ${newIndex + 1}">
            <button type="button" class="remove-preview-btn" onclick="removeDetailImage(${newIndex})">×</button>
        `;
        previewContainer.appendChild(imageItem);
    });
}

// 새로 선택된 이미지 개별 제거
function removeDetailImageByIndex(index) {
    const fileInput = document.getElementById('detail-images-file');
    const files = Array.from(fileInput.files);
    
    // FileList는 수정할 수 없으므로 새로운 파일 목록 생성
    const dt = new DataTransfer();
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    // 새로운 파일 목록으로 교체
    fileInput.files = dt.files;
    
    // 미리보기 다시 생성
    previewDetailImages(fileInput);
}

// 전역 스코프에 함수들 바인딩
window.showAddForm = showAddForm;
window.hideForm = hideForm;
window.previewThumbnail = previewThumbnail;
window.removeThumbnailPreview = removeThumbnailPreview;
window.previewDetailImages = previewDetailImages;
window.removeDetailImage = removeDetailImage;
window.removeDetailImageByIndex = removeDetailImageByIndex;

// 앱 초기화
let portfolioManager;
document.addEventListener('DOMContentLoaded', () => {
    portfolioManager = new PortfolioManager();
    // 전역 스코프에서 접근 가능하도록 설정
    window.portfolioManager = portfolioManager;
});
