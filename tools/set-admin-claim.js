const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_UID = 'ZLdtlIoGkbU4fF7KaDQLSltibv53';

async function main() {
  await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
  const user = await admin.auth().getUser(ADMIN_UID);
  console.log('✅ admin 클레임 부여 완료:', user.uid, user.email);
}

main().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});