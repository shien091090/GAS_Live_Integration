// 讀取「記帳接待辦自動化設定」分頁的所有啟用設定
function GetBuyReminderConfigs() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_BUY_REMINDER_CONFIG);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var configs = [];

  data.forEach(function(row) {
    var isEnabled = row[COLUMN_SETTING_BUY_REMINDER_CONFIG.IsEnabled - 1];
    if (isEnabled !== true && String(isEnabled).toUpperCase() !== 'TRUE') return;

    var defaultQtyRaw = row[COLUMN_SETTING_BUY_REMINDER_CONFIG.DefaultQuantity - 1];
    var defaultQty = parseFloat(defaultQtyRaw);

    configs.push({
      displayName:   String(row[COLUMN_SETTING_BUY_REMINDER_CONFIG.DisplayName - 1]).trim(),
      keywords:      String(row[COLUMN_SETTING_BUY_REMINDER_CONFIG.Keywords - 1])
                       .split(',').map(function(k) { return k.trim(); })
                       .filter(function(k) { return k.length > 0; }),
      baseUnit:      String(row[COLUMN_SETTING_BUY_REMINDER_CONFIG.BaseUnit - 1]).trim(),
      daysPerUnit:   parseFloat(row[COLUMN_SETTING_BUY_REMINDER_CONFIG.DaysPerUnit - 1]) || 0,
      defaultQuantity: isNaN(defaultQty) || defaultQtyRaw === '' ? null : defaultQty
    });
  });

  return configs;
}

// 依品名關鍵字找到第一個符合的設定
function FindBuyReminderConfig(itemName, configs) {
  for (var i = 0; i < configs.length; i++) {
    var config = configs[i];
    for (var j = 0; j < config.keywords.length; j++) {
      if (itemName.indexOf(config.keywords[j]) !== -1) return config;
    }
  }
  return null;
}

// 從描述字串解析數量
// 支援乘法鏈：A箱*B包*C片 → 以基準單位為終點，往前收集整條鏈
// 規則：鏈結中每個「單位」必須是中文字，避免誤抓 16mg 這類規格數字
function ParseQuantityFromDescription(description, baseUnit) {
  var baseUnitIndex = description.lastIndexOf(baseUnit);
  if (baseUnitIndex === -1) return null;

  var sub = description.substring(0, baseUnitIndex + baseUnit.length);

  // 找緊鄰基準單位前的數字
  var baseUnitPattern = new RegExp('(\\d+)' + _escapeRegex(baseUnit) + '$');
  var baseMatch = sub.match(baseUnitPattern);
  if (!baseMatch) return null;

  var numbers = [parseInt(baseMatch[1])];
  var remaining = sub.substring(0, sub.length - baseMatch[0].length);

  // 往前收集：每個鏈結格式為 (\d+)(中文單位)[*×＊]
  while (remaining.length > 0) {
    var chainMatch = remaining.match(/(\d+)([一-鿿]+)[*×＊]$/);
    if (!chainMatch) break;
    numbers.unshift(parseInt(chainMatch[1]));
    remaining = remaining.substring(0, remaining.length - chainMatch[0].length);
  }

  return numbers.reduce(function(acc, n) { return acc * n; }, 1);
}

// 推算購買月份，格式為 X月初/中/底，跨年加上西元年
function FormatNextBuyMonth(nextDate) {
  var now = new Date();
  var day = nextDate.getDate();
  var month = nextDate.getMonth() + 1;
  var year = nextDate.getFullYear();
  var period = day <= 10 ? '初' : (day <= 20 ? '中' : '底');
  var monthStr = month + '月' + period;
  return year !== now.getFullYear() ? (year + '/' + monthStr) : monthStr;
}

// 輔助：跳脫 regex 特殊字元
function _escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 主入口：判斷記帳品名是否符合設定，符合則計算日期、加待辦，並回傳要附加在回覆的文字
function CheckAndAddBuyReminder(itemName) {
  var configs = GetBuyReminderConfigs();
  var config = FindBuyReminderConfig(itemName, configs);
  if (config === null) return '';

  var quantity = ParseQuantityFromDescription(itemName, config.baseUnit);

  if (quantity === null && config.defaultQuantity !== null) {
    quantity = config.defaultQuantity;
  }

  if (quantity !== null) {
    var days = Math.round(quantity * config.daysPerUnit);
    var nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    var memoText = FormatNextBuyMonth(nextDate) + ' 買' + config.displayName;
    Action_AddMemo(memoText);
    return '\n\n已新增待辦：' + memoText;
  } else {
    return '\n\n【提醒】找不到「' + config.baseUnit + '」，無法自動建立補購待辦\n' +
           '若要啟用，請在品名中加入數量（例：' + config.displayName + '*N' + config.baseUnit + '）';
  }
}
