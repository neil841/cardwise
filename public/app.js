
// Authentication integration - Firebase imports and auth state
let authModal = null;
let currentUser = null;

// Make currentUser accessible globally for auth component
window.currentUser = currentUser;

// Flag to track if app has initialized and shown a screen
let hasNavigated = false;

// Screen navigation
let currentSubject = '';
let currentSubjectName = '';
let currentSubjectDescription = '';
let currentUnit = '';
let currentUnitName = '';
let currentChapter = '';
let currentChapterTitle = '';

// Quiz variables
let quizFlashcards = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let totalQuestions = 0;
let quizAnswers = []; // Store all quiz answers for saving to Firestore

function showScreenWithTransition(targetScreenId) {
  const currentScreen = document.querySelector('.screen:not([style*="display: none"])');
  const targetScreen = document.getElementById(targetScreenId);

  // Mark that navigation has occurred
  hasNavigated = true;

  if (currentScreen) {
    currentScreen.classList.add('fade-out');
    setTimeout(() => {
      document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('fade-out', 'fade-in');
      });
      targetScreen.style.display = 'flex';
      targetScreen.classList.add('fade-in');
    }, 200);
  } else {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    targetScreen.style.display = 'flex';
    targetScreen.classList.add('fade-in');
  }
}

function showLandingPage() {
  console.log('showLandingPage() called from:', new Error().stack);
  showScreenWithTransition('landingPage');
}

function showSubjectUnitsScreen(subjectKey, subjectName, subjectDescription) {
  currentSubject = subjectKey;
  currentSubjectName = subjectName;
  currentSubjectDescription = subjectDescription;
  
  // Update page content
  document.getElementById('currentSubjectBreadcrumb').textContent = subjectName;
  document.getElementById('subjectPageTitle').textContent = subjectName;
  document.getElementById('subjectPageSubtitle').textContent = subjectDescription;
  
  // Load units
  loadSubjectUnits(subjectKey);
  
  showScreenWithTransition('subjectUnitsScreen');
}

function showUnitChaptersScreen(unitIndex, unitName) {
  currentUnit = unitIndex;
  currentUnitName = unitName;
  
  // Update page content
  document.getElementById('subjectBreadcrumbLink').textContent = currentSubjectName;
  document.getElementById('currentUnitBreadcrumb').textContent = unitName;
  document.getElementById('unitPageTitle').textContent = unitName;
  
  // Load chapters for this unit
  loadUnitChapters(currentSubject, unitIndex);
  
  showScreenWithTransition('unitChaptersScreen');
}

function showChapterFlashcards(subjectKey, unitIndex, chapterIndex, chapterTitle) {
  // Store current chapter info and ensure unit is also updated
  currentUnit = unitIndex;
  currentChapter = chapterIndex;
  currentChapterTitle = chapterTitle;
  
  // Update breadcrumb and title
  document.getElementById('chapterSubjectBreadcrumbLink').textContent = currentSubjectName;
  document.getElementById('chapterUnitBreadcrumbLink').textContent = currentUnitName;
  document.getElementById('currentChapterBreadcrumb').textContent = chapterTitle;
  document.getElementById('chapterPageTitle').textContent = chapterTitle;
  
  // Load flashcards for this chapter
  loadChapterFlashcards(subjectKey, unitIndex, chapterIndex);
  
  showScreenWithTransition('chapterFlashcardsScreen');
}

function loadSubjectUnits(subjectKey) {
  const unitsGrid = document.getElementById('unitsGrid');
  if (!unitsGrid) return;
  
  unitsGrid.innerHTML = '';
  const subjectInfo = subjectData[subjectKey];
  if (!subjectInfo || !subjectInfo.units) return;
  
  subjectInfo.units.forEach((unit, index) => {
    const unitCard = document.createElement('div');
    unitCard.className = `chapter-card subject-${subjectKey.replace(/\s+/g, '-').toLowerCase()}`;
    unitCard.setAttribute('data-subject', subjectKey);
    // Force white background for unit cards (light theme)
    unitCard.style.setProperty('background-color', '#FFFFFF', 'important');
    unitCard.style.setProperty('background', '#FFFFFF', 'important');
    unitCard.onclick = () => {
      showUnitChaptersScreen(index, unit.name);
    };
    
    unitCard.innerHTML = `
      <div class="chapter-unit">Unit ${index + 1}</div>
      <div class="chapter-title">${unit.name}</div>
    `;
    
    // Add staggered animation delay
    unitCard.style.animationDelay = `${index * 0.1}s`;
    
    unitsGrid.appendChild(unitCard);
  });
}

function loadUnitChapters(subjectKey, unitIndex) {
  const chaptersGrid = document.getElementById('chaptersGrid');
  if (!chaptersGrid) return;
  
  chaptersGrid.innerHTML = '';
  const subjectInfo = subjectData[subjectKey];
  if (!subjectInfo || !subjectInfo.units || !subjectInfo.units[unitIndex]) return;
  
  const unit = subjectInfo.units[unitIndex];
  const chapters = unit.chapters || [];
  
  chapters.forEach((chapter, index) => {
    const chapterCard = document.createElement('div');
    chapterCard.className = `chapter-card subject-${subjectKey.replace(/\s+/g, '-').toLowerCase()}`;
    chapterCard.setAttribute('data-subject', subjectKey);
    // Force white background for chapter cards (light theme)
    chapterCard.style.setProperty('background-color', '#FFFFFF', 'important');
    chapterCard.style.setProperty('background', '#FFFFFF', 'important');
    chapterCard.onclick = () => {
      showChapterFlashcards(subjectKey, unitIndex, index, chapter.title);
    };
    
    chapterCard.innerHTML = `
      <div class="chapter-unit">${unit.name}</div>
      <div class="chapter-title">${chapter.title}</div>
    `;
    
    // Add staggered animation delay
    chapterCard.style.animationDelay = `${index * 0.1}s`;
    
    chaptersGrid.appendChild(chapterCard);
  });
}

