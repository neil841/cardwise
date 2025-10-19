#!/usr/bin/env node

/**
 * Script to clear all practice papers from Firestore
 *
 * Usage:
 *   node scripts/clearPracticePapers.js
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

/**
 * Delete all documents in practice_papers collection
 */
async function clearPracticePapers() {
  console.log('\n🗑️  Clearing practice_papers collection...');

  try {
    const snapshot = await db.collection('practice_papers').get();

    if (snapshot.empty) {
      console.log('✅ Collection is already empty');
      return;
    }

    console.log(`Found ${snapshot.size} documents to delete`);

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Successfully deleted ${snapshot.size} practice papers`);

  } catch (error) {
    console.error(`❌ Error clearing practice papers: ${error.message}`);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Practice Papers Cleanup...');

  try {
    await clearPracticePapers();
    console.log('\n✅ Cleanup completed successfully!');

  } catch (error) {
    console.error(`❌ Cleanup failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
main();
