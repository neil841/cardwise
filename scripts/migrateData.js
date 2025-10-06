#!/usr/bin/env node

/**
 * Simple migration script to upload data from JSON files to Firestore
 * No duplicate checking - just upload everything
 * 
 * Usage:
 *   node scripts/migrateData.js
 */

const { readFileSync } = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Counters for logging
let stats = {
  subjects: 0,
  flashcards: 0,
  quizzes: 0
};

/**
 * Upload subjects data
 */
async function uploadSubjects() {
  console.log('\n📚 Uploading subjects...');
  
  try {
    const subjectsData = JSON.parse(readFileSync('../public/subjects.json', 'utf8'));
    
    for (const [subjectKey, subjectInfo] of Object.entries(subjectsData)) {
      await db.collection('subjects').doc(subjectKey).set({
        name: subjectInfo.name,
        description: subjectInfo.description,
        icon: subjectInfo.icon,
        units: subjectInfo.units,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Uploaded subject: ${subjectKey}`);
      stats.subjects++;
    }
    
  } catch (error) {
    console.error(`❌ Error uploading subjects: ${error.message}`);
  }
}

/**
 * Upload flashcards data
 */
async function uploadFlashcards() {
  console.log('\n🔖 Uploading flashcards...');
  
  try {
    const flashcardsData = JSON.parse(readFileSync('../public/flashcards.json', 'utf8'));
    let totalCount = 0;
    let uploadedCount = 0;
    
    // Count total flashcards first
    for (const [subjectKey, subjectData] of Object.entries(flashcardsData)) {
      for (const [unitKey, unitData] of Object.entries(subjectData)) {
        for (const [chapterKey, chapterData] of Object.entries(unitData)) {
          if (Array.isArray(chapterData)) {
            totalCount += chapterData.length;
          }
        }
      }
    }
    
    // Upload flashcards
    for (const [subjectKey, subjectData] of Object.entries(flashcardsData)) {
      for (const [unitKey, unitData] of Object.entries(subjectData)) {
        for (const [chapterKey, chapterData] of Object.entries(unitData)) {
          
          if (!Array.isArray(chapterData)) continue;
          
          const unitIndex = parseInt(unitKey);
          const chapterIndex = parseInt(chapterKey);
          
          for (const flashcard of chapterData) {
            await db.collection('flashcards').add({
              question: flashcard.question,
              answer: flashcard.answer,
              subjectKey,
              unitIndex,
              chapterIndex,
              createdAt: new Date()
            });
            
            uploadedCount++;
            console.log(`✅ Uploaded flashcard ${uploadedCount}/${totalCount}: ${flashcard.question.substring(0, 50)}...`);
            stats.flashcards++;
          }
        }
      }
    }
    
  } catch (error) {
    console.error(`❌ Error uploading flashcards: ${error.message}`);
  }
}

/**
 * Upload quiz questions data
 */
async function uploadQuizQuestions() {
  console.log('\n❓ Uploading quiz questions...');
  
  try {
    const quizData = JSON.parse(readFileSync('../public/textbook-quiz.json', 'utf8'));
    let totalCount = 0;
    let uploadedCount = 0;
    
    // Count total quiz questions first
    for (const [subjectKey, subjectData] of Object.entries(quizData)) {
      for (const [unitKey, unitData] of Object.entries(subjectData)) {
        for (const [chapterKey, chapterData] of Object.entries(unitData)) {
          if (chapterData.textbook_questions && Array.isArray(chapterData.textbook_questions)) {
            totalCount += chapterData.textbook_questions.length;
          }
        }
      }
    }
    
    // Upload quiz questions
    for (const [subjectKey, subjectData] of Object.entries(quizData)) {
      for (const [unitKey, unitData] of Object.entries(subjectData)) {
        for (const [chapterKey, chapterData] of Object.entries(unitData)) {
          
          if (!chapterData.textbook_questions || !Array.isArray(chapterData.textbook_questions)) continue;
          
          const unitIndex = parseInt(unitKey);
          const chapterIndex = parseInt(chapterKey);
          
          for (const question of chapterData.textbook_questions) {
            await db.collection('quizzes').add({
              question: question.question,
              answer: question.answer,
              type: question.type,
              bold_concept: question.bold_concept,
              ib_exam_frequency: question.ib_exam_frequency,
              subjectKey,
              unitIndex,
              chapterIndex,
              createdAt: new Date()
            });
            
            uploadedCount++;
            console.log(`✅ Uploaded quiz ${uploadedCount}/${totalCount}: ${question.question.substring(0, 50)}...`);
            stats.quizzes++;
          }
        }
      }
    }
    
  } catch (error) {
    console.error(`❌ Error uploading quiz questions: ${error.message}`);
  }
}

/**
 * Print final statistics
 */
function printStats() {
  console.log('\n📊 Upload Summary:');
  console.log('════════════════════');
  console.log(`📚 Subjects: ${stats.subjects}`);
  console.log(`🔖 Flashcards: ${stats.flashcards}`);
  console.log(`❓ Quiz Questions: ${stats.quizzes}`);
  console.log('════════════════════');
  
  const total = stats.subjects + stats.flashcards + stats.quizzes;
  console.log(`🎯 Total Documents: ${total}`);
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting CardWise data upload to Firestore...');
  console.log(`📁 Working directory: ${process.cwd()}`);
  
  try {
    await uploadSubjects();
    await uploadFlashcards();
    await uploadQuizQuestions();
    
    printStats();
    console.log('\n✅ Upload completed successfully!');
    
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrate();