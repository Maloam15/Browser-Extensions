chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getText") {
      sendResponse({ text: window.getSelection().toString() });
    }
  });
  