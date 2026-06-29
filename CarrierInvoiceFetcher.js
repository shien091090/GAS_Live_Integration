var CARRIER_CONFIG = {
  cardNo: '/4GTCR89',
  cardEncrypt: '@nkse31523',
  cardType: '3J0002'
};

function testFetchCarrierInvoices() {
  var result = fetchCarrierInvoices('115-01-01', '115-06-29');
  Logger.log(JSON.stringify(result, null, 2));
}

function fetchCarrierInvoices(startDate, endDate) {
  var now = Math.floor(Date.now() / 1000);

  var payload = {
    'version': '0.5',
    'action': 'carrierInvChk',
    'cardType': CARRIER_CONFIG.cardType,
    'cardNo': CARRIER_CONFIG.cardNo,
    'cardEncrypt': CARRIER_CONFIG.cardEncrypt,
    'onlyWinningInv': 'N',
    'uuid': Utilities.getUuid(),
    'appID': 'EINV_APP',
    'timeStamp': String(now),
    'startDate': startDate,
    'endDate': endDate
  };

  var response = UrlFetchApp.fetch(
    'https://www.einvoice.nat.gov.tw/PB2CAPIVAN/invapp/InvApp',
    { method: 'post', payload: payload, muteHttpExceptions: true }
  );

  var httpCode = response.getResponseCode();
  var body = response.getContentText('UTF-8');

  Logger.log('HTTP ' + httpCode);
  Logger.log(body);

  if (httpCode !== 200) {
    throw new Error('HTTP error: ' + httpCode);
  }

  var data = JSON.parse(body);

  if (data.code !== '200') {
    throw new Error('API error ' + data.code + ': ' + data.msg);
  }

  return data;
}
