import { openPreviewModal } from './DocViewer.js?v=2';
import { loadHome } from './Home.js?v=2';
import { triggerProgressBar } from './Navbar.js?v=2';

// Helper to load materials state from localStorage (or fallback to materials.json)
async function getMaterialsData() {
    let stored = localStorage.getItem('soumaterial_materials_data_v3');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse stored materials data", e);
        }
    }
    const response = await fetch('./src/data/materials.json?v=3');
    const materialsData = await response.json();
    localStorage.setItem('soumaterial_materials_data_v3', JSON.stringify(materialsData));
    return materialsData;
}

// Format bytes helper
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Toast notification helper
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Subject Code Abbreviation Helper
function getSubjectCodeAbbr(name) {
    const n = name.toLowerCase();
    if (n.includes('database management')) return 'DBMS';
    if (n.includes('discrete mathematics')) return 'DM';
    if (n.includes('web development fundamentals') || n.includes('web design')) return 'WD';
    if (n.includes('data structures')) return 'DSA';
    if (n.includes('c++')) return 'OOP-C++';
    if (n.includes('java')) return 'JAVA';
    if (n.includes('operating systems')) return 'OS';
    if (n.includes('python')) return 'PYTHON';
    if (n.includes('software engineering')) return 'SE';
    if (n.includes('laravel') || n.includes('php')) return 'PHP-LV';
    if (n.includes('computer networks')) return 'CN';
    if (n.includes('android')) return 'AND-DEV';
    if (n.includes('cloud computing')) return 'CLOUD';
    if (n.includes('generative ai')) return 'G-AI';
    if (n.includes('computational analytics')) return 'COMP-A';
    if (n.includes('information security')) return 'I-SEC';
    if (n.includes('full stack')) return 'FSD-I';
    if (n.includes('internship') || n.includes('capstone')) return 'PROJ-I';
    if (n.includes('advanced web')) return 'ADV-WEB';
    if (n.includes('artificial intelligence')) return 'AI-ML';
    
    // Fallback: take first letter of each word
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 6);
}

export async function loadMaterialsVault(semesterNum = 7) {
    const container = document.getElementById('app-container');
    container.innerHTML = '<p style="text-align:center; padding: 3rem;">Loading materials...</p>';

    try {
        const materialsData = await getMaterialsData();

        // Filter subjects by selected semester
        const semesterSubjects = materialsData.filter(sub => sub.semester === semesterNum);

        const notebookColors = ['nb-blue', 'nb-green', 'nb-purple', 'nb-red', 'nb-orange', 'nb-pink', 'nb-teal', 'nb-indigo'];

        let notebooksHtml = '';

        if (semesterSubjects.length > 0) {
            semesterSubjects.forEach((sub, idx) => {
                let totalFiles = 0;
                sub.units.forEach(u => {
                    totalFiles += u.files ? u.files.length : 0;
                });

                const colorClass = notebookColors[idx % notebookColors.length];
                const abbr = getSubjectCodeAbbr(sub.subjectName);

                notebooksHtml += `
                    <div class="notebook-card ${colorClass}" data-id="${sub.subjectCode}">
                        <div class="notebook-header">
                            <span class="notebook-tag">BCA-Sem ${semesterNum}</span>
                            <h2 class="notebook-code-abbr">${abbr}</h2>
                        </div>
                        <h3 class="notebook-title">${sub.subjectName}</h3>
                        <div class="notebook-footer">
                            <span>📁 ${totalFiles} Docs</span>
                        </div>
                    </div>
                `;
            });
        } else {
            notebooksHtml = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface);">
                    <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 1rem;">No subjects loaded for Semester ${semesterNum} yet.</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Try exploring Semester 7 to see active curriculum guides!</p>
                </div>
            `;
        }

        container.innerHTML = `
            <button id="back-to-home-btn" class="back-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Semesters
            </button>
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 2.2rem; font-family: 'Outfit', sans-serif;">Semester-0${semesterNum}</h1>
                <p style="color: var(--text-secondary); font-size: 1rem;">Browse notes, files, and resources categorized by curriculum subject.</p>
            </div>
            <div class="grid-notebooks">
                ${notebooksHtml}
            </div>
        `;

        // Event listener for Back Button
        document.getElementById('back-to-home-btn').addEventListener('click', () => {
            triggerProgressBar();
            loadHome();
        });

        // Event listeners for Notebook Cards
        document.querySelectorAll('.notebook-card').forEach(card => {
            card.addEventListener('click', () => {
                triggerProgressBar();
                openSubjectFolder(materialsData, card.dataset.id);
            });
        });

    } catch (error) {
        console.error("Error loading materials vault", error);
        container.innerHTML = `<p style="color:#ef4444; text-align:center; padding: 3rem;">Error loading materials data.</p>`;
    }
}

export function openSubjectFolder(data, subjectCode) {
    const container = document.getElementById('app-container');
    const subject = data.find(s => s.subjectCode === subjectCode);

    let html = `
        <button id="back-to-sem-btn" class="back-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Semester-0${subject.semester}
        </button>
        <div class="subject-info-banner">
            <h2>${subject.subjectName}</h2>
            <div class="subject-meta">
                <span><strong>Code:</strong> ${subject.subjectCode}</span>
                ${subject.faculties && subject.faculties.length > 0 ? `<span>• <strong>Faculty:</strong> ${subject.faculties.join(', ')}</span>` : ''}
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    // Loop through ALL units/chapters
    subject.units.forEach(u => {
        let filesHtml = '';
        if (u.files && u.files.length > 0) {
            u.files.forEach(file => {
                filesHtml += `
                <div class="file-item chapter-card" data-filename="${file.fileName}" data-uploaded="false">
                    <div class="file-info">
                        <h4>📄 ${file.displayName}</h4>
                        <p>PDF Document • ${file.fileSize}</p>
                    </div>
                    <div class="file-actions">
                        <button class="btn-download" data-filename="${file.fileName}">Get</button>
                    </div>
                </div>`;
            });
        } else {
            filesHtml = `
                <div style="padding: 1.5rem; text-align: center; border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-md); background: rgba(0,0,0,0.01);">
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">No documents uploaded for this unit yet.</p>
                </div>
            `;
        }

        html += `
        <div class="unit-section-card">
            <div class="unit-header">
                <h3>Unit ${u.unitNumber}: ${u.unitTitle || `Module ${u.unitNumber}`}</h3>
            </div>
            <div class="unit-files-list">
                ${filesHtml}
            </div>
        </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Attach Back Button Listener
    document.getElementById('back-to-sem-btn').addEventListener('click', () => {
        triggerProgressBar();
        loadMaterialsVault(subject.semester);
    });

    // Attach File List Item Event Listeners (Preview and Download triggers)
    document.querySelectorAll('.chapter-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent preview if clicking the download button
            if (e.target.closest('.btn-download')) {
                return;
            }
            openPreviewModal(card.dataset.filename, null, false);
        });
    });

    // Attach Download Button Listeners
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const fileName = btn.dataset.filename;
            await handleDownload(fileName);
        });
    });
}

// Download Handler
async function handleDownload(fileName) {
    // Preloaded static file from docs directory
    const a = document.createElement('a');
    a.href = `./public/docs/${fileName}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}