function loadChapterFlashcards(subjectKey, unitIndex, chapterIndex) {
  const flashcardsGrid = document.getElementById('flashcardsGrid');
  if (!flashcardsGrid) return;
  
  flashcardsGrid.innerHTML = '';
  
  // Convert indices to strings since the JSON uses string keys
  const unitKey = unitIndex.toString();
  const chapterKey = chapterIndex.toString();
  
  console.log('Loading flashcards for:', { subjectKey, unitKey, chapterKey });
  console.log('Available data keys:', Object.keys(chapterFlashcards));
  console.log('Subject data:', chapterFlashcards[subjectKey]);
  console.log('Unit data:', chapterFlashcards[subjectKey]?.[unitKey]);
  console.log('Chapter data:', chapterFlashcards[subjectKey]?.[unitKey]?.[chapterKey]);
  
  // Get flashcards for this specific chapter
  const flashcards = chapterFlashcards[subjectKey]?.[unitKey]?.[chapterKey] || [];
  
  console.log('Found flashcards:', flashcards);
  
  if (flashcards.length === 0) {
    flashcardsGrid.innerHTML = '<div class="no-flashcards">No flashcards available for this chapter yet.</div>';
    return;
  }
  
  flashcards.forEach((flashcard, index) => {
    const flashcardDiv = document.createElement('div');
    flashcardDiv.className = `flashcard subject-${subjectKey.replace(/\s+/g, '-').toLowerCase()}`;
    
    // FIXED: Updated HTML structure with separate containers
    flashcardDiv.innerHTML = `
      <div class="flashcard-flip-container">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <div class="flashcard-content">${flashcard.question}</div>
            <div class="click-message">Click to reveal answer</div>
          </div>
          <div class="flashcard-back">
            <div class="flashcard-content">${flashcard.answer}</div>
          </div>
        </div>
      </div>
    `;

    // FIXED: Click handler on the outer .flashcard div
    flashcardDiv.onclick = () => {
      flashcardDiv.classList.toggle('flipped');
    };
    
    // Add staggered animation delay
    flashcardDiv.style.animationDelay = `${index * 0.1}s`;

    // Force white background for flashcard elements (light theme)
    const flashcardFront = flashcardDiv.querySelector('.flashcard-front');
    const flashcardBack = flashcardDiv.querySelector('.flashcard-back');
    if (flashcardFront) {
      flashcardFront.style.setProperty('background-color', '#FFFFFF', 'important');
      flashcardFront.style.setProperty('background', '#FFFFFF', 'important');
    }
    if (flashcardBack) {
      flashcardBack.style.setProperty('background-color', '#FFFFFF', 'important');
      flashcardBack.style.setProperty('background', '#FFFFFF', 'important');
    }
    
    flashcardsGrid.appendChild(flashcardDiv);
  });
}


// Flashcard data - loaded from external JSON file
let chapterFlashcards = {};

// Textbook quiz data - loaded from external JSON file
let textbookQuizData = {};

// Function to load flashcards from Firestore
async function loadChapterFlashcardsFromFirestore() {
  try {
    // Import database service dynamically
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get all flashcards from Firestore
    const flashcardsSnapshot = await getDocs(collection(db, 'flashcards'));
    
    // Rebuild the same structure as JSON: chapterFlashcards[subjectKey][unitKey][chapterKey]
    chapterFlashcards = {};
    
    flashcardsSnapshot.forEach((doc) => {
      const flashcard = doc.data();
      const { subjectKey, unitIndex, chapterIndex } = flashcard;
      const unitKey = unitIndex.toString();
      const chapterKey = chapterIndex.toString();
      
      // Initialize nested structure if needed
      if (!chapterFlashcards[subjectKey]) {
        chapterFlashcards[subjectKey] = {};
      }
      if (!chapterFlashcards[subjectKey][unitKey]) {
        chapterFlashcards[subjectKey][unitKey] = {};
      }
      if (!chapterFlashcards[subjectKey][unitKey][chapterKey]) {
        chapterFlashcards[subjectKey][unitKey][chapterKey] = [];
      }
      
      // Add flashcard to the array
      chapterFlashcards[subjectKey][unitKey][chapterKey].push({
        question: flashcard.question,
        answer: flashcard.answer
      });
    });
    
    console.log('Chapter flashcards loaded from Firestore:', chapterFlashcards);
  } catch (error) {
    console.error('Error loading flashcards from Firestore:', error);
    // Fallback to empty structure
    chapterFlashcards = {};
  }
}

// Function to load textbook quiz questions from Firestore
async function loadTextbookQuizFromFirestore() {
  try {
    // Import database service dynamically
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get all quiz questions from Firestore
    const quizSnapshot = await getDocs(collection(db, 'quizzes'));
    
    // Rebuild the same structure as JSON: textbookQuizData[subjectKey][unitKey][chapterKey].textbook_questions
    textbookQuizData = {};
    
    quizSnapshot.forEach((doc) => {
      const quiz = doc.data();
      const { subjectKey, unitIndex, chapterIndex } = quiz;
      const unitKey = unitIndex.toString();
      const chapterKey = chapterIndex.toString();
      
      // Initialize nested structure if needed
      if (!textbookQuizData[subjectKey]) {
        textbookQuizData[subjectKey] = {};
      }
      if (!textbookQuizData[subjectKey][unitKey]) {
        textbookQuizData[subjectKey][unitKey] = {};
      }
      if (!textbookQuizData[subjectKey][unitKey][chapterKey]) {
        textbookQuizData[subjectKey][unitKey][chapterKey] = {
          textbook_questions: []
        };
      }
      
      // Add quiz question to the array
      textbookQuizData[subjectKey][unitKey][chapterKey].textbook_questions.push({
        question: quiz.question,
        answer: quiz.answer,
        type: quiz.type,
        bold_concept: quiz.bold_concept,
        ib_exam_frequency: quiz.ib_exam_frequency
      });
    });
    
    console.log('Textbook quiz data loaded from Firestore:', textbookQuizData);
  } catch (error) {
    console.error('Error loading textbook quiz data from Firestore:', error);
    // Fallback to empty structure
    textbookQuizData = {};
  }
}

// Subject units and chapters data - loaded from external JSON file
let subjectData = {};

// Function to load subjects from Firestore
async function loadSubjectsFromFirestore() {
  try {
    // Import database service dynamically
    const { getAllSubjects } = await import('./services/databaseService.js');
    subjectData = await getAllSubjects();
    console.log('Subject data loaded from Firestore:', subjectData);
  } catch (error) {
    console.error('Error loading subjects from Firestore:', error);
    // Fallback to empty structure
    subjectData = {};
  }
}

// Create subject icons on the landing page
function createSubjectIcons() {
  console.log('Creating subject icons...');
  const container = document.getElementById('subjectIconsContainer');
  console.log('Container found:', container);
  if (!container) {
    console.error('subjectIconsContainer not found!');
    return;
  }
  
  container.innerHTML = '';
  
  // Create subjects from loaded JSON data
  const subjectKeys = Object.keys(subjectData);
  console.log('Subjects to create:', subjectKeys.length);
  
  subjectKeys.forEach(subjectKey => {
    const subject = subjectData[subjectKey];
    const subjectButton = document.createElement('div');
    subjectButton.className = `subject-button subject-${subjectKey.replace(/\s+/g, '-').toLowerCase()}`;
    subjectButton.setAttribute('data-subject', subjectKey);
    // Force white background for subject cards (light theme)
    subjectButton.style.setProperty('background-color', '#FFFFFF', 'important');
    subjectButton.style.setProperty('background', '#FFFFFF', 'important');
    subjectButton.onclick = () => {
      // Add click animation
      subjectButton.classList.add('clicking');
      setTimeout(() => {
        subjectButton.classList.remove('clicking');
        showSubjectUnitsScreen(subjectKey, subject.name, subject.description);
      }, 150);
    };
    
    subjectButton.innerHTML = `
      <div class="subject-icon">${subject.icon}</div>
      <div class="subject-info">
        <div class="subject-name">${subject.name}</div>
        <div class="subject-description">${subject.description}</div>
      </div>
    `;
    
    container.appendChild(subjectButton);
  });
}

