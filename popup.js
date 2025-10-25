document.addEventListener('DOMContentLoaded', function() {
  const actionButton = document.getElementById('actionButton');
  
  actionButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'buttonClicked'}, function(response) {
        console.log('Response:', response);
      });
    });
  });
});
