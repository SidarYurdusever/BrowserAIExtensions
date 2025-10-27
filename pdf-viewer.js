// PDF Viewer Script
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pageNumInput = document.getElementById('page-num');
const pageCountSpan = document.getElementById('page-count');
const zoomLevelSpan = document.getElementById('zoom-level');

// Get PDF URL from query parameter
const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = urlParams.get('file');

if (!pdfUrl) {
  document.querySelector('.loading').textContent = 'PDF dosyası bulunamadı!';
}

// Render the page
function renderPage(num) {
  pageRendering = true;
  
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    const renderTask = page.render(renderContext);

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
      
      // Enable text selection
      return page.getTextContent();
    }).then(function(textContent) {
      // Create text layer for selection
      const textLayer = document.createElement('div');
      textLayer.style.position = 'absolute';
      textLayer.style.left = canvas.offsetLeft + 'px';
      textLayer.style.top = canvas.offsetTop + 'px';
      textLayer.style.width = canvas.width + 'px';
      textLayer.style.height = canvas.height + 'px';
      textLayer.style.pointerEvents = 'auto';
      
      // Remove old text layer if exists
      const oldTextLayer = document.querySelector('.textLayer');
      if (oldTextLayer) oldTextLayer.remove();
      
      textLayer.className = 'textLayer';
      canvas.parentNode.appendChild(textLayer);
    });
  });

  pageNumInput.value = num;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

function onZoomIn() {
  scale += 0.25;
  zoomLevelSpan.textContent = Math.round(scale * 100) + '%';
  queueRenderPage(pageNum);
}

function onZoomOut() {
  if (scale <= 0.5) return;
  scale -= 0.25;
  zoomLevelSpan.textContent = Math.round(scale * 100) + '%';
  queueRenderPage(pageNum);
}

function onPageNumChange() {
  const num = parseInt(pageNumInput.value);
  if (num > 0 && num <= pdfDoc.numPages) {
    pageNum = num;
    queueRenderPage(pageNum);
  } else {
    pageNumInput.value = pageNum;
  }
}

// Event listeners
document.getElementById('prev-page').addEventListener('click', onPrevPage);
document.getElementById('next-page').addEventListener('click', onNextPage);
document.getElementById('zoom-in').addEventListener('click', onZoomIn);
document.getElementById('zoom-out').addEventListener('click', onZoomOut);
pageNumInput.addEventListener('change', onPageNumChange);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') onPrevPage();
  if (e.key === 'ArrowRight') onNextPage();
  if (e.key === '+' || e.key === '=') onZoomIn();
  if (e.key === '-') onZoomOut();
});

// Load PDF
if (pdfUrl) {
  pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    pageCountSpan.textContent = '/ ' + pdfDoc.numPages;
    document.querySelector('.loading').style.display = 'none';
    
    // Initial page render
    renderPage(pageNum);
  }).catch(function(error) {
    console.error('PDF yükleme hatası:', error);
    document.querySelector('.loading').textContent = 'PDF yüklenemedi: ' + error.message;
  });
}