// Search and Filter functionality
let allFlashcards = [];

function initializeSearchAndFilter() {
  // Initialize dropdown options
  populateFilterDropdowns();
  
  // Add event listeners
  document.getElementById('searchInput').addEventListener('input', () => {
    checkClearButtonVisibility();
    handleSearch();
  });
  document.getElementById('searchButton').addEventListener('click', handleSearch);
  document.getElementById('subjectFilter').addEventListener('change', (event) => {
    checkClearButtonVisibility();
    handleFilterChange(event);
  });
  document.getElementById('unitFilter').addEventListener('change', (event) => {
    checkClearButtonVisibility();
    handleFilterChange(event);
  });
  document.getElementById('chapterFilter').addEventListener('change', (event) => {
    checkClearButtonVisibility();
    handleFilterChange(event);
  });
  document.getElementById('clearButton').addEventListener('click', handleClear);
  
  // Allow search on Enter key
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
}

function populateFilterDropdowns() {
  const subjectFilter = document.getElementById('subjectFilter');
  const unitFilter = document.getElementById('unitFilter');
  const chapterFilter = document.getElementById('chapterFilter');
  
  // Clear existing options (except default)
  subjectFilter.innerHTML = '<option value="">All Subjects</option>';
  unitFilter.innerHTML = '<option value="">All Units</option>';
  chapterFilter.innerHTML = '<option value="">All Chapters</option>';
  
  // Populate subject filter
  Object.keys(subjectData).forEach(subjectKey => {
    const option = document.createElement('option');
    option.value = subjectKey;
    option.textContent = subjectData[subjectKey].name;
    subjectFilter.appendChild(option);
  });
}

function updateUnitFilter(selectedSubject) {
  const unitFilter = document.getElementById('unitFilter');
  unitFilter.innerHTML = '<option value="">All Units</option>';
  
  if (selectedSubject && subjectData[selectedSubject] && subjectData[selectedSubject].units) {
    subjectData[selectedSubject].units.forEach((unit, unitIndex) => {
      const option = document.createElement('option');
      option.value = unitIndex;
      option.textContent = unit.name;
      unitFilter.appendChild(option);
    });
  }
}

function updateChapterFilter(selectedSubject, selectedUnit) {
  const chapterFilter = document.getElementById('chapterFilter');
  chapterFilter.innerHTML = '<option value="">All Chapters</option>';
  
  if (selectedSubject && selectedUnit !== '' && 
      subjectData[selectedSubject] && 
      subjectData[selectedSubject].units && 
      subjectData[selectedSubject].units[selectedUnit] && 
      subjectData[selectedSubject].units[selectedUnit].chapters) {
    
    subjectData[selectedSubject].units[selectedUnit].chapters.forEach((chapter, chapterIndex) => {
      const option = document.createElement('option');
      option.value = chapterIndex;
      option.textContent = chapter.title;
      chapterFilter.appendChild(option);
    });
  }
}

function resetUnitFilter() {
  const unitFilter = document.getElementById('unitFilter');
  unitFilter.innerHTML = '<option value="">All Units</option>';
}

function resetChapterFilter() {
  const chapterFilter = document.getElementById('chapterFilter');
  chapterFilter.innerHTML = '<option value="">All Chapters</option>';
}

function handleFilterChange(event) {
  const changedElement = event.target.id;
  const selectedSubject = document.getElementById('subjectFilter').value;
  const selectedUnit = document.getElementById('unitFilter').value;
  const selectedChapter = document.getElementById('chapterFilter').value;
  
  // Check if user selected "All" options (empty values) - redirect to landing page
  if (!selectedSubject && !selectedUnit && !selectedChapter && !document.getElementById('searchInput').value.trim()) {
    hideSearchResults();
    showLandingPage();
    return;
  }
  
  // If subject changed, reset unit and chapter filters
  if (changedElement === 'subjectFilter') {
    document.getElementById('unitFilter').value = '';
    document.getElementById('chapterFilter').value = '';
    
    if (selectedSubject) {
      updateUnitFilter(selectedSubject);
    } else {
      resetUnitFilter();
      // If subject is set to "All Subjects", go to landing page
      hideSearchResults();
      showLandingPage();
      return;
    }
    resetChapterFilter();
  }
  
  // If unit changed, reset chapter filter
  if (changedElement === 'unitFilter') {
    document.getElementById('chapterFilter').value = '';
    
    if (selectedSubject && selectedUnit) {
      updateChapterFilter(selectedSubject, selectedUnit);
    } else {
      resetChapterFilter();
      // If unit is set to "All Units" and no subject selected, go to landing page
      if (!selectedSubject) {
        hideSearchResults();
        showLandingPage();
        return;
      }
    }
  }
  
  // If chapter changed to "All Chapters" and no other filters, go to landing page
  if (changedElement === 'chapterFilter') {
    if (!selectedChapter && !selectedUnit && !selectedSubject) {
      hideSearchResults();
      showLandingPage();
      return;
    }
  }
  
  // Trigger search if there's a search term or any filter is selected
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm || selectedSubject || selectedUnit || selectedChapter) {
    handleSearch();
  }
}

function buildAllFlashcardsIndex() {
  allFlashcards = [];
  
  Object.keys(chapterFlashcards).forEach(subjectKey => {
    const subject = chapterFlashcards[subjectKey];
    const subjectName = subjectData[subjectKey]?.name || subjectKey;
    
    Object.keys(subject).forEach(unitKey => {
      const unit = subject[unitKey];
      const unitName = subjectData[subjectKey]?.units?.[unitKey]?.name || `Unit ${parseInt(unitKey) + 1}`;
      
      Object.keys(unit).forEach(chapterKey => {
        const chapter = unit[chapterKey];
        const chapterName = subjectData[subjectKey]?.units?.[unitKey]?.chapters?.[chapterKey]?.title || `Chapter ${parseInt(chapterKey) + 1}`;
        
        if (Array.isArray(chapter)) {
          chapter.forEach((flashcard, index) => {
            allFlashcards.push({
              ...flashcard,
              subject: subjectKey,
              subjectName: subjectName,
              unit: unitKey,
              unitName: unitName,
              chapter: chapterKey,
              chapterName: chapterName,
              index: index
            });
          });
        }
      });
    });
  });
}

