import { saveFileBlob, getFileBlob, deleteFileBlob } from '../data/db.js';
import { openPreviewModal } from './DocViewer.js?v=2';

// Helper to load materials state from localStorage (or fallback to materials.json)
async function getMaterialsData() {
    let stored = localStorage.getItem('soumaterial_materials_data');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse stored materials data", e);
        }
    }
    const response = await fetch('./src/data/materials.json');
    const materialsData = await response.json();
    localStorage.setItem('soumaterial_materials_data', JSON.stringify(materialsData));
    return materialsData;
}

function saveMaterialsData(data) {
    localStorage.setItem('soumaterial_materials_data', JSON.stringify(data));
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
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 1100;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-left: 4px solid ${type === 'success' ? 'var(--accent-blue)' : '#ef4444'};
        border-radius: var(--radius-sm);
        padding: 0.75rem 1.25rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        color: var(--text-primary);
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 250px;
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export async function loadMaterialsVault() {
    const container = document.getElementById('app-container');
    container.classList.add('fade-in');

    try {
        const materialsData = await getMaterialsData();

        let html = `
            <div style="margin-bottom: 2rem; padding-left: 0.5rem;">
                <h2 style="font-size: 1.8rem; font-weight: 700;">Subject</h2>
            </div>
            <div class="grid">`;

        materialsData.forEach(sub => {
            let totalFiles = 0;
            sub.units.forEach(u => {
                totalFiles += u.files ? u.files.length : 0;
            });

            html += `
            <div class="card folder-card" data-id="${sub.subjectCode}">
                <h3><span class="folder-icon">📁</span> ${sub.subjectName}</h3>
                <p><strong>Code:</strong> ${sub.subjectCode}</p>
                <p>${totalFiles} Materials Available</p>
            </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;

        document.querySelectorAll('.folder-card').forEach(card => {
            card.addEventListener('click', () => openSubjectFolder(materialsData, card.dataset.id));
        });

    } catch (error) {
        console.error("Error loading materials vault", error);
        container.innerHTML = `<p style="color:#ff6b6b;">Error loading materials data.</p>`;
    }
}

export function openSubjectFolder(data, subjectCode) {
    const container = document.getElementById('app-container');
    const subject = data.find(s => s.subjectCode === subjectCode);

    let html = `
        <button id="back-btn" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Modules
        </button>
        <div style="margin-bottom: 2rem; padding-left: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h2 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.25rem;">${subject.subjectName}</h2>
                <p style="color: var(--text-secondary); font-size: 0.95rem;">Code: ${subject.subjectCode} • ${subject.faculties.join(', ')}</p>
            </div>
        </div>
        <div class="chapters-container" style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    // Loop through ALL units/chapters
    subject.units.forEach(u => {
        let filesHtml = '';
        if (u.files && u.files.length > 0) {
            u.files.forEach(file => {
                const deleteBtnHtml = file.isUserUploaded 
                    ? `<button class="btn-delete" data-fileid="${file.fileId}" data-filename="${file.fileName}" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 0.5rem; font-size: 0.85rem; font-weight: 500; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid rgba(239, 68, 68, 0.2); transition: var(--transition);">Delete</button>` 
                    : '';

                filesHtml += `
                <div class="file-item chapter-card" data-filename="${file.fileName}" data-fileid="${file.fileId || ''}" data-uploaded="${!!file.isUserUploaded}" style="cursor: pointer;">
                    <div class="file-info">
                        <h4>📄 ${file.displayName}</h4>
                        <p>PDF Document • ${file.fileSize}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button class="btn-download" data-fileid="${file.fileId || ''}" data-filename="${file.fileName}" data-uploaded="${!!file.isUserUploaded}">Get</button>
                        ${deleteBtnHtml}
                    </div>
                </div>`;
            });
        } else {
            filesHtml = `
                <div style="padding: 1.25rem; text-align: center; border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); background: rgba(0,0,0,0.01);">
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">No documents uploaded for this unit yet.</p>
                </div>
            `;
        }

        html += `
        <div class="unit-section-card" style="background: var(--bg-surface); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
            <div class="unit-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
                <h3 style="font-size: 1.15rem; font-weight: 600; color: var(--text-primary);">Unit ${u.unitNumber}: ${u.unitTitle || `Module ${u.unitNumber}`}</h3>
                
                <label class="btn-primary" style="font-size: 0.85rem; padding: 0.45rem 1rem; border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; height: auto;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Upload PDF
                    <input type="file" class="unit-file-input" data-unit="${u.unitNumber}" accept=".pdf" style="display: none;">
                </label>
            </div>
            <div class="unit-files-list">
                ${filesHtml}
            </div>
        </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Attach Back Button Listener
    document.getElementById('back-btn').addEventListener('click', loadMaterialsVault);

    // Attach File List Item Event Listeners (Preview and Download/Delete triggers)
    document.querySelectorAll('.chapter-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent preview if clicking the download or delete button
            if (e.target.closest('.btn-download') || e.target.closest('.btn-delete')) {
                return;
            }
            const isUploaded = card.dataset.uploaded === 'true';
            openPreviewModal(card.dataset.filename, card.dataset.fileid, isUploaded);
        });
    });

    // Attach Download Button Listeners
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            btn.classList.add('animate-download');
            setTimeout(() => btn.classList.remove('animate-download'), 200);

            const fileId = btn.dataset.fileid;
            const fileName = btn.dataset.filename;
            const isUploaded = btn.dataset.uploaded === 'true';
            await handleDownload(fileId, fileName, isUploaded);
        });
    });

    // Attach Delete Button Listeners
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const fileId = btn.dataset.fileid;
            const fileName = btn.dataset.filename;
            if (confirm(`Are you sure you want to delete the file "${fileName}"?`)) {
                await handleDeleteFile(data, subjectCode, fileId, fileName);
            }
        });
    });

    // Attach File Upload Event Listeners for each unit
    document.querySelectorAll('.unit-file-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const unitNumber = parseInt(input.dataset.unit);
            const file = e.target.files[0];
            if (file) {
                if (file.type !== 'application/pdf') {
                    showToast('Only PDF files are supported for uploads.', 'error');
                    input.value = '';
                    return;
                }
                await handleFileUpload(data, subjectCode, unitNumber, file);
            }
        });
    });
}

// File Upload Handler
async function handleFileUpload(data, subjectCode, unitNumber, file) {
    try {
        const fileId = 'user-pdf-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        
        // 1. Save Blob to IndexedDB
        await saveFileBlob(fileId, file);

        // 2. Add metadata to state
        const subject = data.find(s => s.subjectCode === subjectCode);
        const unit = subject.units.find(u => u.unitNumber === unitNumber);
        
        if (!unit.files) {
            unit.files = [];
        }

        const newFile = {
            fileId: fileId,
            fileName: file.name,
            displayName: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
            fileSize: formatBytes(file.size),
            isUserUploaded: true,
            date: new Date().toLocaleDateString()
        };

        unit.files.push(newFile);
        unit.hasContent = true;

        // 3. Save updated data structure to localStorage
        saveMaterialsData(data);

        showToast(`"${file.name}" uploaded successfully!`);

        // 4. Re-render UI
        openSubjectFolder(data, subjectCode);

    } catch (err) {
        console.error("Upload error", err);
        showToast('Error uploading document.', 'error');
    }
}

// Download Handler
async function handleDownload(fileId, fileName, isUploaded) {
    if (isUploaded && fileId) {
        try {
            const blob = await getFileBlob(fileId);
            if (!blob) {
                showToast("File content not found in browser storage.", "error");
                return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download from IndexedDB failed", e);
            showToast("Failed to download file.", "error");
        }
    } else {
        // Preloaded file
        const a = document.createElement('a');
        a.href = `./public/docs/${fileName}`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// Delete Handler
async function handleDeleteFile(data, subjectCode, fileId, fileName) {
    try {
        // 1. Delete Blob from IndexedDB
        await deleteFileBlob(fileId);

        // 2. Remove from metadata
        const subject = data.find(s => s.subjectCode === subjectCode);
        subject.units.forEach(u => {
            if (u.files) {
                u.files = u.files.filter(f => f.fileId !== fileId);
                if (u.files.length === 0) {
                    u.hasContent = false;
                }
            }
        });

        // 3. Save back to localStorage
        saveMaterialsData(data);

        showToast(`Deleted "${fileName}" successfully.`);

        // 4. Re-render UI
        openSubjectFolder(data, subjectCode);

    } catch (err) {
        console.error("Delete error", err);
        showToast('Error deleting file.', 'error');
    }
}