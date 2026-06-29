var HEROKU_BASE_URL = 'https://linebot-livemanagerintegration.herokuapp.com';

function testFetchCarrierInvoices() {
  var result = fetchCarrierInvoices('115-01-01', '115-06-29');
  Logger.log(JSON.stringify(result, null, 2));
}

function fetchCarrierInvoices(startDate, endDate) {
  var url = HEROKU_BASE_URL + '/carrier-invoices'
    + '?startDate=' + encodeURIComponent(startDate)
    + '&endDate=' + encodeURIComponent(endDate);

  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

  var httpCode = response.getResponseCode();
  var body = response.getContentText('UTF-8');

  Logger.log('HTTP ' + httpCode);
  Logger.log(body);

  if (httpCode !== 200) {
    throw new Error('Heroku error: ' + httpCode + ' ' + body);
  }

  var data = JSON.parse(body);

  if (data.code !== '200') {
    throw new Error('API error ' + data.code + ': ' + data.msg);
  }

  return data;
}
