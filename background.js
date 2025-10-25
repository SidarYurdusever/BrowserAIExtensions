// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension yüklendi');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mesaj alındı:', request);
  sendResponse({status: 'success'});
  return true;
});
