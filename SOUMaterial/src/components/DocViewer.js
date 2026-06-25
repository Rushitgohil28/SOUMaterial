import { getFileBlob } from '../data/db.js';

let currentBlobUrl = null;

export function renderDocViewer() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
        <div id="pdf-modal" class="modal hidden">
            <div class="modal-content pdf-modal-size">
                <div class="modal-header">
                    <h3 id="modal-title">Document Preview</h3>
                    <button id="close-modal-btn" class="close-btn">&times;</button>
                </div>
                <div class="modal-body" style="padding: 0; height: calc(100% - 60px); position: relative;">
                    <iframe id="pdf-frame" src="" width="100%" height="100%" style="border: none;"></iframe>
                </div>
            </div>
        </div>
    `;

    document.getElementById('close-modal-btn').addEventListener('click', closePreviewModal);
    
    // Close modal on clicking outside the content window
    const pdfModal = document.getElementById('pdf-modal');
    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) {
            closePreviewModal();
        }
    });
}

export function openPreviewModal(fileName, fileId = null, isUserUploaded = false) {
    const modalTitle = document.getElementById('modal-title');
    const pdfFrame = document.getElementById('pdf-frame');
    const pdfModal = document.getElementById('pdf-modal');

    modalTitle.innerText = fileName;

    if (isUserUploaded && fileId) {
        getFileBlob(fileId).then(blob => {
            if (blob) {
                // Clear old blob URL
                if (currentBlobUrl) {
                    URL.revokeObjectURL(currentBlobUrl);
                }
                
                // If it's a PDF Blob, it will render correctly inside the iframe
                currentBlobUrl = URL.createObjectURL(blob);
                pdfFrame.src = currentBlobUrl;
            } else {
                pdfFrame.src = "";
                modalTitle.innerText = "Error: File Not Found";
            }
        }).catch(err => {
            console.error("Error retrieving preview blob", err);
            pdfFrame.src = "";
            modalTitle.innerText = "Error Loading File";
        });
    } else {
        // Preloaded static file
        const pdfPath = `./public/docs/${fileName}`;
        pdfFrame.src = pdfPath;
    }

    pdfModal.classList.remove('hidden');
}

export function closePreviewModal() {
    const pdfModal = document.getElementById('pdf-modal');
    const pdfFrame = document.getElementById('pdf-frame');
    
    pdfModal.classList.add('hidden');
    pdfFrame.src = "";

    // Free memory
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
    }
}