function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  const selectedSubject = document.getElementById('subjectFilter').value;
  const selectedUnit = document.getElementById('unitFilter').value;
  const selectedChapter = document.getElementById('chapterFilter').value;
  
  // Build index if not already built
  if (allFlashcards.length === 0) {
    buildAllFlashcardsIndex();
  }
  
  let filteredResults = allFlashcards;
  
  // Apply filters
  if (selectedSubject) {
    filteredResults = filteredResults.filter(card => card.subject === selectedSubject);
  }
  
  if (selectedUnit) {
    filteredResults = filteredResults.filter(card => card.unit === selectedUnit);
  }
  
  if (selectedChapter) {
    filteredResults = filteredResults.filter(card => card.chapter === selectedChapter);
  }
  
  // Apply search term
  if (searchTerm) {
    filteredResults = filteredResults.filter(card => 
      card.question.toLowerCase().includes(searchTerm) || 
      card.answer.toLowerCase().includes(searchTerm)
    );
  }
  
  // Show results if we have search term or filters applied
  if (searchTerm || selectedSubject || selectedUnit || selectedChapter) {
    displaySearchResults(filteredResults, searchTerm, selectedSubject, selectedUnit, selectedChapter);
  } else {
    hideSearchResults();
  }
}

function displaySearchResults(results, searchTerm, selectedSubject, selectedUnit, selectedChapter) {
  const searchResults = document.getElementById('searchResults');
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  const searchResultsTitle = document.getElementById('searchResultsTitle');
  
  // Update title
  let titleText = `Found ${results.length} flashcard${results.length !== 1 ? 's' : ''}`;
  if (searchTerm) {
    titleText += ` for "${searchTerm}"`;
  }
  if (selectedSubject || selectedUnit || selectedChapter) {
    const filters = [];
    if (selectedSubject) filters.push(subjectData[selectedSubject]?.name || selectedSubject);
    if (selectedUnit) filters.push(`Unit ${parseInt(selectedUnit) + 1}`);
    if (selectedChapter) filters.push(`Chapter ${parseInt(selectedChapter) + 1}`);
    titleText += ` in ${filters.join(' → ')}`;
  }
  searchResultsTitle.textContent = titleText;
  
  // Clear previous results
  searchResultsGrid.innerHTML = '';
  
  if (results.length === 0) {
    searchResultsGrid.innerHTML = `
      <div style="text-align: center; color: #CBD5E0; padding: 40px;">
        <h3>No flashcards found</h3>
        <p>Try adjusting your search terms or filters</p>
      </div>
    `;
  } else {
    results.forEach((card, index) => {
      const flashcardDiv = document.createElement('div');
      flashcardDiv.className = 'flashcard';
      flashcardDiv.innerHTML = `
        <div class="flashcard-flip-container">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-content">${highlightSearchTerm(card.question, searchTerm)}</div>
              <div class="click-message">Click to reveal answer</div>
            </div>
            <div class="flashcard-back">
              <div class="flashcard-content">${highlightSearchTerm(card.answer, searchTerm)}</div>
            </div>
          </div>
        </div>
      `;
      
      // Add flip functionality
      flashcardDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        flashcardDiv.classList.toggle('flipped');
      });

      // Force white background for search result flashcards (light theme)
      const flashcardFront = flashcardDiv.querySelector('.flashcard-front');
      const flashcardBack = flashcardDiv.querySelector('.flashcard-back');
      if (flashcardFront) {
        flashcardFront.style.setProperty('background-color', '#FFFFFF', 'important');
        flashcardFront.style.setProperty('background', '#FFFFFF', 'important');
      }
      if (flashcardBack) {
        flashcardBack.style.setProperty('background-color', '#FFFFFF', 'important');
        flashcardBack.style.setProperty('background', '#FFFFFF', 'important');
      }
      
      searchResultsGrid.appendChild(flashcardDiv);
    });
  }
  
  // Show search results
  searchResults.style.display = 'block';
  
  // Hide subject icons when showing search results
  document.getElementById('subjectIconsContainer').style.display = 'none';
  document.querySelector('.choose-subject-text').style.display = 'none';
}

function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background: #60A5FA; color: white; padding: 1px 3px; border-radius: 3px;">$1</mark>');
}

function navigateToChapter(subjectKey, unitKey, chapterKey) {
  // First show subject units
  const subject = subjectData[subjectKey];
  showSubjectUnitsScreen(subjectKey, subject.name, subject.description);
  
  // Then show unit chapters
  setTimeout(() => {
    const unit = subjectData[subjectKey].units[unitKey];
    showUnitChaptersScreen(unitKey, unit.name);
    
    // Finally show chapter flashcards
    setTimeout(() => {
      const chapterName = subjectData[subjectKey].units[unitKey].chapters[chapterKey].title;
      showChapterFlashcards(subjectKey, unitKey, chapterKey, chapterName);
    }, 300);
  }, 300);
}

function hideSearchResults() {
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('subjectIconsContainer').style.display = 'grid';
  document.querySelector('.choose-subject-text').style.display = 'block';
}

function showClearButton() {
  document.getElementById('clearButton').style.display = 'block';
}

function hideClearButton() {
  document.getElementById('clearButton').style.display = 'none';
}

function checkClearButtonVisibility() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  const selectedSubject = document.getElementById('subjectFilter').value;
  const selectedUnit = document.getElementById('unitFilter').value;
  const selectedChapter = document.getElementById('chapterFilter').value;
  
  // Show clear button if any field has a value
  if (searchTerm || selectedSubject || selectedUnit || selectedChapter) {
    showClearButton();
  } else {
    hideClearButton();
  }
}

function handleClear() {
  // Clear search input
  document.getElementById('searchInput').value = '';
  
  // Reset all filter dropdowns
  document.getElementById('subjectFilter').value = '';
  document.getElementById('unitFilter').value = '';
  document.getElementById('chapterFilter').value = '';
  
  // Reset unit and chapter filters to default state
  resetUnitFilter();
  resetChapterFilter();
  
  // Hide search results
  hideSearchResults();
  
  // Hide clear button
  hideClearButton();
  
  // Show landing page (in case user is on a different screen)
  showLandingPage();
}


