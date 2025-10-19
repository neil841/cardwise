#!/usr/bin/env node

/**
 * Script to create Practice Papers collection in Firestore
 * Sets up structure for past papers and mock exams
 *
 * Usage:
 *   node scripts/addPracticePapersCollection.js
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

// Sample practice papers data structure
// You can replace this with actual data or keep it as placeholder
const SAMPLE_PRACTICE_PAPERS = [
  {
    title: 'Biology HL Paper 1 - May 2024',
    subject: 'biology',
    level: 'HL',
    paperNumber: 1,
    year: 2024,
    session: 'May',
    timeLimit: 60,
    totalMarks: 40,
    numberOfQuestions: 40,
    description: 'Multiple choice questions covering all units',
    pdfUrl: null, // To be added later
    createdAt: new Date()
  },
  {
    title: 'Chemistry SL Paper 2 - November 2023',
    subject: 'chemistry',
    level: 'SL',
    paperNumber: 2,
    year: 2023,
    session: 'November',
    timeLimit: 75,
    totalMarks: 50,
    numberOfQuestions: 7,
    description: 'Short and long answer questions',
    pdfUrl: null,
    createdAt: new Date()
  },
  {
    title: 'Economics HL Paper 1 - May 2024',
    subject: 'economics',
    level: 'HL',
    paperNumber: 1,
    year: 2024,
    session: 'May',
    timeLimit: 90,
    totalMarks: 40,
    numberOfQuestions: 3,
    description: 'Essay questions on microeconomics and macroeconomics',
    pdfUrl: null,
    createdAt: new Date()
  },
  {
    title: 'Mathematics AA HL Paper 1 - May 2024',
    subject: 'mathematics',
    level: 'HL',
    paperNumber: 1,
    year: 2024,
    session: 'May',
    timeLimit: 120,
    totalMarks: 110,
    numberOfQuestions: 12,
    description: 'No calculator paper',
    pdfUrl: null,
    createdAt: new Date()
  },
  {
    title: 'Physics SL Paper 3 - November 2023',
    subject: 'physics',
    level: 'SL',
    paperNumber: 3,
    year: 2023,
    session: 'November',
    timeLimit: 60,
    totalMarks: 35,
    numberOfQuestions: 8,
    description: 'Data-based questions and short-answer questions on core',
    pdfUrl: null,
    createdAt: new Date()
  }
];

let stats = {
  papersAdded: 0,
  errors: 0
};

/**
 * Create practice papers collection
 */
async function createPracticePapersCollection() {
  console.log('\n📄 Creating Practice Papers collection...');

  try {
    const batch = db.batch();

    for (const paper of SAMPLE_PRACTICE_PAPERS) {
      const docRef = db.collection('practice_papers').doc();
      batch.set(docRef, paper);
      stats.papersAdded++;
      console.log(`✅ Added: ${paper.title}`);
    }

    await batch.commit();
    console.log(`\n✅ Successfully added ${stats.papersAdded} practice papers`);

  } catch (error) {
    console.error(`❌ Error creating practice papers: ${error.message}`);
    stats.errors++;
    throw error;
  }
}

/**
 * Print usage instructions
 */
function printInstructions() {
  console.log('\n📋 Practice Papers Collection Structure:');
  console.log('════════════════════════════════════════');
  console.log('Fields:');
  console.log('  - title: string (e.g., "Biology HL Paper 1 - May 2024")');
  console.log('  - subject: string (e.g., "biology", "chemistry")');
  console.log('  - level: string ("HL" or "SL")');
  console.log('  - paperNumber: number (1, 2, 3)');
  console.log('  - year: number (e.g., 2024)');
  console.log('  - session: string ("May" or "November")');
  console.log('  - timeLimit: number (minutes)');
  console.log('  - totalMarks: number');
  console.log('  - numberOfQuestions: number');
  console.log('  - description: string');
  console.log('  - pdfUrl: string (URL to PDF file)');
  console.log('  - createdAt: timestamp');
  console.log('════════════════════════════════════════');
  console.log('\n💡 To add more papers:');
  console.log('   1. Add PDFs to Firebase Storage');
  console.log('   2. Update pdfUrl field in Firestore');
  console.log('   3. Or manually add via Firebase Console');
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Practice Papers Collection Setup...');

  try {
    await createPracticePapersCollection();

    console.log('\n📊 Setup Summary:');
    console.log('════════════════════');
    console.log(`📄 Practice Papers Added: ${stats.papersAdded}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('════════════════════');

    printInstructions();

    console.log('\n✅ Practice Papers collection created successfully!');

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
main();
