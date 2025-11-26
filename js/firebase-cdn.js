// Firebase CDN Configuration for GitHub Pages
// 이 설정값들을 실제 Firebase 프로젝트 값으로 교체해주세요.

const firebaseConfig = {
    apiKey: "AIzaSyCOn5UKpKYScOxOAQuvGHyiB5EVb_evN3Q",
    authDomain: "lapillo-portfolio.firebaseapp.com",
    projectId: "lapillo-portfolio",
    storageBucket: "lapillo-portfolio.firebasestorage.app",
    messagingSenderId: "7087688501",
    appId: "1:7087688501:web:5bc019661a2a6e38e49a7c",
    measurementId: "G-T2BS7KX4G6"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 및 Storage 인스턴스
const db = firebase.firestore();
const storage = firebase.storage();

// Firebase 서비스 클래스
class FirebaseService {
    constructor() {
        this.portfoliosCollection = 'portfolios';
        this.menusCollection = 'menus';
    }

    // 모든 포트폴리오 가져오기 (활성화된 것만)
    async getAllPortfolios() {
        try {
            const snapshot = await db.collection(this.portfoliosCollection)
                .get();
            const portfolios = [];
            const allData = [];
            
            snapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                allData.push(data);
                // enabled가 false가 아닌 포트폴리오만 포함 (기본값은 true)
                if (data.enabled !== false) {
                    portfolios.push(data);
                }
            });
            
            // dateSort 기준으로만 정렬 (프로젝트 날짜 최신순)
            portfolios.sort((a, b) => {
                const dateA = a.dateSort || '';
                const dateB = b.dateSort || '';
                return dateB.localeCompare(dateA);  // 내림차순
            });
            
            console.log('🔍 getAllPortfolios 필터링 및 정렬 결과:', {
                전체포트폴리오: allData.length,
                활성포트폴리오: portfolios.length,
                정렬기준: 'dateSort only (프로젝트 날짜)',
                비활성포트폴리오: allData.length - portfolios.length,
                비활성목록: allData.filter(p => p.enabled === false).map(p => ({id: p.id, title: p.englishTitle || p.title, enabled: p.enabled}))
            });
            
            return portfolios;
        } catch (error) {
            console.error('Error getting portfolios:', error);
            throw error;
        }
    }

    // 카테고리별 포트폴리오 가져오기 (활성화된 것만)
    async getPortfoliosByCategory(category) {
        try {
            const snapshot = await db.collection(this.portfoliosCollection)
                .where('category', '==', category)
                .get();
            const portfolios = [];
            const allData = [];
            
            snapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                allData.push(data);
                // enabled가 false가 아닌 포트폴리오만 포함 (기본값은 true)
                if (data.enabled !== false) {
                    portfolios.push(data);
                }
            });
            
            // dateSort 기준으로만 정렬 (프로젝트 날짜 최신순)
            portfolios.sort((a, b) => {
                const dateA = a.dateSort || '';
                const dateB = b.dateSort || '';
                return dateB.localeCompare(dateA);
            });
            
            console.log(`🔍 getPortfoliosByCategory(${category}) 필터링 및 정렬 결과:`, {
                카테고리: category,
                전체포트폴리오: allData.length,
                활성포트폴리오: portfolios.length,
                정렬기준: 'dateSort only (프로젝트 날짜)',
                비활성포트폴리오: allData.length - portfolios.length,
                비활성목록: allData.filter(p => p.enabled === false).map(p => ({id: p.id, title: p.englishTitle || p.title, enabled: p.enabled}))
            });
            
            return portfolios;
        } catch (error) {
            console.error('Error getting portfolios by category:', error);
            throw error;
        }
    }

    // 단일 포트폴리오 가져오기 (id)
    async getPortfolioById(id) {
        try {
            const docRef = await db.collection(this.portfoliosCollection).doc(id).get();
            if (!docRef.exists) return null;
            return { id: docRef.id, ...docRef.data() };
        } catch (error) {
            console.error('Error getting portfolio by id:', error);
            throw error;
        }
    }

    // 포트폴리오 저장/업데이트
    async savePortfolio(portfolioData) {
        try {
            await db.collection(this.portfoliosCollection).doc(portfolioData.id).set(portfolioData);
            return portfolioData;
        } catch (error) {
            console.error('Error saving portfolio:', error);
            throw error;
        }
    }

    // 포트폴리오 삭제
    async deletePortfolio(portfolioId) {
        try {
            await db.collection(this.portfoliosCollection).doc(portfolioId).delete();
        } catch (error) {
            console.error('Error deleting portfolio:', error);
            throw error;
        }
    }

    // 실시간 포트폴리오 변경 감지
    onPortfoliosChange(callback) {
        return db.collection(this.portfoliosCollection)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const portfolios = [];
                snapshot.forEach((doc) => {
                    portfolios.push({ id: doc.id, ...doc.data() });
                });
                callback(portfolios);
            });
    }

    // 이미지 업로드 (CORS 문제 해결 개선)
    async uploadImage(file, path = 'portfolios') {
        try {
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const extension = file.name.split('.').pop();
            const originalName = file.name.replace(/\.[^/.]+$/, ""); // 확장자 제거
            const filename = `${timestamp}_${randomId}_${originalName}.${extension}`;
            const fullPath = `${path}/${filename}`;
            
            console.log('업로드할 파일:', filename);
            
            const storageRef = storage.ref().child(fullPath);
            
            // CORS 문제 해결을 위한 메타데이터 설정
            const metadata = {
                contentType: file.type,
                cacheControl: 'public,max-age=3600',
                customMetadata: {
                    uploadedBy: 'admin',
                    timestamp: timestamp.toString(),
                    origin: window.location.origin
                }
            };
            
            const snapshot = await storageRef.put(file, metadata);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log('업로드 완료:', downloadURL);
            
            return {
                url: downloadURL,
                path: fullPath,
                filename: filename
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            
            // CORS 관련 에러 처리 개선
            if (error.code === 'storage/unauthorized' || 
                error.message.includes('CORS') || 
                error.message.includes('cross-origin') ||
                error.message.includes('Access-Control-Allow-Origin')) {
                throw new Error(`
                    CORS 설정이 필요합니다. 다음 단계를 따라주세요:
                    
                    1. Google Cloud Console (console.cloud.google.com) 접속
                    2. Firebase 프로젝트 선택
                    3. Cloud Storage → 버킷 → 권한 → CORS 설정
                    4. 다음 CORS 규칙 추가:
                    
                    [
                      {
                        "origin": ["https://lapillo.net", "http://127.0.0.1:5500", "http://localhost:5500"],
                        "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
                        "responseHeader": ["Content-Type", "Authorization", "X-Requested-With"],
                        "maxAgeSeconds": 3600
                      }
                    ]
                `);
            }
            
            throw error;
        }
    }

    // 이미지 삭제
    async deleteImage(imagePath) {
        try {
            const imageRef = storage.ref().child(imagePath);
            await imageRef.delete();
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    // 포트폴리오 이미지들 일괄 삭제
    async deletePortfolioImages(portfolio) {
        try {
            const deletePromises = [];
            
            // 썸네일 삭제
            if (portfolio.thumbnail && portfolio.thumbnail.includes('firebase')) {
                deletePromises.push(this.deleteImageFromUrl(portfolio.thumbnail));
            }
            
            // 상세 이미지들 삭제
            if (portfolio.images && portfolio.images.length > 0) {
                portfolio.images.forEach(imageUrl => {
                    if (imageUrl.includes('firebase')) {
                        deletePromises.push(this.deleteImageFromUrl(imageUrl));
                    }
                });
            }
            
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error deleting portfolio images:', error);
        }
    }

    // URL에서 이미지 삭제
    async deleteImageFromUrl(imageUrl) {
        try {
            const imageRef = storage.refFromURL(imageUrl);
            await imageRef.delete();
        } catch (error) {
            console.error('Error deleting image from URL:', error);
        }
    }

    // === 메뉴 관리 기능 ===
    
    // 모든 메뉴 가져오기
    async getAllMenus() {
        try {
            const snapshot = await db.collection(this.menusCollection)
                .orderBy('order', 'asc')
                .get();
            const menus = [];
            snapshot.forEach((doc) => {
                menus.push({ id: doc.id, ...doc.data() });
            });
            
            // 기본 메뉴가 없으면 생성
            if (menus.length === 0) {
                return await this.createDefaultMenus();
            }
            
            return menus;
        } catch (error) {
            console.error('Error getting menus:', error);
            // 에러 시 기본 메뉴 반환
            return this.getDefaultMenus();
        }
    }

    // 기본 메뉴 생성
    async createDefaultMenus() {
        const defaultMenus = [
            { id: 'design', name: 'Design', order: 1, enabled: true, isDeletable: false },
            { id: 'artwork', name: 'Artwork', order: 2, enabled: true, isDeletable: true },
            { id: 'exhibition', name: 'Exhibition', order: 3, enabled: true, isDeletable: true }
        ];

        try {
            const batch = db.batch();
            defaultMenus.forEach(menu => {
                const docRef = db.collection(this.menusCollection).doc(menu.id);
                batch.set(docRef, menu);
            });
            await batch.commit();
            return defaultMenus;
        } catch (error) {
            console.error('Error creating default menus:', error);
            return this.getDefaultMenus();
        }
    }

    // 기본 메뉴 반환 (오프라인용)
    getDefaultMenus() {
        return [
            { id: 'design', name: 'Design', order: 1, enabled: true, isDeletable: false },
            { id: 'artwork', name: 'Artwork', order: 2, enabled: true, isDeletable: true },
            { id: 'exhibition', name: 'Exhibition', order: 3, enabled: true, isDeletable: true }
        ];
    }

    // 메뉴 저장/업데이트
    async saveMenu(menuData) {
        try {
            await db.collection(this.menusCollection).doc(menuData.id).set(menuData);
            return menuData;
        } catch (error) {
            console.error('Error saving menu:', error);
            throw error;
        }
    }

    // 메뉴 삭제
    async deleteMenu(menuId) {
        try {
            // Design 메뉴는 삭제 불가
            if (menuId === 'design') {
                throw new Error('Design 메뉴는 삭제할 수 없습니다.');
            }
            await db.collection(this.menusCollection).doc(menuId).delete();
        } catch (error) {
            console.error('Error deleting menu:', error);
            throw error;
        }
    }

    // 실시간 메뉴 변경 감지
    onMenusChange(callback) {
        return db.collection(this.menusCollection)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const menus = [];
                snapshot.forEach((doc) => {
                    menus.push({ id: doc.id, ...doc.data() });
                });
                callback(menus);
            });
    }

    // 메뉴 순서 업데이트
    async updateMenuOrder(menuUpdates) {
        try {
            const batch = db.batch();
            menuUpdates.forEach(({ id, order }) => {
                const docRef = db.collection(this.menusCollection).doc(id);
                batch.update(docRef, { order });
            });
            await batch.commit();
        } catch (error) {
            console.error('Error updating menu order:', error);
            throw error;
        }
    }
}

// 전역 변수로 설정
window.FirebaseService = FirebaseService;
window.firebaseService = new FirebaseService();