// Quiz functionality
function startQuiz() {
  // Debug: Log current navigation state
  console.log('Starting quiz with navigation state:', {
    currentSubject,
    currentUnit,
    currentChapter,
    currentSubjectName,
    currentUnitName,
    currentChapterTitle
  });
  
  // Get questions for current chapter - prioritize textbook questions, fallback to flashcards
  const unitKey = currentUnit.toString();
  const chapterKey = currentChapter.toString();
  
  // Try to get textbook quiz questions first
  let questions = [];
  const textbookChapter = textbookQuizData[currentSubject]?.[unitKey]?.[chapterKey];
  if (textbookChapter && textbookChapter.textbook_questions) {
    questions = textbookChapter.textbook_questions.map(q => ({
      question: q.question,
      answer: q.answer,
      source: 'textbook',
      type: q.type,
      bold_concept: q.bold_concept,
      exam_frequency: q.ib_exam_frequency
    }));
    console.log('Using textbook questions for quiz:', questions.length);
  }
  
  // If no textbook questions, fallback to flashcards
  if (questions.length === 0) {
    const flashcards = chapterFlashcards[currentSubject]?.[unitKey]?.[chapterKey] || [];
    questions = flashcards.map(f => ({
      question: f.question,
      answer: f.answer,
      source: 'flashcard'
    }));
    console.log('Using flashcard questions for quiz:', questions.length);
  }
  
  if (questions.length === 0) {
    alert('No quiz questions available for this chapter.');
    return;
  }
  
  // Initialize quiz
  quizFlashcards = [...questions]; // Copy array to avoid modifying original
  currentQuestionIndex = 0;
  quizScore = 0;
  totalQuestions = quizFlashcards.length;
  quizAnswers = []; // Initialize empty array to store all answers
  
  // Shuffle flashcards for variety
  for (let i = quizFlashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quizFlashcards[i], quizFlashcards[j]] = [quizFlashcards[j], quizFlashcards[i]];
  }
  
  // Update quiz page elements
  document.getElementById('quizSubjectBreadcrumbLink').textContent = currentSubjectName;
  document.getElementById('quizUnitBreadcrumbLink').textContent = currentUnitName;
  document.getElementById('quizChapterBreadcrumbLink').textContent = currentChapterTitle;
  document.getElementById('quizPageTitle').textContent = `Quiz: ${currentChapterTitle}`;
  
  showScreenWithTransition('quizScreen');
  displayCurrentQuestion();
}

function displayCurrentQuestion() {
  if (currentQuestionIndex >= totalQuestions) {
    showQuizResults();
    return;
  }
  
  // Restore quiz question structure if it was replaced by results
  const quizQuestionCard = document.getElementById('quizQuestionCard');
  if (!document.getElementById('quizQuestion')) {
    quizQuestionCard.innerHTML = `
      <div class="quiz-question" id="quizQuestion">Loading question...</div>
      <input type="text" class="quiz-answer-input" id="quizAnswerInput" placeholder="Type your answer here..." />
      <div class="quiz-buttons">
        <button class="quiz-btn quiz-btn-secondary" id="previousQuestionButton">Previous Question</button>
        <button class="quiz-btn quiz-btn-primary" id="submitAnswerButton">Submit Answer</button>
        <button class="quiz-btn quiz-btn-secondary" id="showAnswerButton">Show Answer</button>
        <button class="quiz-btn quiz-btn-secondary" id="nextQuestionNavButton">Next Question</button>
      </div>
      <div id="quizFeedback" class="quiz-feedback" style="display: none;"></div>
    `;
    
    // Re-initialize event listeners for the restored buttons
    document.getElementById('submitAnswerButton').addEventListener('click', submitAnswer);
    document.getElementById('showAnswerButton').addEventListener('click', showAnswer);
    document.getElementById('previousQuestionButton').addEventListener('click', previousQuestion);
    document.getElementById('nextQuestionNavButton').addEventListener('click', nextQuestionNav);
    
    // Allow submitting answer with Enter key
    document.getElementById('quizAnswerInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !document.getElementById('quizAnswerInput').disabled) {
        submitAnswer();
      }
    });
    
    // Restore the external action buttons if they don't exist
    const quizContainer = document.querySelector('#quizScreen .quiz-container');
    if (!document.getElementById('nextQuestionButton')) {
      const actionButtonsDiv = document.createElement('div');
      actionButtonsDiv.className = 'quiz-buttons';
      actionButtonsDiv.innerHTML = `
        <button class="quiz-btn quiz-btn-secondary" id="nextQuestionButton" style="display: none;">Next Question</button>
        <button class="quiz-btn quiz-btn-secondary" id="finishQuizButton" style="display: none;">Finish Quiz</button>
      `;
      quizContainer.appendChild(actionButtonsDiv);
      
      // Add event listeners for these buttons
      document.getElementById('nextQuestionButton').addEventListener('click', nextQuestion);
      document.getElementById('finishQuizButton').addEventListener('click', finishQuiz);
    }
  }
  
  const question = quizFlashcards[currentQuestionIndex];
  
  // Update question display
  document.getElementById('quizQuestion').textContent = question.question;
  document.getElementById('quizAnswerInput').value = '';
  document.getElementById('quizProgressText').textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
  
  // Update progress bar
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  document.getElementById('quizProgressBar').style.width = `${progressPercent}%`;
  
  // Reset buttons and feedback
  document.getElementById('submitAnswerButton').style.display = 'inline-block';
  document.getElementById('showAnswerButton').style.display = 'inline-block';
  document.getElementById('nextQuestionButton').style.display = 'none';
  document.getElementById('finishQuizButton').style.display = 'none';
  document.getElementById('quizFeedback').style.display = 'none';
  document.getElementById('quizAnswerInput').disabled = false;
  
  // Update navigation buttons (if they exist)
  const prevButton = document.getElementById('previousQuestionButton');
  const nextNavButton = document.getElementById('nextQuestionNavButton');
  
  // Show/hide previous button
  if (prevButton) {
    if (currentQuestionIndex > 0) {
      prevButton.style.display = 'inline-block';
    } else {
      prevButton.style.display = 'none';
    }
  }
  
  // Show/hide next navigation button
  if (nextNavButton) {
    if (currentQuestionIndex < totalQuestions - 1) {
      nextNavButton.style.display = 'inline-block';
    } else {
      nextNavButton.style.display = 'none';
    }
  }
  
  // Focus on input
  document.getElementById('quizAnswerInput').focus();
}

function submitAnswer() {
  const userAnswer = document.getElementById('quizAnswerInput').value.trim();
  const correctAnswer = quizFlashcards[currentQuestionIndex].answer;
  
  if (!userAnswer) {
    alert('Please enter an answer.');
    return;
  }
  
  // Check if answer is correct using fuzzy matching
  const answerChecker = new AnswerChecker(0.8); // 80% threshold
  const result = answerChecker.checkAnswer(userAnswer, correctAnswer);
  const isCorrect = result.isCorrect;
  const similarity = result.similarity;
  
  if (isCorrect) {
    quizScore++;
  }
  
  // Record this answer for saving to Firestore
  quizAnswers.push({
    questionIndex: currentQuestionIndex,
    question: quizFlashcards[currentQuestionIndex].question,
    userAnswer: userAnswer,
    correctAnswer: correctAnswer,
    isCorrect: isCorrect,
    similarity: similarity
  });
  
  showFeedback(isCorrect, correctAnswer, false, similarity);
}

function showAnswer() {
  const correctAnswer = quizFlashcards[currentQuestionIndex].answer;
  
  // Record that user revealed the answer (marked as incorrect)
  quizAnswers.push({
    questionIndex: currentQuestionIndex,
    question: quizFlashcards[currentQuestionIndex].question,
    userAnswer: '',
    correctAnswer: correctAnswer,
    isCorrect: false,
    similarity: 0,
    revealed: true
  });
  
  showFeedback(false, correctAnswer, true, 0);
}

