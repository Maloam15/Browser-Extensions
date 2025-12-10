chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
      id: "correctText",
      title: "Correct Text",
      contexts: ["selection"]
    });
  
    chrome.contextMenus.onClicked.addListener(function(info, tab) {
      if (info.menuItemId === "correctText") {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: correctSelectedText
        });
      }
    });
  });
  
  function correctSelectedText() {
    let selectedText = window.getSelection().toString();
  
    fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: selectedText,
        language: 'en'
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('API response:', JSON.stringify(data, null, 2));
  
      if (!data.matches || !Array.isArray(data.matches)) {
        console.error('API response does not contain matches:', data);
        alert('Error: Unable to check text. Please try again.');
        return;
      }
  
      let correctedText = selectedText;
      data.matches.forEach(match => {
        correctedText = correctedText.replace(match.context.text.substr(match.context.offset, match.context.length), match.replacements[0].value);
      });
  
      navigator.clipboard.writeText(correctedText).then(function() {
        alert('Corrected text copied to clipboard');
      });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error: Unable to check text. Please try again.');
    });
  }
  