# lapillo.net

Lapillo Design Studio Portfolio Website

## 🎨 프로젝트 소개

제주도 기반 디자인 스튜디오 Lapillo의 포트폴리오 웹사이트입니다.  
Firebase를 활용한 동적 콘텐츠 관리 시스템을 구축하여 효율적인 포트폴리오 관리가 가능합니다.

## 🚀 주요 기능

### 사용자 웹사이트
- **반응형 포트폴리오 갤러리**: 데스크톱/모바일 최적화
- **상세 페이지**: 각 프로젝트별 상세 정보 및 이미지 갤러리
- **네비게이션**: 이전/다음 포트폴리오 간 seamless 이동
- **실시간 데이터**: Firebase에서 자동으로 최신 포트폴리오 로드

### 관리자 시스템
- **Firebase Authentication**: 보안된 로그인 시스템
- **실시간 포트폴리오 관리**: 추가/편집/삭제
- **이미지 업로드**: Firebase Storage 연동
- **드래그 앤 드롭**: 직관적인 이미지 업로드 UX

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Hosting**: GitHub Pages
- **Domain**: Custom domain (lapillo.net)

## 📁 파일 구조

```
lapillo/
├── index.html              # 메인 포트폴리오 페이지
├── portfolio-detail.html   # 포트폴리오 상세 페이지
├── admin-login.html        # 관리자 로그인 페이지
├── admin-firebase.html     # 관리자 대시보드
├── admin-firebase.js       # 관리자 기능 JavaScript
├── pumdt.html             # 개별 포트폴리오 예시 (품듯한의원)
├── studio-lapillo.css     # 메인 스타일시트
├── js/
│   └── firebase-cdn.js    # Firebase 설정 및 서비스
├── img/                   # 이미지 리소스
├── FIREBASE_SETUP.md      # Firebase 설정 가이드
└── CNAME                  # 커스텀 도메인 설정
```

## 🔧 설정 방법

### 1. Firebase 프로젝트 설정
자세한 설정 방법은 [FIREBASE_SETUP.md](FIREBASE_SETUP.md)를 참조하세요.

### 2. 관리자 접근
- 관리자 페이지: [admin-firebase.html](admin-firebase.html)
- Firebase Authentication으로 보호됨
- 승인된 사용자만 접근 가능

### 3. 로컬 개발
```bash
# 로컬 서버 실행 (예: Live Server, Python SimpleHTTPServer 등)
python -m http.server 8000
# 또는
npx live-server
```

## 🌐 배포

- **프로덕션**: https://lapillo.net
- **GitHub Pages**: 자동 배포
- **커스텀 도메인**: CNAME 파일로 설정

## 📝 업데이트 방법

1. **관리자 로그인**: [admin-firebase.html](admin-firebase.html)
2. **포트폴리오 추가/편집**: 웹 인터페이스에서 직접 관리
3. **이미지 업로드**: 드래그 앤 드롭으로 간편 업로드
4. **즉시 반영**: Firebase 실시간 동기화로 자동 업데이트

## 🔒 보안

- Firebase Authentication으로 관리자 페이지 보호
- Firestore 보안 규칙 적용
- Storage 접근 권한 관리

## 📱 반응형 지원

- 모바일 퍼스트 디자인
- 태블릿/데스크톱 최적화
- 터치 인터페이스 지원

## 📞 연락처

- **Email**: studio.lapillo@gmail.com
- **Instagram**: [@studio_lapillo](http://instagram.com/studio_lapillo/)
- **Website**: [lapillo.net](https://lapillo.net)

---

© 2025 Lapillo Design Studio. All rights reserved.