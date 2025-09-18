# lapillo.net

Lapillo Design Studio Portfolio Website

## 🎨 프로젝트 소개

제주도 기반 디자인 스튜디오 Lapillo의 포트폴리오 웹사이트입니다.  
Firebase를 활용해 포트폴리오 데이터를 동적으로 로드하며, 컴포넌트 기반 레이아웃과 모바일 네비게이션을 지원합니다.

## 🚀 주요 기능

### 사용자 웹사이트
- **반응형 포트폴리오 그리드**: 데스크톱/모바일 최적화된 썸네일 그리드
- **상세 페이지**: `portfolio-detail.html`을 통해 프로젝트별 상세 정보 표시
- **컴포넌트 로딩**: `components/header.html`, `components/footer.html`을 동적 로딩
- **모바일 메뉴**: 햄버거 버튼과 오버레이 메뉴, 동적 폰트/간격 계산
- **실시간 데이터**: Firebase Firestore에서 최신 포트폴리오 자동 로드

### 관리자 시스템 (선택적 구성)
- **Firebase Authentication**: 관리자 접근 보호
- **포트폴리오 관리**: Firestore/Storage 기반의 추가/편집/삭제
- 자세한 설정은 `FIREBASE_SETUP.md` 참고

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), TailwindCSS (CDN)
- **UI 스타일**: `@shadcn/ui` CDN CSS 활용
- **Backend**: Firebase (Firestore, Storage, Authentication) - compat v9
- **Hosting**: GitHub Pages
- **Domain**: Custom domain (lapillo.net)

## 📁 파일 구조

```
lapillo/
├── index.html               # 메인 포트폴리오 페이지 (그리드 렌더)
├── portfolio-detail.html    # 포트폴리오 상세 페이지
├── studio-lapillo.css       # 메인 스타일시트
├── components/
│   ├── header.html          # 헤더 컴포넌트
│   └── footer.html          # 푸터 컴포넌트
├── js/
│   ├── firebase-cdn.js      # Firebase 설정 및 FirebaseService
│   ├── component-loader.js  # HTML 컴포넌트 동적 로더
│   ├── navigation-manager.js# 네비게이션 상태/업데이트
│   └── mobile-menu.js       # 모바일 메뉴 토글/상태
├── img/                     # 이미지 리소스
├── FIREBASE_SETUP.md        # Firebase 설정 가이드
└── CNAME                    # 커스텀 도메인 설정
```

## 🔧 설정 방법

### 1) Firebase 프로젝트 설정
`FIREBASE_SETUP.md`의 단계에 따라 Web App 생성 및 Firestore/Storage/Auth를 설정하고, `js/firebase-cdn.js`에 구성 값을 반영하세요.

### 2) 로컬 개발
```bash
# 파이썬 내장 서버 예시
python -m http.server 8000

# 또는 VSCode/Live Server, 혹은
npx live-server
```

### 3) 관리자 접근 (선택)
- 관리자 페이지가 구성된 경우, Firebase Authentication으로 보호됩니다.
- Firestore 보안 규칙과 Storage 규칙을 반드시 설정하세요.

## 🌐 배포

- **프로덕션**: https://lapillo.net
- **GitHub Pages**: main 브랜치 push 시 자동 배포 (설정에 따름)
- **커스텀 도메인**: `CNAME` 파일로 설정

## 📝 콘텐츠 업데이트

1. Firestore에 포트폴리오 문서를 추가/수정/삭제합니다.  
   - `textOnly: true`인 항목은 메인 그리드에서 제외됩니다.
2. Storage에 썸네일 이미지를 업로드하고 문서의 `thumbnail` 필드에 경로/URL을 설정합니다.
3. 변경 사항은 사이트에 자동 반영됩니다.

## 🔒 보안

- Firebase Authentication으로 관리자 접근 제어
- Firestore/Storage 보안 규칙 적용 필수
- 공개 읽기 범위를 최소화하고, 쓰기 권한은 관리자에게만 부여

## 🧭 작동 개요

- `index.html` 로드 → `components/header.html`/`footer.html` 동적 로딩 → 
  `firebaseService.getAllPortfolios()`로 포트폴리오 목록 조회 → 그리드 렌더링 → 
  모바일 메뉴 초기화 및 반응형 스타일 계산

## 📱 반응형 지원

- 모바일 퍼스트 디자인 및 터치 인터랙션
- TailwindCSS 유틸리티 기반 레이아웃

## ❗ 트러블슈팅

- 포트폴리오가 보이지 않는 경우:
  - Firebase 초기화 값을 재확인 (`js/firebase-cdn.js`)
  - Firestore 컬렉션/문서 권한 확인
  - 브라우저 콘솔 에러 확인 (네트워크/권한/경로)

## 📞 연락처

- **Email**: studio.lapillo@gmail.com
- **Instagram**: [@studio_lapillo](http://instagram.com/studio_lapillo/)
- **Website**: [lapillo.net](https://lapillo.net)

---

© 2025 Lapillo Design Studio. All rights reserved.