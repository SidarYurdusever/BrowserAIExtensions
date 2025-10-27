// Content script - Runs on web pages
console.log('AI Metin Asistanı content script yüklendi');

let aiModal = null;
let floatingButton = null;
let selectedText = '';

// Floating button oluştur
function createFloatingButton() {
  if (floatingButton) return floatingButton;
  
  const button = document.createElement('div');
  button.id = 'ai-floating-button';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  button.style.cssText = `
    position: absolute;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999998;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  });
  
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    showFloatingMenu(e.pageX, e.pageY);
  });
  
  document.body.appendChild(button);
  floatingButton = button;
  return button;
}

// Floating menu oluştur
function showFloatingMenu(x, y) {
  // Önceki menu varsa kaldır
  const existingMenu = document.getElementById('ai-floating-menu');
  if (existingMenu) existingMenu.remove();
  
  const menu = document.createElement('div');
  menu.id = 'ai-floating-menu';
  menu.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y + 10}px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    min-width: 200px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const menuItems = [
    { id: 'translate', icon: '🌍', label: 'Çevir' },
    { id: 'mailFormat', icon: '📧', label: 'Mail Formatı' },
    { id: 'fixPunctuation', icon: '✅', label: 'Noktalama Düzelt' },
    { id: 'expand', icon: '📝', label: 'Uzat' },
    { id: 'shorten', icon: '📊', label: 'Kısalt' },
    { id: 'improve', icon: '⭐', label: 'İyileştir' }
  ];
  
  menuItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.style.cssText = `
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #333;
      font-size: 14px;
    `;
    menuItem.innerHTML = `<span style="font-size: 18px;">${item.icon}</span> ${item.label}`;
    
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.background = '#f5f5f5';
    });
    
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.background = 'white';
    });
    
    menuItem.addEventListener('click', () => {
      processTextWithAI(item.id, selectedText);
      menu.remove();
      hideFloatingButton();
    });
    
    menu.appendChild(menuItem);
  });
  
  document.body.appendChild(menu);
  
  // Menü dışına tıklanırsa kapat
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && e.target !== floatingButton) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

// Floating button'u göster
function showFloatingButton(x, y, text) {
  selectedText = text;
  const button = createFloatingButton();
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
  button.style.display = 'flex';
}

// Floating button'u gizle
function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.style.display = 'none';
  }
  const menu = document.getElementById('ai-floating-menu');
  if (menu) menu.remove();
}

// Metin seçimi dinle
document.addEventListener('mouseup', (e) => {
  // Eğer floating button veya menu'ye tıklanmışsa işlem yapma
  if (e.target.closest('#ai-floating-button') || e.target.closest('#ai-floating-menu')) {
    return;
  }
  
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      showFloatingButton(
        rect.left + rect.width / 2 - 20 + window.scrollX,
        rect.bottom + 5 + window.scrollY,
        text
      );
    } else {
      // Modal açıkken butonu gizleme
      if (!document.getElementById('ai-assistant-modal') || document.getElementById('ai-assistant-modal').style.display === 'none') {
        hideFloatingButton();
      }
    }
  }, 10);
});

// Seçim kaldırıldığında butonu gizle (menu açıkken gizleme)
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const menu = document.getElementById('ai-floating-menu');
  const modal = document.getElementById('ai-assistant-modal');
  
  if (selection.toString().trim().length === 0 && !menu && (!modal || modal.style.display === 'none')) {
    setTimeout(() => {
      const currentSelection = window.getSelection();
      const currentMenu = document.getElementById('ai-floating-menu');
      const currentModal = document.getElementById('ai-assistant-modal');
      
      if (currentSelection.toString().trim().length === 0 && !currentMenu && (!currentModal || currentModal.style.display === 'none')) {
        hideFloatingButton();
      }
    }, 100);
  }
});

// AI işleme fonksiyonu
let currentOperation = null;
let currentSourceText = null;
let currentResult = null;

function processTextWithAI(operation, text, targetLanguage = null) {
  console.log('AI işlemi başlatılıyor:', operation);
  currentOperation = operation;
  currentSourceText = text;
  showModal('loading');
  
  chrome.runtime.sendMessage({
    action: 'processWithAI',
    operation: operation,
    text: text,
    targetLanguage: targetLanguage
  }, (response) => {
    if (response.success) {
      currentResult = response.result;
      showModal('success', response.result, operation, response.detectedLanguage || targetLanguage);
    } else {
      showModal('error', response.error || 'Bir hata oluştu');
    }
  });
}

// Modal oluştur
function createModal() {
  if (aiModal) return aiModal;
  
  const modal = document.createElement('div');
  modal.id = 'ai-assistant-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    background: white;
    padding: 0;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    min-width: 400px;
    max-width: 600px;
    max-height: 80vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: none;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
  `;
  
  modal.innerHTML = `
    <div id="ai-modal-header" style="
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px 12px 0 0;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      gap: 12px;
    ">
      <h3 style="margin: 0; color: white; font-size: 16px; flex: 1;">AI Metin Asistanı - Sonuç</h3>
      <div id="ai-language-selector-header" style="display: none; position: relative;">
        <button id="ai-lang-toggle" style="
          padding: 6px 10px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
        ">
          <span id="ai-current-lang" style="display: flex; align-items: center; gap: 4px;">
            <span id="ai-lang-flag" style="font-size: 14px;">🇹🇷</span>
            <span id="ai-lang-name" style="font-size: 12px;">Türkçe</span>
          </span>
          <svg id="ai-lang-arrow" width="12" height="12" viewBox="0 0 16 16" style="transition: transform 0.3s ease;">
            <path d="M4 6l4 4 4-4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div id="ai-lang-dropdown" style="
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          width: 0;
          max-height: 300px;
          overflow: hidden;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        ">
          <div style="padding: 6px; min-width: 180px;">
            <button class="ai-lang-option" data-lang="tr" data-flag="🇹🇷" data-name="Türkçe" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇹🇷</span> Türkçe</button>
            <button class="ai-lang-option" data-lang="en" data-flag="🇬🇧" data-name="İngilizce" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇬🇧</span> İngilizce</button>
            <button class="ai-lang-option" data-lang="es" data-flag="🇪🇸" data-name="İspanyolca" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇪🇸</span> İspanyolca</button>
            <button class="ai-lang-option" data-lang="fr" data-flag="🇫🇷" data-name="Fransızca" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇫🇷</span> Fransızca</button>
            <button class="ai-lang-option" data-lang="de" data-flag="🇩🇪" data-name="Almanca" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇩🇪</span> Almanca</button>
            <button class="ai-lang-option" data-lang="it" data-flag="🇮🇹" data-name="İtalyanca" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇮🇹</span> İtalyanca</button>
            <button class="ai-lang-option" data-lang="pt" data-flag="🇵🇹" data-name="Portekizce" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇵🇹</span> Portekizce</button>
            <button class="ai-lang-option" data-lang="ru" data-flag="🇷🇺" data-name="Rusça" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🇷🇺</span> Rusça</button>
            <button class="ai-lang-option" data-lang="ku" data-flag="🟥" data-name="Kürtçe" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🟥</span> Kürtçe</button>
            <button class="ai-lang-option" data-lang="zza" data-flag="🟨" data-name="Zazaca" style="
              width: 100%;
              padding: 8px 10px;
              background: transparent;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              color: #333;
            "><span>🟨</span> Zazaca</button>
          </div>
        </div>
      </div>
      <button id="ai-modal-close" style="
        background: rgba(255,255,255,0.2);
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        flex-shrink: 0;
      ">×</button>
    </div>
    <div style="padding: 20px;">
      <div id="ai-modal-loading" style="text-align: center; padding: 20px; display: none;">
        <div style="
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
        <p style="margin-top: 10px; color: #666;">AI işliyor...</p>
      </div>
      <div id="ai-modal-content" style="
        white-space: pre-wrap;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px;
        color: #333;
        line-height: 1.6;
        max-height: 400px;
        overflow-y: auto;
        display: none;
      "></div>
      <div id="ai-modal-error" style="
        padding: 15px;
        background: #fee;
        border-radius: 8px;
        color: #c33;
        display: none;
      "></div>
      <div id="ai-modal-buttons" style="margin-top: 15px; display: none; gap: 10px;">
        <button id="ai-copy-btn" style="
          padding: 8px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Kopyala</button>
      </div>
    </div>
  `;
  
  // Animasyon ekle
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(modal);
  
  // Modal sürükleme fonksiyonelliği
  const header = modal.querySelector('#ai-modal-header');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'ai-modal-close') return;
    
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
    modal.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      // Modal'ın boyutlarını ve pozisyonunu al
      const rect = modal.getBoundingClientRect();
      const modalWidth = rect.width;
      const modalHeight = rect.height;
      
      // Merkez pozisyonundan uzaklıkları hesapla
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Modal'ın yeni pozisyonu
      const newLeft = centerX + currentX - modalWidth / 2;
      const newTop = centerY + currentY - modalHeight / 2;
      
      // Ekran sınırları
      const minLeft = 10;
      const maxLeft = window.innerWidth - modalWidth - 10;
      const minTop = 10;
      const maxTop = window.innerHeight - modalHeight - 10;
      
      // Eğer sınırları aşarsa, offset'ı düzelt
      if (newLeft < minLeft) {
        currentX = minLeft - centerX + modalWidth / 2;
      } else if (newLeft > maxLeft) {
        currentX = maxLeft - centerX + modalWidth / 2;
      }
      
      if (newTop < minTop) {
        currentY = minTop - centerY + modalHeight / 2;
      } else if (newTop > maxTop) {
        currentY = maxTop - centerY + modalHeight / 2;
      }
      
      xOffset = currentX;
      yOffset = currentY;
      
      modal.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Close button
  const closeBtn = modal.querySelector('#ai-modal-close');
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(255,255,255,0.3)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(255,255,255,0.2)';
  });
  closeBtn.addEventListener('click', () => {
    // Close animation
    modal.style.opacity = '0';
    modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
      modal.style.display = 'none';
      // Pozisyonu sıfırla
      xOffset = 0;
      yOffset = 0;
    }, 200);
  });
  
  // Copy button
  modal.querySelector('#ai-copy-btn').addEventListener('click', () => {
    const content = modal.querySelector('#ai-modal-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
      const btn = modal.querySelector('#ai-copy-btn');
      const originalText = btn.textContent;
      btn.textContent = 'Kopyalandı!';
      btn.style.background = '#27ae60';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#3498db';
      }, 2000);
    });
  });
  
  // Language selector toggle
  const langToggle = modal.querySelector('#ai-lang-toggle');
  const langDropdown = modal.querySelector('#ai-lang-dropdown');
  const langArrow = modal.querySelector('#ai-lang-arrow');
  let isDropdownOpen = false;
  
  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    
    if (isDropdownOpen) {
      langDropdown.style.width = '180px';
      langDropdown.style.opacity = '1';
      langArrow.style.transform = 'rotate(180deg)';
      langToggle.style.background = 'rgba(255,255,255,0.3)';
    } else {
      langDropdown.style.width = '0';
      langDropdown.style.opacity = '0';
      langArrow.style.transform = 'rotate(0deg)';
      langToggle.style.background = 'rgba(255,255,255,0.2)';
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (isDropdownOpen && !modal.contains(e.target)) {
      isDropdownOpen = false;
      langDropdown.style.width = '0';
      langDropdown.style.opacity = '0';
      langArrow.style.transform = 'rotate(0deg)';
      langToggle.style.background = 'rgba(255,255,255,0.2)';
    }
  });
  
  // Language option hover effects
  modal.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('ai-lang-option')) {
      e.target.style.background = '#f0f0f0';
      e.target.style.transform = 'translateX(4px)';
    }
  });
  
  modal.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('ai-lang-option')) {
      e.target.style.background = 'transparent';
      e.target.style.transform = 'translateX(0)';
    }
  });
  
  // Language selection
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('ai-lang-option') || e.target.parentElement?.classList.contains('ai-lang-option')) {
      const option = e.target.classList.contains('ai-lang-option') ? e.target : e.target.parentElement;
      const targetLang = option.getAttribute('data-lang');
      const targetFlag = option.getAttribute('data-flag');
      const targetName = option.getAttribute('data-name');
      
      // Update current language display
      modal.querySelector('#ai-lang-flag').textContent = targetFlag;
      modal.querySelector('#ai-lang-name').textContent = targetName;
      
      // Close dropdown with animation
      isDropdownOpen = false;
      langDropdown.style.width = '0';
      langDropdown.style.opacity = '0';
      langArrow.style.transform = 'rotate(0deg)';
      langToggle.style.background = 'rgba(255,255,255,0.2)';
      
      // Translate to new language
      if (currentSourceText) {
        processTextWithAI('translate', currentSourceText, targetLang);
      }
    }
  });
  
  aiModal = modal;
  return modal;
}

