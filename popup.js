document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleApiKeyBtn = document.getElementById('toggleApiKey');
  const targetLanguageSelect = document.getElementById('targetLanguage');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const statusDiv = document.getElementById('status');
  
  // Ayarları yükle (eski anahtarı da destekle)
  chrome.storage.sync.get(['serviceApiKey', 'geminiApiKey', 'targetLanguage'], function(result) {
    const apiKey = result.serviceApiKey || result.geminiApiKey || '';
    if (apiKey) {
      apiKeyInput.value = apiKey;
    }
    if (result.targetLanguage) {
      targetLanguageSelect.value = result.targetLanguage;
    }
    // Eski anahtarı yeni anahtara taşı
    if (!result.serviceApiKey && result.geminiApiKey) {
      chrome.storage.sync.set({ serviceApiKey: result.geminiApiKey });
    }
  });
  
  // API anahtarı göster/gizle
  toggleApiKeyBtn.addEventListener('click', function() {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyBtn.textContent = '👁️';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyBtn.textContent = '👁️';
    }
  });
  
  // Ayarları kaydet
  saveSettingsBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    const targetLanguage = targetLanguageSelect.value;
    
    if (!apiKey) {
      showStatus('Lütfen bir API anahtarı girin', 'error');
      return;
    }
    
    chrome.storage.sync.set({
      serviceApiKey: apiKey,
      targetLanguage: targetLanguage
    }, function() {
      showStatus('Ayarlar başarıyla kaydedildi!', 'success');
      // Eski anahtarı temizle (opsiyonel)
      chrome.storage.sync.remove('geminiApiKey');
    });
  });
  
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    
    setTimeout(function() {
      statusDiv.className = 'status';
    }, 3000);
  }
});
