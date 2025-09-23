const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 관리자 UID (Firebase Authentication에서 확인한 UID)
const ADMIN_UID = 'ZLdtlIoGkbU4fF7KaDQLSltibv53';

async function main() {
  try {
    // 관리자 클레임 부여
    await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
    
    // 사용자 정보 확인
    const user = await admin.auth().getUser(ADMIN_UID);
    console.log('✅ admin 클레임 부여 완료:', {
      uid: user.uid,
      email: user.email,
      claims: user.customClaims
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

main();
