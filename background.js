// Background service worker
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Context menu oluştur
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension yüklendi');
  
  // Ana menü
  chrome.contextMenus.create({
    id: 'aiTextAssistant',
    title: 'AI Metin Asistanı',
    contexts: ['selection']
  });
  
  // Alt menüler
  chrome.contextMenus.create({
    id: 'translate',
    parentId: 'aiTextAssistant',
    title: 'Çevir',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'mailFormat',
    parentId: 'aiTextAssistant',
    title: 'Mail Formatına Dönüştür',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'fixPunctuation',
    parentId: 'aiTextAssistant',
    title: 'Noktalama ve Yazım Düzelt',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'expand',
    parentId: 'aiTextAssistant',
    title: 'Uzat',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'shorten',
    parentId: 'aiTextAssistant',
    title: 'Kısalt',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'improve',
    parentId: 'aiTextAssistant',
    title: 'İyileştir',
    contexts: ['selection']
  });
});

// Context menu tıklama olayı
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.parentMenuItemId === 'aiTextAssistant' || info.menuItemId === 'aiTextAssistant') {
    const selectedText = info.selectionText;
    const action = info.menuItemId;
    
    // Content script'e mesaj gönder
    chrome.tabs.sendMessage(tab.id, {
      action: 'processText',
      operation: action,
      text: selectedText
    });
  }
});

// Gemini API çağrısı
async function callGeminiAPI(prompt, apiKey) {
  try {
    console.log('Gemini API çağrısı yapılıyor...');
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API hatası:', response.status, errorData);
      
      if (response.status === 404) {
        throw new Error('API endpoint bulunamadı. Model adı veya URL yanlış olabilir.');
      } else if (response.status === 403) {
        throw new Error('API key geçersiz veya yetkisiz. Lütfen API key\'inizi kontrol edin.');
      } else if (response.status === 429) {
        throw new Error('API istek limiti aşıldı. Lütfen biraz bekleyip tekrar deneyin.');
      } else {
        throw new Error(`API hatası (${response.status}): ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }
    }
    
    const data = await response.json();
    console.log('API yanıtı alındı:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('API yanıtı beklenmedik formatta.');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API hatası:', error);
    throw error;
  }
}

// Dil isimleri
const languageNames = {
  tr: 'Türkçe',
  en: 'İngilizce',
  es: 'İspanyolca',
  fr: 'Fransızca',
  de: 'Almanca',
  it: 'İtalyanca',
  pt: 'Portekizce',
  ru: 'Rusça',
  ku: 'Kürtçe',
  zza: 'Zazaca'
};

// Prompt oluşturucu
function createPrompt(operation, text, targetLanguage = 'en') {
  const prompts = {
    translate: `Aşağıdaki metni ${languageNames[targetLanguage] || 'İngilizce'}'ye çevir. Sadece çeviriyi ver, açıklama ekleme:\n\n${text}`,
    mailFormat: `Aşağıdaki metni profesyonel bir e-posta formatına dönüştür. Konu satırı, selamlama ve imza ekle:\n\n${text}`,
    fixPunctuation: `Aşağıdaki metindeki noktalama ve yazım hatalarını düzelt. Sadece düzeltilmiş metni ver:\n\n${text}`,
    expand: `Aşağıdaki metni daha detaylı ve kapsamlı hale getir, ana fikri koruyarak genişlet:\n\n${text}`,
    shorten: `Aşağıdaki metni öz bir şekilde kısalt, ana fikri koruyarak sadeleştir:\n\n${text}`,
    improve: `Aşağıdaki metni daha akıcı, anlaşılır ve profesyonel hale getir:\n\n${text}`
  };
  
  return prompts[operation] || text;
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mesaj alındı:', request);
  
  if (request.action === 'processWithAI') {
    // API key'i storage'dan al
    chrome.storage.sync.get(['geminiApiKey', 'targetLanguage'], async (result) => {
      const apiKey = result.geminiApiKey;
      // Eğer request'te targetLanguage varsa onu kullan, yoksa storage'daki veya default 'en'
      const targetLanguage = request.targetLanguage || result.targetLanguage || 'en';
      
      if (!apiKey) {
        sendResponse({ success: false, error: 'API key ayarlanmamış. Lütfen popup\'tan API key\'inizi girin.' });
        return;
      }
      
      try {
        const prompt = createPrompt(request.operation, request.text, targetLanguage);
        const aiResult = await callGeminiAPI(prompt, apiKey);
        sendResponse({ 
          success: true, 
          result: aiResult,
          detectedLanguage: targetLanguage
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    
    return true; // Asenkron response için
  }
  
  sendResponse({status: 'success'});
  return true;
});
