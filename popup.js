document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleApiKeyBtn = document.getElementById('toggleApiKey');
  const targetLanguageSelect = document.getElementById('targetLanguage');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const statusDiv = document.getElementById('status');
  
  // Ayarları yükle
  chrome.storage.sync.get(['geminiApiKey', 'targetLanguage'], function(result) {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
    if (result.targetLanguage) {
      targetLanguageSelect.value = result.targetLanguage;
    }
  });
  
  // API key göster/gizle
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
      showStatus('Lütfen bir API key girin', 'error');
      return;
    }
    
    chrome.storage.sync.set({
      geminiApiKey: apiKey,
      targetLanguage: targetLanguage
    }, function() {
      showStatus('Ayarlar başarıyla kaydedildi!', 'success');
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
