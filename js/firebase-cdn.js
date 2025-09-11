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
}

// 전역 변수로 설정
window.FirebaseService = FirebaseService;
window.firebaseService = new FirebaseService();
