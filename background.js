// Background service worker
const SERVICE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Context menu oluştur
chrome.runtime.onInstalled.addListener(() => {
  console.log('Eklenti yüklendi');
  
  // Ana menü
  chrome.contextMenus.create({
    id: 'textHelper',
    title: 'Metin Yardımcısı',
    contexts: ['selection']
  });
  
  // Alt menüler
  chrome.contextMenus.create({
    id: 'translate',
    parentId: 'textHelper',
    title: 'Çevir',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'mailFormat',
    parentId: 'textHelper',
    title: 'Mail Formatına Dönüştür',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'fixPunctuation',
    parentId: 'textHelper',
    title: 'Noktalama ve Yazım Düzelt',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'expand',
    parentId: 'textHelper',
    title: 'Uzat',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'shorten',
    parentId: 'textHelper',
    title: 'Kısalt',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'improve',
    parentId: 'textHelper',
    title: 'İyileştir',
    contexts: ['selection']
  });
});

// Servis API çağrısı
async function callTextService(prompt, apiKey) {
  try {
    console.log('Servis çağrısı yapılıyor...');
    const response = await fetch(`${SERVICE_API_URL}?key=${apiKey}`, {
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
        throw new Error('API anahtarı geçersiz veya yetkisiz. Lütfen ayarlarınızı kontrol edin.');
      } else if (response.status === 429) {
        throw new Error('API istek limiti aşıldı. Lütfen biraz bekleyip tekrar deneyin.');
      } else {
        throw new Error(`API hatası (${response.status}): ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }
    }
    
    const data = await response.json();
    console.log('API yanıtı alındı');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('API yanıtı beklenmedik formatta.');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Servis hatası:', error);
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
  
  if (request.action === 'processTextRequest') {
    // API anahtarını storage'dan al
    chrome.storage.sync.get(['serviceApiKey', 'targetLanguage'], async (result) => {
      const apiKey = result.serviceApiKey;
      // Eğer request'te targetLanguage varsa onu kullan, yoksa storage'daki veya default 'en'
      const targetLanguage = request.targetLanguage || result.targetLanguage || 'en';
      
      if (!apiKey) {
        sendResponse({ success: false, error: 'API anahtarı ayarlanmamış. Lütfen ayarlardan girin.' });
        return;
      }
      
      try {
        const prompt = createPrompt(request.operation, request.text, targetLanguage);
        const resultText = await callTextService(prompt, apiKey);
        sendResponse({ 
          success: true, 
          result: resultText,
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
