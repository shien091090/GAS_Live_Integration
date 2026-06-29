var EINVOICE_API = 'https://service-mc.einvoice.nat.gov.tw/btc/cloud/api/btc502w';
var CARRIER_SHEET_NAME = '載具發票';

// Step 1: 每次登入後，從 DevTools → Cookies 複製 sid 值，執行這個函式存入
function setSidToken(sidValue) {
  PropertiesService.getScriptProperties().setProperty('CARRIER_SID', sidValue);
  Logger.log('Token 已儲存');
}

// Step 2: 執行這個函式同步發票資料到 Google Sheet
function syncCarrierInvoices() {
  var sid = PropertiesService.getScriptProperties().getProperty('CARRIER_SID');
  if (!sid) throw new Error('請先執行 setSidToken("你的sid值") 設定 token');

  var now = new Date();
  var startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  var jwt = _getSearchJWT(sid, startOfMonth, now);
  var data = _searchInvoices(sid, jwt);

  Logger.log('原始回傳: ' + JSON.stringify(data, null, 2));

  _ensureSheet();
}

function _ensureSheet() {
  var ss = SpreadsheetApp.openById('1vDFl5qpQb_oTj0xZt1PRw-39yvfbvsYZx04BN10ZQHQ');
  var sheet = ss.getSheetByName(CARRIER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CARRIER_SHEET_NAME);
    sheet.appendRow(['發票日期', '發票號碼', '商店名稱', '金額', '狀態', '同步時間']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    Logger.log('已建立「' + CARRIER_SHEET_NAME + '」分頁');
  } else {
    Logger.log('分頁已存在');
  }
  return sheet;
}

function _getSearchJWT(sid, startDate, endDate) {
  var payload = {
    cardCode: '',
    carrierId2: '',
    invoiceStatus: 'all',
    isSearchAll: 'true',
    searchStartDate: startDate.toISOString(),
    searchEndDate: endDate.toISOString()
  };

  var res = UrlFetchApp.fetch(EINVOICE_API + '/getSearchCarrierInvoiceListWT', {
    method: 'post',
    headers: _headers(sid),
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  Logger.log('getJWT HTTP: ' + res.getResponseCode());
  if (res.getResponseCode() !== 200) {
    throw new Error('取得JWT失敗 (' + res.getResponseCode() + '): ' + res.getContentText());
  }
  return res.getContentText('UTF-8');
}

function _searchInvoices(sid, jwt) {
  var res = UrlFetchApp.fetch(EINVOICE_API + '/searchCarrierInvoice', {
    method: 'post',
    headers: _headers(sid),
    payload: JSON.stringify({ token: jwt }),
    muteHttpExceptions: true
  });

  Logger.log('searchInvoice HTTP: ' + res.getResponseCode());
  if (res.getResponseCode() !== 200) {
    throw new Error('查詢失敗 (' + res.getResponseCode() + '): ' + res.getContentText());
  }
  return JSON.parse(res.getContentText('UTF-8'));
}

function _headers(sid) {
  return {
    'Authorization': 'Bearer ' + sid,
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-TW,zh;q=0.9',
    'Origin': 'https://www.einvoice.nat.gov.tw',
    'Referer': 'https://www.einvoice.nat.gov.tw/'
  };
}