function showFeedback(isCorrect, correctAnswer, showAnswerClicked = false, similarity = 0) {
  const feedbackDiv = document.getElementById('quizFeedback');
  
  if (showAnswerClicked) {
    feedbackDiv.className = 'quiz-feedback quiz-feedback-incorrect';
    feedbackDiv.innerHTML = `
      <div>You chose to reveal the answer.</div>
      <div class="quiz-feedback-answer"><strong>Correct Answer:</strong> ${correctAnswer}</div>
    `;
  } else if (isCorrect) {
    feedbackDiv.className = 'quiz-feedback quiz-feedback-correct';
    feedbackDiv.innerHTML = `
      <div>✓ Correct!</div>
    `;
  } else {
    feedbackDiv.className = 'quiz-feedback quiz-feedback-incorrect';
    feedbackDiv.innerHTML = `
      <div>✗ Incorrect</div>
      <div class="quiz-feedback-answer"><strong>Correct Answer:</strong> ${correctAnswer}</div>
    `;
  }
  
  feedbackDiv.style.display = 'block';
  
  // Disable input and hide submission buttons
  document.getElementById('quizAnswerInput').disabled = true;
  document.getElementById('submitAnswerButton').style.display = 'none';
  document.getElementById('showAnswerButton').style.display = 'none';
  
  // Show next/finish button
  if (currentQuestionIndex + 1 >= totalQuestions) {
    document.getElementById('finishQuizButton').style.display = 'inline-block';
  } else {
    document.getElementById('nextQuestionButton').style.display = 'inline-block';
  }
}

function nextQuestion() {
  currentQuestionIndex++;
  displayCurrentQuestion();
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayCurrentQuestion();
  }
}

function nextQuestionNav() {
  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    displayCurrentQuestion();
  }
}

function finishQuiz() {
  showQuizResults();
}

async function showQuizResults() {
  const percentage = Math.round((quizScore / totalQuestions) * 100);
  const quizQuestionCard = document.getElementById('quizQuestionCard');
  
  // Save quiz attempt to Firestore if user is authenticated
  if (window.currentUser) {
    try {
      const { saveQuizAttempt } = await import('./services/databaseService.js');
      
      await saveQuizAttempt(
        window.currentUser.uid,
        currentSubject,
        parseInt(currentUnit),
        parseInt(currentChapter),
        quizAnswers,
        quizScore,
        totalQuestions
      );
      console.log('Quiz attempt saved successfully');
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  }
  
  quizQuestionCard.innerHTML = `
    <div class="quiz-score-summary">
      <div class="quiz-score">${quizScore}/${totalQuestions}</div>
      <div class="quiz-score-text">You scored ${percentage}% on this quiz!</div>
      <div class="quiz-buttons">
        <button class="quiz-btn quiz-btn-primary" onclick="retryQuiz()">Try Again</button>
        <button class="quiz-btn quiz-btn-secondary" onclick="backToChapter()">Back to Chapter</button>
      </div>
    </div>
  `;
  
  // Hide navigation buttons
  document.getElementById('nextQuestionButton').style.display = 'none';
  document.getElementById('finishQuizButton').style.display = 'none';
}

function retryQuiz() {
  startQuiz();
}

function backToChapter() {
  showChapterFlashcards(currentSubject, currentUnit, currentChapter, currentChapterTitle);
}

// Initialize the app
window.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded - Starting initialization');

  await loadChapterFlashcardsFromFirestore();
  await loadTextbookQuizFromFirestore();
  await loadSubjectsFromFirestore();
  console.log('About to create subject icons');
  createSubjectIcons();

  // Only show landing page on first load if no screen is currently visible
  // This prevents auto-redirecting to landing page when navigating
  // Delay this check to allow any pending navigation to complete
  setTimeout(() => {
    const screens = document.querySelectorAll('.screen');
    let currentlyVisibleScreen = null;
    screens.forEach(screen => {
      const displayValue = screen.style.display;
      // A screen is visible if it has display: flex or display: block (not 'none' and not empty)
      const isVisible = displayValue === 'flex' || displayValue === 'block';
      console.log('Screen:', screen.id, 'display:', `"${displayValue}"`, 'isVisible:', isVisible);
      if (isVisible) {
        currentlyVisibleScreen = screen;
      }
    });
    console.log('About to show landing page, hasNavigated:', hasNavigated, 'currentlyVisibleScreen:', currentlyVisibleScreen);

    if (!hasNavigated && !currentlyVisibleScreen && (!window.location.hash || window.location.hash === '#' || window.location.hash === '#home')) {
      showLandingPage();
    }
  }, 100); // Small delay to let any pending navigation complete

  // Initialize search and filter functionality
  initializeSearchAndFilter();

  // Initialize quiz functionality
  initializeQuizFunctionality();

  // Initialize FAQ accordion
  initializeFAQ();

  // Initialize testimonials carousel
  // initializeTestimonialsCarousel(); // Disabled - showing all testimonials in grid

  console.log('Initialization complete');

  // Initialize authentication
  if (typeof AuthModal !== 'undefined') {
    authModal = new AuthModal();
  }
});

// FAQ Accordion Functionality
function initializeFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // Toggle current item
      item.classList.toggle('active');

      // Optional: Close other items (uncomment to enable)
      // faqItems.forEach(otherItem => {
      //   if (otherItem !== item) {
      //     otherItem.classList.remove('active');
      //   }
      // });
    });
  });
}

// Testimonials Carousel Functionality
function initializeTestimonialsCarousel() {
  let currentPage = 1;
  const totalPages = 3;

  const prevButton = document.querySelector('.testimonials-prev');
  const nextButton = document.querySelector('.testimonials-next');
  const paginationDots = document.querySelectorAll('.testimonials-pagination .pagination-dot');

  function showPage(pageNumber) {
    // Hide all testimonial cards
    const allCards = document.querySelectorAll('.testimonial-card');
    allCards.forEach(card => {
      card.style.display = 'none';
    });

    // Show cards for current page
    const currentCards = document.querySelectorAll(`.testimonial-card[data-page="${pageNumber}"]`);
    currentCards.forEach(card => {
      card.style.display = 'block';
    });

    // Update pagination dots
    paginationDots.forEach((dot, index) => {
      if (index + 1 === pageNumber) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update button states
    if (prevButton) prevButton.disabled = (pageNumber === 1);
    if (nextButton) nextButton.disabled = (pageNumber === totalPages);

    currentPage = pageNumber;
  }

  // Previous button click handler
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        showPage(currentPage - 1);
      }
    });
  }

  // Next button click handler
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        showPage(currentPage + 1);
      }
    });
  }

  // Pagination dot click handlers
  paginationDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showPage(index + 1);
    });
  });

  // Initialize with page 1
  showPage(1);
}

