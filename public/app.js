
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
      
      // Force slate gray background for search result flashcards
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
      showChapterFlashcardsScreen(chapterKey, chapterName);
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


// Initialize the app
window.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded - Starting initialization');
  
  await loadChapterFlashcardsFromJSON();
  await loadSubjectsFromJSON();
  console.log('About to create subject icons');
  createSubjectIcons();
  console.log('About to show landing page');
  showLandingPage();
  
  // Initialize search and filter functionality
  initializeSearchAndFilter();
  
  console.log('Initialization complete');
});

