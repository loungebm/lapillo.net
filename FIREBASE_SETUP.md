# 🔥 Firebase 연동 설정 가이드

Firebase를 연동하여 실시간 포트폴리오 관리 시스템을 구축하는 방법입니다.

## 📋 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `lapillo-portfolio` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 1.2 웹 앱 추가
1. 프로젝트 대시보드에서 `</>` (웹) 아이콘 클릭
2. 앱 닉네임: `lapillo-web`
3. Firebase Hosting 설정 체크 (선택사항)
4. "앱 등록" 클릭

## 🗄️ 2. Firestore 데이터베이스 설정

### 2.1 Firestore 생성
1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **테스트 모드**로 시작 (나중에 보안 규칙 수정)
4. 위치: `asia-northeast3 (서울)` 선택
5. "완료" 클릭

### 2.2 보안 규칙 설정
```javascript
// Firestore 보안 규칙
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 포트폴리오 컬렉션 - 읽기는 모두 허용, 쓰기는 인증된 사용자만
    match /portfolios/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📁 3. Firebase Storage 설정

### 3.1 Storage 생성
1. 왼쪽 메뉴에서 "Storage" 클릭
2. "시작하기" 클릭
3. **테스트 모드**로 시작
4. 위치: `asia-northeast3 (서울)` 선택
5. "완료" 클릭

### 3.2 Storage 보안 규칙
```javascript
// Storage 보안 규칙
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolios/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔐 4. Authentication 설정 (선택사항)

### 4.1 인증 방법 설정
1. 왼쪽 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭에서 "이메일/비밀번호" 활성화
4. 관리자 계정 생성

## ⚙️ 5. 설정 정보 복사

### 5.1 Firebase 설정 정보 가져오기
1. 프로젝트 설정 (톱니바퀴 아이콘) 클릭
2. "일반" 탭에서 "내 앱" 섹션 찾기
3. "Firebase SDK snippet"에서 "구성" 선택
4. 설정 객체 복사

### 5.2 설정 정보 예시
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "lapillo-portfolio.firebaseapp.com",
  projectId: "lapillo-portfolio",
  storageBucket: "lapillo-portfolio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## 📝 6. 코드에 설정 적용

### 6.1 Firebase 설정 파일 수정
1. `js/firebase-cdn.js` 파일 열기
2. 파일 맨 위의 `firebaseConfig` 객체를 복사한 설정으로 교체:

```javascript
// 이 부분을 수정하세요
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",           // ← 실제 API 키로 교체
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",     // ← 실제 프로젝트 ID로 교체
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 6.2 파일 구조 확인
```
lapillo/
├── js/
│   └── firebase-cdn.js          ← Firebase 설정 파일
├── admin-firebase.html          ← Firebase 관리자 페이지
├── admin-firebase.js            ← Firebase 관리자 스크립트
├── index-firebase.html          ← Firebase 연동 메인 페이지
└── FIREBASE_SETUP.md           ← 이 가이드
```

## 🚀 7. 테스트 및 실행

### 7.1 로컬 테스트
1. `admin-firebase.html` 파일을 브라우저에서 열기
2. Firebase 연결 상태 확인 (녹색 "Firebase 연결됨" 메시지)
3. 테스트 포트폴리오 추가해보기

### 7.2 GitHub Pages 배포
1. 모든 파일을 GitHub에 커밋
2. GitHub Pages 설정에서 `index-firebase.html`을 메인 페이지로 설정
3. 또는 기존 `index.html`을 `index-firebase.html` 내용으로 교체

## 🎯 8. 사용법

### 8.1 포트폴리오 추가
1. `admin-firebase.html` 접속
2. "새 작품 추가" 클릭
3. 폼 작성 후 저장
4. 자동으로 Firebase에 저장됨

### 8.2 실시간 업데이트 확인
1. `index-firebase.html`을 다른 브라우저에서 열기
2. 관리자 페이지에서 포트폴리오 추가/수정
3. 메인 페이지가 자동으로 업데이트되는지 확인

## 🔧 9. 문제 해결

### 9.1 "Firebase 연결 실패" 오류
- `js/firebase-cdn.js`의 설정 정보가 올바른지 확인
- Firebase 프로젝트가 활성화되어 있는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 9.2 "권한 거부" 오류
- Firestore 보안 규칙 확인
- Authentication 설정 확인

### 9.3 이미지 업로드 실패
- Storage 보안 규칙 확인
- 파일 크기 제한 (5MB) 확인

## 📊 10. 장점

✅ **실시간 업데이트**: 관리자가 추가한 작품이 즉시 반영  
✅ **자동 이미지 관리**: Firebase Storage에 자동 업로드  
✅ **무료 사용**: 소규모 프로젝트는 무료 플랜으로 충분  
✅ **확장성**: 나중에 사용자 인증, 댓글 등 기능 추가 가능  
✅ **백업**: Google 클라우드에 자동 백업  

---

## 🎉 완료!

이제 Firebase를 통한 실시간 포트폴리오 관리 시스템이 준비되었습니다!

관리자는 `admin-firebase.html`에서 작품을 관리하고,  
방문자는 `index-firebase.html`에서 실시간으로 업데이트된 포트폴리오를 확인할 수 있습니다.
