/**
 * AnswerChecker - Fuzzy matching utility for quiz answers
 * Provides similarity-based answer checking with configurable threshold
 */
class AnswerChecker {
  constructor(threshold = 0.8) {
    this.threshold = threshold; // 80% similarity threshold by default
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Edit distance between strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,     // deletion
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j - 1] + 1  // substitution
          );
        }
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Calculate similarity percentage between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Similarity as percentage (0-1)
   */
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 && str2.length === 0) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Check if user answer is correct based on similarity threshold
   * @param {string} userAnswer - User's input
   * @param {string} correctAnswer - Correct answer
   * @returns {Object} - {isCorrect: boolean, similarity: number}
   */
  checkAnswer(userAnswer, correctAnswer) {
    // Normalize answers for comparison
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();

    // Calculate similarity
    const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);
    
    // Check if similarity meets threshold
    const isCorrect = similarity >= this.threshold;

    return {
      isCorrect,
      similarity: Math.round(similarity * 100) // Return as percentage
    };
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.AnswerChecker = AnswerChecker;
}