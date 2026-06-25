import { openSubjectFolder } from './MaterialsVault.js?v=2';
import { openPreviewModal } from './DocViewer.js?v=2';

let materialsData = null;

async function loadSearchData() {
    let stored = localStorage.getItem('soumaterial_materials_data_v3');
    if (stored) {
        try {
            materialsData = JSON.parse(stored);
            return;
        } catch (e) {
            console.error("Failed to parse stored materials data", e);
        }
    }
    try {
        const response = await fetch('./src/data/materials.json?v=3');
        materialsData = await response.json();
    } catch (e) {
        console.error("Search data load failed", e);
        materialsData = [];
    }
}

export function renderSearch() {
    const modalRoot = document.getElementById('modal-root');
    
    // Append search overlay if not exists
    if (!document.getElementById('search-modal')) {
        const searchDiv = document.createElement('div');
        searchDiv.id = 'search-modal';
        searchDiv.className = 'modal hidden';
        searchDiv.innerHTML = `
            <div class="modal-content search-modal-size">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="search-input" placeholder="Search subjects, units or documents..." autocomplete="off">
                    </div>
                    <button id="close-search-btn" class="close-btn">&times;</button>
                </div>
                <div id="search-results" class="search-results-list">
                    <p class="search-placeholder">Start typing to search notes...</p>
                </div>
            </div>
        `;
        modalRoot.appendChild(searchDiv);

        // Add event listeners
        document.getElementById('close-search-btn').addEventListener('click', closeSearchModal);
        
        const searchModal = document.getElementById('search-modal');
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            handleSearchQuery(e.target.value);
        });
    }
}

export async function openSearchModal() {
    renderSearch();
    await loadSearchData();
    const searchModal = document.getElementById('search-modal');
    searchModal.classList.remove('hidden');
    
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    searchInput.focus();
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p class="search-placeholder">Start typing to search notes...</p>';
}

export function closeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) {
        searchModal.classList.add('hidden');
    }
}

function handleSearchQuery(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!query.trim()) {
        resultsContainer.innerHTML = '<p class="search-placeholder">Start typing to search notes...</p>';
        return;
    }

    if (!materialsData) {
        resultsContainer.innerHTML = '<p class="search-placeholder">Loading database...</p>';
        return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const matchedSubjects = [];
    const matchedFiles = [];

    materialsData.forEach(sub => {
        // Match subjects
        const matchesSubjectName = sub.subjectName.toLowerCase().includes(cleanQuery);
        const matchesSubjectCode = sub.subjectCode.toLowerCase().includes(cleanQuery);
        
        if (matchesSubjectName || matchesSubjectCode) {
            matchedSubjects.push(sub);
        }

        // Match files/units
        sub.units.forEach(unit => {
            const matchesUnitTitle = unit.unitTitle && unit.unitTitle.toLowerCase().includes(cleanQuery);
            
            if (unit.files && unit.files.length > 0) {
                unit.files.forEach(file => {
                    const matchesFileName = file.fileName.toLowerCase().includes(cleanQuery);
                    const matchesDisplayName = file.displayName.toLowerCase().includes(cleanQuery);

                    if (matchesFileName || matchesDisplayName || matchesUnitTitle) {
                        matchedFiles.push({
                            subject: sub,
                            unit: unit,
                            file: file
                        });
                    }
                });
            }
        });
    });

    renderSearchResults(matchedSubjects, matchedFiles);
}

function renderSearchResults(subjects, files) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (subjects.length === 0 && files.length === 0) {
        resultsContainer.innerHTML = '<p class="search-no-results">No matches found. Try another query.</p>';
        return;
    }

    // Render matched subjects
    if (subjects.length > 0) {
        const subSec = document.createElement('div');
        subSec.className = 'search-section';
        subSec.innerHTML = `<h3>Subjects (${subjects.length})</h3>`;
        
        const list = document.createElement('div');
        list.className = 'search-results-subgrid';
        
        subjects.forEach(sub => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="result-details">
                    <span class="result-icon">📁</span>
                    <div>
                        <h4>${sub.subjectName}</h4>
                        <p>Code: ${sub.subjectCode} • Semester ${sub.semester}</p>
                    </div>
                </div>
            `;
            item.addEventListener('click', () => {
                closeSearchModal();
                // We open the subject folder. We need to pass the full materials database.
                openSubjectFolder(materialsData, sub.subjectCode);
            });
            list.appendChild(item);
        });
        subSec.appendChild(list);
        resultsContainer.appendChild(subSec);
    }

    // Render matched files
    if (files.length > 0) {
        const fileSec = document.createElement('div');
        fileSec.className = 'search-section';
        fileSec.innerHTML = `<h3>Documents & Syllabus (${files.length})</h3>`;
        
        const list = document.createElement('div');
        list.className = 'search-results-subgrid';
        
        files.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="result-details">
                    <span class="result-icon">📄</span>
                    <div>
                        <h4>${item.file.displayName}</h4>
                        <p>${item.subject.subjectName} • Unit ${item.unit.unitNumber} (${item.file.fileSize})</p>
                    </div>
                </div>
            `;
            resultItem.addEventListener('click', () => {
                closeSearchModal();
                openPreviewModal(item.file.fileName, item.file.fileId, !!item.file.isUserUploaded);
            });
            list.appendChild(resultItem);
        });
        fileSec.appendChild(list);
        resultsContainer.appendChild(fileSec);
    }
}
