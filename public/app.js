
// Screen navigation
let currentSubject = '';
let currentSubjectName = '';
let currentSubjectDescription = '';
let currentUnit = '';
let currentUnitName = '';

function showScreenWithTransition(targetScreenId) {
  const currentScreen = document.querySelector('.screen:not([style*="display: none"])');
  const targetScreen = document.getElementById(targetScreenId);
  
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
    // Force slate gray background for unit cards
    unitCard.style.setProperty('background-color', '#2D3748', 'important');
    unitCard.style.setProperty('background', '#2D3748', 'important');
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
    // Force slate gray background for chapter cards
    chapterCard.style.setProperty('background-color', '#2D3748', 'important');
    chapterCard.style.setProperty('background', '#2D3748', 'important');
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
    
    // Force slate gray background for flashcard elements
    const flashcardFront = flashcardDiv.querySelector('.flashcard-front');
    const flashcardBack = flashcardDiv.querySelector('.flashcard-back');
    if (flashcardFront) {
      flashcardFront.style.setProperty('background-color', '#2D3748', 'important');
      flashcardFront.style.setProperty('background', '#2D3748', 'important');
    }
    if (flashcardBack) {
      flashcardBack.style.setProperty('background-color', '#4A5568', 'important');
      flashcardBack.style.setProperty('background', '#4A5568', 'important');
    }
    
    flashcardsGrid.appendChild(flashcardDiv);
  });
}


// Flashcard data - loaded from external JSON file
let chapterFlashcards = {};

// Function to load flashcards from JSON file
async function loadChapterFlashcardsFromJSON() {
  try {
    const response = await fetch('flashcards.json');
    if (response.ok) {
      chapterFlashcards = await response.json();
      console.log('Chapter flashcards loaded from JSON file:', chapterFlashcards);
    } else {
      console.error('Failed to load flashcards.json, response status:', response.status);
      // Fallback to empty structure
      chapterFlashcards = {};
    }
  } catch (error) {
    console.error('Error loading flashcards:', error);
    chapterFlashcards = {};
  }
}

// Subject units and chapters data - loaded from external JSON file
let subjectData = {};

// Function to load subjects from JSON file
async function loadSubjectsFromJSON() {
  try {
    const response = await fetch('subjects.json');
    if (response.ok) {
      subjectData = await response.json();
      console.log('Subject data loaded from JSON file:', subjectData);
    } else {
      console.error('Failed to load subjects.json, response status:', response.status);
      // Fallback to empty structure
      subjectData = {};
    }
  } catch (error) {
    console.error('Error loading subjects:', error);
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
    // Force slate gray background for subject cards
    subjectButton.style.setProperty('background-color', '#2D3748', 'important');
    subjectButton.style.setProperty('background', '#2D3748', 'important');
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

// Initialize the app
window.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded - Starting initialization');
  
  await loadChapterFlashcardsFromJSON();
  await loadSubjectsFromJSON();
  console.log('About to create subject icons');
  createSubjectIcons();
  console.log('About to show landing page');
  showLandingPage();
  console.log('Initialization complete');
});

