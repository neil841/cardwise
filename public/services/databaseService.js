// Database service for Firestore operations
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../firebase/config.js';

/**
 * Get flashcards for a specific chapter
 * @param {string} subjectKey - Subject identifier (e.g., 'economics')
 * @param {number} unitIndex - Unit index (0-based)
 * @param {number} chapterIndex - Chapter index (0-based)
 * @returns {Promise<Array>} Array of flashcard objects
 */
export async function getChapterFlashcards(subjectKey, unitIndex, chapterIndex) {
  try {
    const docRef = doc(db, 'flashcards', subjectKey, 'units', unitIndex.toString(), 'chapters', chapterIndex.toString());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.flashcards || [];
    } else {
      console.log('No flashcards found for this chapter');
      return [];
    }
  } catch (error) {
    console.error('Error getting chapter flashcards:', error);
    throw error;
  }
}

/**
 * Get quiz questions for a specific chapter
 * @param {string} subjectKey - Subject identifier (e.g., 'economics')
 * @param {number} unitIndex - Unit index (0-based)
 * @param {number} chapterIndex - Chapter index (0-based)
 * @returns {Promise<Array>} Array of quiz question objects
 */
export async function getQuizQuestions(subjectKey, unitIndex, chapterIndex) {
  try {
    const docRef = doc(db, 'quiz_questions', subjectKey, 'units', unitIndex.toString(), 'chapters', chapterIndex.toString());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.questions || [];
    } else {
      console.log('No quiz questions found for this chapter');
      return [];
    }
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    throw error;
  }
}

/**
 * Get subject data (units and chapters structure)
 * @param {string} subjectKey - Subject identifier (e.g., 'economics')
 * @returns {Promise<Object|null>} Subject data object or null if not found
 */
export async function getSubjectData(subjectKey) {
  try {
    const docRef = doc(db, 'subjects', subjectKey);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log('No subject data found');
      return null;
    }
  } catch (error) {
    console.error('Error getting subject data:', error);
    throw error;
  }
}

/**
 * Get all subjects
 * @returns {Promise<Object>} Object with all subjects data
 */
export async function getAllSubjects() {
  try {
    const querySnapshot = await getDocs(collection(db, 'subjects'));
    const subjects = {};
    
    querySnapshot.forEach((doc) => {
      subjects[doc.id] = doc.data();
    });
    
    return subjects;
  } catch (error) {
    console.error('Error getting all subjects:', error);
    throw error;
  }
}

/**
 * Save a quiz attempt for a user
 * @param {string} userId - User's UID
 * @param {string} subjectKey - Subject identifier
 * @param {number} unitIndex - Unit index
 * @param {number} chapterIndex - Chapter index  
 * @param {Array} answers - Array of user answers with questions
 * @param {number} score - User's score on the quiz
 * @param {number} totalQuestions - Total number of questions
 * @returns {Promise<string>} Document ID of the saved quiz attempt
 */
export async function saveQuizAttempt(userId, subjectKey, unitIndex, chapterIndex, answers, score, totalQuestions) {
  try {
    const quizAttempt = {
      userId,
      subjectKey,
      unitIndex,
      chapterIndex,
      answers,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      timestamp: serverTimestamp(),
      completedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'quiz_attempts'), quizAttempt);
    
    // Update user stats
    await updateUserStats(userId, score, totalQuestions);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }
}

/**
 * Get quiz history for a user
 * @param {string} userId - User's UID
 * @param {number} limitCount - Maximum number of attempts to return (default: 50)
 * @returns {Promise<Array>} Array of quiz attempt objects
 */
export async function getUserQuizHistory(userId, limitCount = 50) {
  try {
    const q = query(
      collection(db, 'quiz_attempts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const quizHistory = [];
    
    querySnapshot.forEach((doc) => {
      quizHistory.push({ id: doc.id, ...doc.data() });
    });
    
    return quizHistory;
  } catch (error) {
    console.error('Error getting user quiz history:', error);
    throw error;
  }
}

/**
 * Get quiz statistics for a user by subject
 * @param {string} userId - User's UID
 * @param {string} subjectKey - Subject identifier
 * @returns {Promise<Object>} Quiz statistics object
 */
export async function getUserQuizStats(userId, subjectKey) {
  try {
    const q = query(
      collection(db, 'quiz_attempts'),
      where('userId', '==', userId),
      where('subjectKey', '==', subjectKey),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const attempts = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push(doc.data());
    });
    
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        lastAttempt: null
      };
    }
    
    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts;
    const bestScore = Math.max(...attempts.map(attempt => attempt.percentage));
    const lastAttempt = attempts[0]; // Most recent due to desc order
    
    return {
      totalAttempts,
      averageScore: Math.round(averageScore),
      bestScore,
      lastAttempt
    };
  } catch (error) {
    console.error('Error getting user quiz stats:', error);
    throw error;
  }
}

/**
 * Update user statistics after quiz completion
 * @param {string} userId - User's UID
 * @param {number} score - Points scored
 * @param {number} totalQuestions - Total questions in quiz
 * @returns {Promise<void>}
 */
async function updateUserStats(userId, score, totalQuestions) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const newQuizAttempts = (userData.quizAttempts || 0) + 1;
      const newTotalScore = (userData.totalScore || 0) + score;
      
      await setDoc(userRef, {
        quizAttempts: newQuizAttempts,
        totalScore: newTotalScore,
        lastQuizAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    // Don't throw error here to avoid blocking quiz save
  }
}