import admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  if (privateKey && process.env.FIREBASE_PROJECT_ID) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (e) {
      console.warn('⚠ Firebase init failed — push notifications disabled.', (e as Error).message);
      admin.initializeApp();
    }
  } else {
    console.warn('⚠ Firebase credentials missing — push notifications disabled.');
    admin.initializeApp();
  }
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<boolean> {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data,
    });
    return true;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}

export default admin;
