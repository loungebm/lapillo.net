# 🔧 CORS 문제 해결 가이드

Firebase Storage 업로드 시 발생하는 CORS 문제를 해결하는 방법입니다.

## 🚨 문제 상황
- 포트폴리오 이미지 업로드가 실패함
- 브라우저 콘솔에서 CORS 관련 에러 발생
- "Access-Control-Allow-Origin" 에러 메시지

## 🛠️ 해결 방법

### 1단계: Google Cloud Console에서 CORS 설정

#### 1.1 Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Firebase 프로젝트 선택 (lapillo-portfolio)

#### 1.2 Cloud Storage 버킷 찾기
1. 왼쪽 메뉴에서 **"Cloud Storage"** → **"버킷"** 클릭
2. Firebase 프로젝트의 Storage 버킷 찾기
   - 보통 `lapillo-portfolio.appspot.com` 또는 `lapillo-portfolio.firebasestorage.app` 형태

#### 1.3 CORS 설정 추가
1. 버킷 이름을 클릭
2. **"권한"** 탭 클릭
3. **"CORS"** 섹션에서 **"CORS 구성 추가"** 클릭
4. 다음 JSON 규칙을 입력:

```json
[
  {
    "origin": [
      "https://lapillo.net",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://*.github.io",
      "https://*.github.dev"
    ],
    "method": [
      "GET",
      "HEAD", 
      "PUT",
      "POST",
      "DELETE",
      "OPTIONS"
    ],
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers"
    ],
    "maxAgeSeconds": 3600
  }
]
```

5. **"저장"** 클릭

### 2단계: 설정 확인

#### 2.1 CORS 설정 확인
- 설정 후 몇 분 정도 기다린 후 테스트
- 브라우저 캐시를 지우고 다시 시도

#### 2.2 업로드 테스트
1. `admin-firebase.html` 페이지에서 새 포트폴리오 추가
2. 이미지 파일 업로드 시도
3. 브라우저 개발자 도구 콘솔에서 에러 메시지 확인

## 🔍 문제 해결

### CORS 설정이 적용되지 않는 경우
1. **잠시 기다리기**: CORS 설정은 몇 분에서 몇 시간까지 걸릴 수 있습니다
2. **브라우저 캐시 삭제**: Ctrl+Shift+R (하드 새로고침)
3. **다른 브라우저로 테스트**: 시크릿 모드에서 테스트

### 여전히 문제가 발생하는 경우
1. **Firebase 프로젝트 설정 확인**:
   - Firebase Console → 프로젝트 설정 → 일반
   - Storage 버킷 이름 확인

2. **도메인 추가**:
   - 현재 사용 중인 도메인을 CORS origin에 추가
   - 개발 환경: `http://localhost:포트번호`
   - 프로덕션: `https://lapillo.net`

3. **Firebase Storage 규칙 확인**:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /portfolios/{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```

## 📋 체크리스트

- [ ] Google Cloud Console에서 CORS 설정 완료
- [ ] 모든 필요한 도메인이 origin에 포함됨
- [ ] HTTP 메서드가 올바르게 설정됨
- [ ] Response Header가 적절히 설정됨
- [ ] 브라우저 캐시 삭제 후 테스트
- [ ] Firebase Storage 보안 규칙 확인

## 🎯 성공 확인

CORS 설정이 올바르게 적용되면:
- ✅ 이미지 업로드가 정상적으로 작동
- ✅ 브라우저 콘솔에 CORS 에러가 없음
- ✅ 포트폴리오가 정상적으로 저장됨

## 📞 추가 도움

문제가 지속되면:
1. 브라우저 개발자 도구의 Network 탭에서 요청/응답 확인
2. Firebase Console의 Storage 섹션에서 파일 업로드 상태 확인
3. Google Cloud Console의 Cloud Storage 로그 확인
