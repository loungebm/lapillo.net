// 개발 서버용 간단한 프록시 (CORS 문제 해결)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3000;

// CORS 허용
app.use(cors());

// Firebase Storage 프록시
app.use('/firebase-storage', createProxyMiddleware({
  target: 'https://firebasestorage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/firebase-storage': ''
  }
}));

app.listen(PORT, () => {
  console.log(`개발 프록시 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