function initializeQuizFunctionality() {
  // Add event listener for start quiz button
  const startQuizButton = document.getElementById('startQuizButton');
  if (startQuizButton) {
    startQuizButton.addEventListener('click', startQuiz);
  }

  // Add event listeners for quiz buttons
  const submitAnswerButton = document.getElementById('submitAnswerButton');
  const showAnswerButton = document.getElementById('showAnswerButton');
  const nextQuestionButton = document.getElementById('nextQuestionButton');
  const finishQuizButton = document.getElementById('finishQuizButton');
  const previousQuestionButton = document.getElementById('previousQuestionButton');
  const nextQuestionNavButton = document.getElementById('nextQuestionNavButton');

  if (submitAnswerButton) {
    submitAnswerButton.addEventListener('click', submitAnswer);
  }

  if (showAnswerButton) {
    showAnswerButton.addEventListener('click', showAnswer);
  }

  if (nextQuestionButton) {
    nextQuestionButton.addEventListener('click', nextQuestion);
  }

  if (finishQuizButton) {
    finishQuizButton.addEventListener('click', finishQuiz);
  }

  if (previousQuestionButton) {
    previousQuestionButton.addEventListener('click', previousQuestion);
  }

  if (nextQuestionNavButton) {
    nextQuestionNavButton.addEventListener('click', nextQuestionNav);
  }

  // Allow submitting answer with Enter key
  const quizAnswerInput = document.getElementById('quizAnswerInput');
  if (quizAnswerInput) {
    quizAnswerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !document.getElementById('quizAnswerInput').disabled) {
        submitAnswer();
      }
    });
  }
}

// ========== NEW RESOURCE NAVIGATION FUNCTIONS ==========

// Flashcards Landing (shows available subjects)
function showFlashcardsLanding() {
  loadFlashcardsSubjects();
  showScreenWithTransition('flashcardsLanding');
}

async function loadFlashcardsSubjects() {
  const grid = document.getElementById('flashcardsSubjectsGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">Loading flashcards...</div>';

  try {
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs, query } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const flashcardsSnapshot = await getDocs(collection(db, 'flashcards'));
    const subjectsWithFlashcards = new Set();

    flashcardsSnapshot.forEach(doc => {
      const flashcard = doc.data();
      if (flashcard.subjectKey) {
        subjectsWithFlashcards.add(flashcard.subjectKey);
      }
    });

    grid.innerHTML = '';

    subjectsWithFlashcards.forEach(subjectKey => {
      const subject = subjectData[subjectKey];
      const subjectName = subject ? subject.name : subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
      const subjectIcon = subject ? subject.icon : '📝';
      const subjectDesc = subject ? subject.description : 'View available flashcards';

      const subjectButton = document.createElement('div');
      subjectButton.className = 'resource-subject-card';
      subjectButton.onclick = () => {
        showSubjectUnitsScreen(subjectKey, subjectName, subjectDesc);
      };

      subjectButton.innerHTML = `
        <div class="resource-card-icon">${subjectIcon}</div>
        <h3 class="resource-card-title">${subjectName}</h3>
        <p class="resource-card-description">${subjectDesc}</p>
      `;

      grid.appendChild(subjectButton);
    });

  } catch (error) {
    console.error('Error loading flashcards subjects:', error);
    grid.innerHTML = '<div style="text-align: center; color: #ef4444;">Error loading flashcards.</div>';
  }
}

// Books Landing (shows available subjects with books)
function showBooksLanding() {
  loadBooksSubjects();
  showScreenWithTransition('booksLanding');
}

async function loadBooksSubjects() {
  const grid = document.getElementById('booksSubjectsGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">Loading books...</div>';

  try {
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs, query } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const booksSnapshot = await getDocs(collection(db, 'books'));
    const subjectsWithBooks = new Set();

    booksSnapshot.forEach(doc => {
      const book = doc.data();
      if (book.subject) {
        subjectsWithBooks.add(book.subject);
      }
    });

    grid.innerHTML = '';

    subjectsWithBooks.forEach(subjectKey => {
      const subject = subjectData[subjectKey];
      const subjectName = subject ? subject.name : subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
      const subjectIcon = subject ? subject.icon : '📚';
      const subjectDesc = subject ? subject.description : 'View available books';

      const subjectButton = document.createElement('div');
      subjectButton.className = 'resource-subject-card';
      subjectButton.onclick = () => {
        showBooksList(subjectKey, subjectName);
      };

      subjectButton.innerHTML = `
        <div class="resource-card-icon">${subjectIcon}</div>
        <h3 class="resource-card-title">${subjectName}</h3>
        <p class="resource-card-description">${subjectDesc}</p>
      `;

      grid.appendChild(subjectButton);
    });

    if (subjectsWithBooks.size === 0) {
      grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">No books available yet.</div>';
    }
  } catch (error) {
    console.error('Error loading books subjects:', error);
    grid.innerHTML = '<div style="text-align: center; color: #ef4444;">Error loading books.</div>';
  }
}

