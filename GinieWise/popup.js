document.getElementById('checkButton').addEventListener('click', function() {
    let inputText = document.getElementById('inputText').value;
  
    if (!inputText.trim()) {
      document.getElementById('outputText').value = '';
      document.getElementById('errorDetails').innerHTML = '<p><strong>Error:</strong> Please enter some text to check.</p>';
      return;
    }
  
    fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: inputText,
        language: 'en'
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(data => {
      console.log('API response:', JSON.stringify(data, null, 2)); 
  
      document.getElementById('errorDetails').innerHTML = '';
  
      if (!data.matches || !Array.isArray(data.matches)) {
        console.error('API response does not contain matches:', data);
        document.getElementById('outputText').value = 'Error: Unable to check text. Please try again.';
        document.getElementById('errorDetails').innerHTML = '<p><strong>Error:</strong> The API response did not contain the expected data. Please check your input and try again.</p>';
        return;
      }
  
      let correctedText = inputText;
      let errorDetails = '';
  
      data.matches.sort((a, b) => b.context.offset - a.context.offset); 
  
      data.matches.forEach(match => {
        let errorText = match.context.text.substring(match.context.offset, match.context.offset + match.context.length);
        let suggestion = match.replacements.map(rep => rep.value).join(', ');
  
        let regex = new RegExp(escapeRegExp(errorText), 'g');
        correctedText = correctedText.replace(regex, suggestion);
  
        errorDetails += `<p><strong>Issue:</strong> ${match.message}<br>
                         <strong>Context:</strong> "${match.context.text}"<br>
                         <strong>Suggestion(s):</strong> ${suggestion}</p>`;
      });
  
      if (!correctedText.trim()) {
        correctedText = 'No corrections needed.';
      }
  
      document.getElementById('outputText').value = correctedText;
      document.getElementById('errorDetails').innerHTML = errorDetails || '<p>No errors found.</p>';
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('outputText').value = 'Error: Unable to check text. Please try again.';
      document.getElementById('errorDetails').innerHTML = '<p><strong>Error:</strong> An unexpected error occurred. Please try again later.</p>';
    });
  });
  
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  