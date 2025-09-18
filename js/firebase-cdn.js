// Firebase CDN Configuration for GitHub Pages
// 이 설정값들을 실제 Firebase 프로젝트 값으로 교체해주세요.

const firebaseConfig = {
    apiKey: "AIzaSyCOn5UKpKYScOxOAQuvGHyiB5EVb_evN3Q",
    authDomain: "lapillo-portfolio.firebaseapp.com",
    projectId: "lapillo-portfolio",
    storageBucket: "lapillo-portfolio.appspot.com",
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

    // 모든 포트폴리오 가져오기
    async getAllPortfolios() {
        try {
            const snapshot = await db.collection(this.portfoliosCollection)
                .orderBy('createdAt', 'desc')
                .get();
            const portfolios = [];
            snapshot.forEach((doc) => {
                portfolios.push({ id: doc.id, ...doc.data() });
            });
            return portfolios;
        } catch (error) {
            console.error('Error getting portfolios:', error);
            throw error;
        }
    }

    // 카테고리별 포트폴리오 가져오기 (클라이언트 정렬로 인덱스 이슈 회피)
    async getPortfoliosByCategory(category) {
        try {
            const snapshot = await db.collection(this.portfoliosCollection)
                .where('category', '==', category)
                .get();
            const portfolios = [];
            snapshot.forEach((doc) => {
                portfolios.push({ id: doc.id, ...doc.data() });
            });
            // createdAt 기준 내림차순 정렬 (문자열/Date 모두 처리)
            portfolios.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    // 이미지 업로드
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
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log('업로드 완료:', downloadURL);
            
            return {
                url: downloadURL,
                path: fullPath,
                filename: filename
            };
        } catch (error) {
            console.error('Error uploading image:', error);
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
