// Content script - Runs on web pages
console.log('Chrome Extension content script yüklendi');

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'buttonClicked') {
    console.log('Butona tıklandı!');
    // Sayfada işlem yap
    sendResponse({status: 'received'});
  }
  return true;
});
