// lib/createUserOnSignup.js
// Called after successful signup (server-side). Creates a user doc with the Free plan.
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

export async function createUserOnSignup({ email, name }) {
  if (!email) throw new Error('email required');

  const freePlanId = process.env.FREE_PLAN_ID || 'pro_01jyrn8zp3838a40brjdhfdx9k';

  const doc = {
    email,
    name: name || null,
    plan: {
      id: freePlanId,
      name: 'Free',
    },
    status: 'active',
    subscription_id: null,
    next_bill_date: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('users').doc(email).set(doc, { merge: true });
  return { ok: true };
}