// Show books list for a specific subject
async function showBooksList(subjectKey, subjectName) {
  document.getElementById('booksSubjectBreadcrumb').textContent = subjectName;
  document.getElementById('booksListTitle').textContent = `${subjectName} - Books`;

  const grid = document.getElementById('booksListGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">Loading books...</div>';

  try {
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const booksQuery = query(collection(db, 'books'), where('subject', '==', subjectKey));
    const booksSnapshot = await getDocs(booksQuery);

    grid.innerHTML = '';

    booksSnapshot.forEach((doc, index) => {
      const book = doc.data();

      const bookCard = document.createElement('div');
      bookCard.className = 'resource-item-card';
      bookCard.onclick = () => {
        window.open(book.downloadUrl, '_blank');
      };

      bookCard.innerHTML = `
        <div class="resource-item-icon">📖</div>
        <h4 class="resource-item-title">${book.title}</h4>
        <p class="resource-item-meta">${book.fileType ? book.fileType.toUpperCase() : 'PDF'}</p>
      `;

      grid.appendChild(bookCard);
    });

    if (booksSnapshot.empty) {
      grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">No books found for this subject.</div>';
    }
  } catch (error) {
    console.error('Error loading books:', error);
    grid.innerHTML = '<div style="text-align: center; color: #ef4444;">Error loading books.</div>';
  }

  showScreenWithTransition('booksListScreen');
}

// Quizzes Landing (shows available subjects with quizzes)
function showQuizzesLanding() {
  loadQuizzesSubjects();
  showScreenWithTransition('quizzesLanding');
}

async function loadQuizzesSubjects() {
  const grid = document.getElementById('quizzesSubjectsGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">Loading quizzes...</div>';

  try {
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs, query } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
    const subjectsWithQuizzes = new Set();

    quizzesSnapshot.forEach(doc => {
      const quiz = doc.data();
      if (quiz.subjectKey) {
        subjectsWithQuizzes.add(quiz.subjectKey);
      }
    });

    grid.innerHTML = '';

    if (subjectsWithQuizzes.size === 0) {
      grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">No quizzes available yet.</div>';
      return;
    }

    subjectsWithQuizzes.forEach(subjectKey => {
      const subject = subjectData[subjectKey];
      const subjectName = subject ? subject.name : subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
      const subjectIcon = subject ? subject.icon : '📝';
      const subjectDesc = subject ? subject.description : 'View available quizzes';

      const subjectButton = document.createElement('div');
      subjectButton.className = 'resource-subject-card';
      subjectButton.onclick = () => {
        showQuizzesList(subjectKey, subjectName);
      };

      subjectButton.innerHTML = `
        <div class="resource-card-icon">${subjectIcon}</div>
        <h3 class="resource-card-title">${subjectName}</h3>
        <p class="resource-card-description">${subjectDesc}</p>
      `;

      grid.appendChild(subjectButton);
    });

  } catch (error) {
    console.error('Error loading quizzes subjects:', error);
    grid.innerHTML = '<div style="text-align: center; color: #ef4444;">Error loading quizzes.</div>';
  }
}

// Show quizzes list for a specific subject
function showQuizzesList(subjectKey, subjectName) {
  document.getElementById('quizzesSubjectBreadcrumb').textContent = subjectName;
  document.getElementById('quizzesListTitle').textContent = `${subjectName} - Quizzes`;

  const grid = document.getElementById('quizzesListGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const subjectQuizzes = textbookQuizData[subjectKey] || {};
  const quizChapters = [];

  // Gather all chapters with quizzes
  Object.keys(subjectQuizzes).forEach(unitKey => {
    const unit = subjectQuizzes[unitKey];
    Object.keys(unit).forEach(chapterKey => {
      const chapter = unit[chapterKey];
      if (chapter && chapter.textbook_questions && chapter.textbook_questions.length > 0) {
        const unitInfo = subjectData[subjectKey]?.units?.[unitKey];
        const chapterInfo = unitInfo?.chapters?.[chapterKey];

        quizChapters.push({
          unitKey,
          chapterKey,
          unitName: unitInfo?.name || `Unit ${parseInt(unitKey) + 1}`,
          chapterTitle: chapterInfo?.title || `Chapter ${parseInt(chapterKey) + 1}`,
          questionCount: chapter.textbook_questions.length
        });
      }
    });
  });

  quizChapters.forEach((quiz, index) => {
    const quizCard = document.createElement('div');
    quizCard.className = 'resource-item-card';
    quizCard.onclick = () => {
      // Set navigation state and start quiz
      currentSubject = subjectKey;
      currentSubjectName = subjectName;
      currentUnit = parseInt(quiz.unitKey);
      currentUnitName = quiz.unitName;
      currentChapter = parseInt(quiz.chapterKey);
      currentChapterTitle = quiz.chapterTitle;
      startQuiz();
    };

    quizCard.innerHTML = `
      <div class="resource-item-icon">📝</div>
      <h4 class="resource-item-title">${quiz.chapterTitle}</h4>
      <p class="resource-item-meta">${quiz.unitName} • ${quiz.questionCount} questions</p>
    `;

    grid.appendChild(quizCard);
  });

  if (quizChapters.length === 0) {
    grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">No quizzes found for this subject.</div>';
  }

  showScreenWithTransition('quizzesListScreen');
}

// Practice Papers Landing (shows available subjects with papers)
function showPracticePapersLanding() {
  loadPracticePapersSubjects();
  showScreenWithTransition('practicePapersLanding');
}

async function loadPracticePapersSubjects() {
  const grid = document.getElementById('practicePapersSubjectsGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">Loading practice papers...</div>';

  try {
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const papersSnapshot = await getDocs(collection(db, 'practice_papers'));
    const subjectsWithPapers = new Set();

    papersSnapshot.forEach(doc => {
      const paper = doc.data();
      if (paper.subject) {
        subjectsWithPapers.add(paper.subject);
      }
    });

    grid.innerHTML = '';

    subjectsWithPapers.forEach(subjectKey => {
      const subject = subjectData[subjectKey];
      const subjectName = subject ? subject.name : subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
      const subjectIcon = subject ? subject.icon : '📄';
      const subjectDesc = subject ? subject.description : 'View past papers';

      const subjectButton = document.createElement('div');
      subjectButton.className = 'resource-subject-card';
      subjectButton.onclick = () => {
        showPracticePapersList(subjectKey, subjectName);
      };

      subjectButton.innerHTML = `
        <div class="resource-card-icon">${subjectIcon}</div>
        <h3 class="resource-card-title">${subjectName}</h3>
        <p class="resource-card-description">${subjectDesc}</p>
      `;

      grid.appendChild(subjectButton);
    });

    if (subjectsWithPapers.size === 0) {
      grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">No practice papers available yet.</div>';
    }
  } catch (error) {
    console.error('Error loading practice papers subjects:', error);
    grid.innerHTML = '<div style="text-align: center; color: #ef4444;">Error loading practice papers.</div>';
  }
}

// Show practice papers list for a specific subject
async function showPracticePapersList(subjectKey, subjectName) {
  document.getElementById('practicePapersSubjectBreadcrumb').textContent = subjectName;
  document.getElementById('practicePapersListTitle').textContent = `${subjectName} - Practice Papers`;

  const grid = document.getElementById('practicePapersListGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">Loading practice papers...</div>';

  try {
    const { db } = await import('./firebase/config.js');
    const { collection, getDocs, query, where, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const papersQuery = query(
      collection(db, 'practice_papers'),
      where('subject', '==', subjectKey)
    );
    const papersSnapshot = await getDocs(papersQuery);

    grid.innerHTML = '';

    papersSnapshot.forEach((doc, index) => {
      const paper = doc.data();

      const paperCard = document.createElement('div');
      paperCard.className = 'resource-item-card';
      paperCard.onclick = () => {
        window.open(paper.downloadUrl, '_blank');
      };

      const metadata = [];
      if (paper.level) metadata.push(paper.level);
      if (paper.year) metadata.push(paper.year);
      if (paper.session) metadata.push(paper.session);
      if (paper.paperNumber) metadata.push(`Paper ${paper.paperNumber}`);
      if (paper.isMarkscheme) metadata.push('Markscheme');

      paperCard.innerHTML = `
        <div class="resource-item-icon">📄</div>
        <h4 class="resource-item-title">${paper.title}</h4>
        <p class="resource-item-meta">${metadata.join(' • ')}</p>
      `;

      grid.appendChild(paperCard);
    });

    if (papersSnapshot.empty) {
      grid.innerHTML = '<div style="text-align: center; color: #CBD5E0;">No practice papers found for this subject.</div>';
    }
  } catch (error) {
    console.error('Error loading practice papers:', error);
    grid.innerHTML = '<div style="text-align: center; color: #ef4444;">Error loading practice papers.</div>';
  }

  showScreenWithTransition('practicePapersListScreen');
}

