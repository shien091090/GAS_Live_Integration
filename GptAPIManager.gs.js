const GPT_API_KEY = "";
const GPT_API_URL = "https://api.openai.com/v1/chat/completions";

function RequestChatGPT(inputContent) {
  var data = {
    "messages": [{"role": "user", "content": inputContent}],
    "model": "gpt-3.5-turbo"
  };
  
  var options = {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + GPT_API_KEY
    },
    "payload": JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(GPT_API_URL, options);

  var result = JSON.parse(response.getContentText());
  var message = result.choices[0].message.content;

  return message
}