// Modal'u göster
function showModal(type, content = '', operation = null, currentLanguage = null) {
  const modal = createModal();
  const loading = modal.querySelector('#ai-modal-loading');
  const contentDiv = modal.querySelector('#ai-modal-content');
  const errorDiv = modal.querySelector('#ai-modal-error');
  const buttons = modal.querySelector('#ai-modal-buttons');
  const languageSelectorHeader = modal.querySelector('#ai-language-selector-header');
  
  loading.style.display = 'none';
  contentDiv.style.display = 'none';
  errorDiv.style.display = 'none';
  buttons.style.display = 'none';
  languageSelectorHeader.style.display = 'none';
  
  if (type === 'loading') {
    loading.style.display = 'block';
  } else if (type === 'success') {
    contentDiv.textContent = content;
    contentDiv.style.display = 'block';
    buttons.style.display = 'flex';
    
    // Sadece çeviri işleminde dil seçiciyi göster
    if (operation === 'translate') {
      languageSelectorHeader.style.display = 'block';
      
      // Mevcut dili göster
      if (currentLanguage) {
        const langData = {
          tr: { flag: '🇹🇷', name: 'Türkçe' },
          en: { flag: '🇬🇧', name: 'İngilizce' },
          es: { flag: '🇪🇸', name: 'İspanyolca' },
          fr: { flag: '🇫🇷', name: 'Fransızca' },
          de: { flag: '🇩🇪', name: 'Almanca' },
          it: { flag: '🇮🇹', name: 'İtalyanca' },
          pt: { flag: '🇵🇹', name: 'Portekizce' },
          ru: { flag: '🇷🇺', name: 'Rusça' },
          ku: { flag: '🟥', name: 'Kürtçe' },
          zza: { flag: '🟨', name: 'Zazaca' }
        };
        
        const lang = langData[currentLanguage] || langData.en;
        modal.querySelector('#ai-lang-flag').textContent = lang.flag;
        modal.querySelector('#ai-lang-name').textContent = lang.name;
      }
    }
  } else if (type === 'error') {
    errorDiv.textContent = content;
    errorDiv.style.display = 'block';
  }
  
  modal.style.display = 'block';
  
  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}

// Listen for messages from popup or background (context menu için hala gerekli)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processText') {
    console.log('Metin işleme başlatılıyor:', request.operation);
    processTextWithAI(request.operation, request.text);
    sendResponse({status: 'received'});
  }
  return true;
});
