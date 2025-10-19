#!/usr/bin/env node

/**
 * Script to clear all books from Firestore
 *
 * Usage:
 *   node scripts/clearBooks.js
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
 * Delete all documents in books collection
 */
async function clearBooks() {
  console.log('\n🗑️  Clearing books collection...');

  try {
    const snapshot = await db.collection('books').get();

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
    console.log(`✅ Successfully deleted ${snapshot.size} books`);

  } catch (error) {
    console.error(`❌ Error clearing books: ${error.message}`);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Books Cleanup...');

  try {
    await clearBooks();
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
