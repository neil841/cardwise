#!/usr/bin/env node

/**
 * Script to count documents in practice_papers collection
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function countPapers() {
  try {
    const snapshot = await db.collection('practice_papers').count().get();
    const count = snapshot.data().count;

    console.log(`\n📊 Practice Papers Collection:`);
    console.log(`   Total documents: ${count}`);

    // Also show books count for comparison
    const booksSnapshot = await db.collection('books').count().get();
    const booksCount = booksSnapshot.data().count;

    console.log(`\n📚 Books Collection:`);
    console.log(`   Total documents: ${booksCount}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    process.exit(0);
  }
}

countPapers();
