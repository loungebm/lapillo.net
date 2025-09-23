# 🔧 gcloud CLI로 CORS 설정하기

Google Cloud Console에서 CORS 설정이 안되는 경우, gcloud CLI를 사용해서 Firebase Storage 버킷의 CORS를 설정하는 방법입니다.

## 📋 사전 준비

### 1. gcloud CLI 인증 확인
```bash
gcloud auth list
```
- 현재 인증된 계정이 Firebase 프로젝트에 접근 권한이 있는지 확인

### 2. 프로젝트 설정 확인
```bash
gcloud config get-value project
```
- Firebase 프로젝트 ID가 올바른지 확인 (lapillo-portfolio)

### 3. 프로젝트 변경 (필요한 경우)
```bash
gcloud config set project lapillo-portfolio
```

## 🛠️ CORS 설정 방법

### 1단계: CORS 설정 파일 생성

먼저 CORS 설정을 위한 JSON 파일을 생성합니다:

```bash
# CORS 설정 파일 생성
cat > cors-config.json << 'EOF'
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
EOF
```

### 2단계: Storage 버킷 찾기

Firebase 프로젝트의 Storage 버킷 이름을 확인합니다:

```bash
# Storage 버킷 목록 확인
gsutil ls
```

또는 Firebase 프로젝트 ID를 기반으로 버킷 이름을 추정:
- `lapillo-portfolio.appspot.com`
- `lapillo-portfolio.firebasestorage.app`

### 3단계: CORS 설정 적용

```bash
# 버킷에 CORS 설정 적용
gsutil cors set cors-config.json gs://lapillo-portfolio.appspot.com
```

또는 다른 버킷 이름인 경우:
```bash
gsutil cors set cors-config.json gs://lapillo-portfolio.firebasestorage.app
```

### 4단계: 설정 확인

```bash
# CORS 설정 확인
gsutil cors get gs://lapillo-portfolio.appspot.com
```

## 🔍 문제 해결

### gsutil 명령어가 없는 경우
```bash
# gcloud components 설치
gcloud components install gsutil
```

### 권한 오류가 발생하는 경우
```bash
# 서비스 계정 인증
gcloud auth application-default login
```

### 버킷 이름을 모르는 경우
```bash
# 모든 버킷 목록 확인
gsutil ls -L
```

## 📝 완전한 설정 스크립트

다음 스크립트를 실행하면 한 번에 모든 설정이 완료됩니다:

```bash
#!/bin/bash

# 1. CORS 설정 파일 생성
cat > cors-config.json << 'EOF'
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
EOF

# 2. 프로젝트 설정 확인
echo "현재 프로젝트: $(gcloud config get-value project)"

# 3. Storage 버킷 목록 확인
echo "Storage 버킷 목록:"
gsutil ls

# 4. CORS 설정 적용 (버킷 이름을 실제 이름으로 변경)
echo "CORS 설정을 적용합니다..."
gsutil cors set cors-config.json gs://lapillo-portfolio.appspot.com

# 5. 설정 확인
echo "CORS 설정 확인:"
gsutil cors get gs://lapillo-portfolio.appspot.com

# 6. 임시 파일 삭제
rm cors-config.json

echo "CORS 설정이 완료되었습니다!"
```

## ✅ 설정 완료 후 확인

### 1. 브라우저에서 테스트
- `admin-firebase.html`에서 포트폴리오 업로드 시도
- 브라우저 개발자 도구 콘솔에서 CORS 에러 확인

### 2. 설정이 적용되지 않는 경우
- 몇 분 정도 기다린 후 다시 시도
- 브라우저 캐시 삭제 (Ctrl+Shift+R)
- 다른 브라우저에서 테스트

### 3. 추가 도메인이 필요한 경우
`cors-config.json` 파일의 `origin` 배열에 도메인을 추가하고 다시 설정:

```bash
gsutil cors set cors-config.json gs://버킷이름
```

## 🎯 성공 확인

CORS 설정이 올바르게 적용되면:
- ✅ 이미지 업로드가 정상적으로 작동
- ✅ 브라우저 콘솔에 CORS 에러가 없음
- ✅ 포트폴리오가 정상적으로 저장됨

## 📞 추가 도움

문제가 지속되면:
1. `gsutil cors get gs://버킷이름` 명령어로 현재 설정 확인
2. Firebase Console의 Storage 섹션에서 파일 업로드 상태 확인
3. 브라우저 개발자 도구의 Network 탭에서 요청/응답 확인
