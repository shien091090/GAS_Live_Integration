//Heroku Eco dyno 閒置 30 分鐘會睡眠, 睡著時 LINE 的第一則訊息會因冷啟動逾時而遺失
//定時打一次 bot 網址讓它保持清醒
var KEEP_AWAKE_URL = 'https://linebot-livemanagerintegration.herokuapp.com/';
var KEEP_AWAKE_INTERVAL_MINUTES = 15;
var KEEP_AWAKE_HANDLER = 'PingLineBot';

//由觸發器呼叫, 回應內容不重要(根目錄回 404 也算叫醒)
function PingLineBot() {
  var response = UrlFetchApp.fetch(KEEP_AWAKE_URL, { muteHttpExceptions: true });
  console.log('PingLineBot status: ' + response.getResponseCode());
}

//在 Apps Script 編輯器手動執行一次即可開始定時叫醒
function InstallKeepAwakeTrigger() {
  UninstallKeepAwakeTrigger();
  ScriptApp.newTrigger(KEEP_AWAKE_HANDLER)
    .timeBased()
    .everyMinutes(KEEP_AWAKE_INTERVAL_MINUTES)
    .create();
  console.log('已建立定時叫醒觸發器, 每 ' + KEEP_AWAKE_INTERVAL_MINUTES + ' 分鐘一次');
}

//要取消定時叫醒時手動執行
function UninstallKeepAwakeTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if(trigger.getHandlerFunction() == KEEP_AWAKE_HANDLER)
      ScriptApp.deleteTrigger(trigger);
  });
}
