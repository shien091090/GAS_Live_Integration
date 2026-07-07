//新增待辦事項
function Action_AddMemo(content) {
  var newMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);
  var newItem = new MemoElement([0, 0, new Date(), String(content), 0]);
  newMemoItems.push(newItem);
  
  SortAndUpdateSheetItems(newMemoItems, SHEET_ITEM_TYPE.DailyMemoItem);
  AddItemToSheet(SHEET_NAME_DAILY_MEMO, newMemoItems, SHEET_ITEM_TYPE.DailyMemoItem, COLUMN_SETTING_DAILY_MEMO.MemoItemId);

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.DailyMemoItem);

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    ConvertTextFormat(TEXT_TABLE_KEY_ADD_MEMO_SUCCESS, [content]),
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//刪除待辦事項
function Action_RemoveMemo(numberText) {
  var removeNumber = parseInt(numberText);
  var oldMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);

  if(oldMemoItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_REMOVE_MEMO_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  if(removeNumber <= 0 || removeNumber > oldMemoItems.length)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      ConvertTextFormat(TEXT_TABLE_KEY_REMOVE_MEMO_INVALID_NUMBER, [oldMemoItems.length]),
      ' ',
      MESSAGE_TYPE_TEXT);

  var newMemoItems = [];
  var removeMemoItem = {};
  oldMemoItems.forEach(function(memoItem) {
    if(memoItem.number != removeNumber)
      newMemoItems.push(memoItem);
    else
      removeMemoItem = memoItem;
  });

  if(newMemoItems.length > 0)
    SortAndUpdateSheetItems(newMemoItems, SHEET_ITEM_TYPE.DailyMemoItem);

  AddItemToSheet(SHEET_NAME_DAILY_MEMO, newMemoItems, SHEET_ITEM_TYPE.DailyMemoItem, COLUMN_SETTING_DAILY_MEMO.MemoItemId);

  var currentMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);
  var replyContent = '';
  if(currentMemoItems.length <= 0)
    replyContent = '(空)';
  else
    replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.DailyMemoItem);

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    ConvertTextFormat(TEXT_TABLE_KEY_REMOVE_MEMO_SUCCESS, [ConvertSymbolDigit(removeNumber), removeMemoItem.content]),
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//刪除複數待辦事項
function Action_RemoveMultipleMemo(numbersText) {
  var removeNumbers = [];

  if(numbersText.indexOf('~') !== -1) {
    var parts = numbersText.split('~');
    var start = parseInt(parts[0]);
    var end = parseInt(parts[1]);
    if(isNaN(start) || isNaN(end) || start > end)
      return new ServerResponse(STATUS_CODE_INVALID, '【格式錯誤】範圍格式應為 起始數字~結束數字', ' ', MESSAGE_TYPE_TEXT);
    for(var i = start; i <= end; i++)
      removeNumbers.push(i);
  } else {
    numbersText.split(/[\/.,]/).forEach(function(p) {
      var n = parseInt(p);
      if(!isNaN(n)) removeNumbers.push(n);
    });
  }

  removeNumbers = [...new Set(removeNumbers)].sort(function(a, b) { return a - b; });

  var oldMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);

  if(oldMemoItems.length <= 0)
    return new ServerResponse(STATUS_CODE_INVALID, GetTextTableValue(TEXT_TABLE_KEY_REMOVE_MEMO_EMPTY), '(空)', MESSAGE_TYPE_TEXT);

  var validRemoveNumbers = removeNumbers.filter(function(n) { return n >= 1 && n <= oldMemoItems.length; });

  if(validRemoveNumbers.length === 0)
    return new ServerResponse(STATUS_CODE_INVALID, ConvertTextFormat(TEXT_TABLE_KEY_REMOVE_MEMO_INVALID_NUMBER, [oldMemoItems.length]), ' ', MESSAGE_TYPE_TEXT);

  var removedItems = [];
  var newMemoItems = [];
  oldMemoItems.forEach(function(memoItem) {
    if(validRemoveNumbers.includes(memoItem.number))
      removedItems.push(memoItem);
    else
      newMemoItems.push(memoItem);
  });

  if(newMemoItems.length > 0)
    SortAndUpdateSheetItems(newMemoItems, SHEET_ITEM_TYPE.DailyMemoItem);

  AddItemToSheet(SHEET_NAME_DAILY_MEMO, newMemoItems, SHEET_ITEM_TYPE.DailyMemoItem, COLUMN_SETTING_DAILY_MEMO.MemoItemId);

  var currentMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);
  var replyContent = currentMemoItems.length <= 0 ? '(空)' : GetSheetItemsText(SHEET_ITEM_TYPE.DailyMemoItem);

  var removedNames = removedItems.map(function(item, i) { return `${ConvertSymbolDigit(i + 1)} ${item.content}`; }).join('\n');
  var statusMsg = `已刪除以下${removedItems.length}筆待辦事項\n${removedNames}`;

  return new ServerResponse(STATUS_CODE_SUCCESS, statusMsg, replyContent, MESSAGE_TYPE_TEXT);
}

//修改待辦事項
function Action_ModifyMemo(numberText, newMemoContent) {
  var modifyNumber = parseInt(numberText);
  var currentMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);

  if(currentMemoItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_MODIFY_MEMO_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  if(modifyNumber <= 0 || modifyNumber > currentMemoItems.length)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      ConvertTextFormat(TEXT_TABLE_KEY_MODIFY_MEMO_INVALID_NUMBER, [currentMemoItems.length]),
      ' ',
      MESSAGE_TYPE_TEXT);

  var originContent = '';
  currentMemoItems.forEach(function(memoItem) {
    if(memoItem.number == modifyNumber)
    {
      originContent = memoItem.content;
      memoItem.content = newMemoContent;
    }

  });

  SortAndUpdateSheetItems(currentMemoItems, SHEET_ITEM_TYPE.DailyMemoItem);
  AddItemToSheet(SHEET_NAME_DAILY_MEMO, currentMemoItems, SHEET_ITEM_TYPE.DailyMemoItem, COLUMN_SETTING_DAILY_MEMO.MemoItemId);

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.DailyMemoItem);
  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    ConvertTextFormat(TEXT_TABLE_KEY_MODIFY_MEMO_SUCCESS, [ConvertSymbolDigit(modifyNumber), originContent, newMemoContent]),
    replyContent,
    MESSAGE_TYPE_TEXT);

}

//延伸待辦事項
function Action_ExtendMemo(numberText, appendContent) {
  var extendNumber = parseInt(numberText);
  var currentMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);

  if(currentMemoItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_MODIFY_MEMO_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  if(extendNumber <= 0 || extendNumber > currentMemoItems.length)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      ConvertTextFormat(TEXT_TABLE_KEY_MODIFY_MEMO_INVALID_NUMBER, [currentMemoItems.length]),
      ' ',
      MESSAGE_TYPE_TEXT);

  var originContent = '';
  var newContent = '';
  currentMemoItems.forEach(function(memoItem) {
    if(memoItem.number == extendNumber) {
      originContent = memoItem.content;
      newContent = originContent + appendContent;
      memoItem.content = newContent;
    }
  });

  SortAndUpdateSheetItems(currentMemoItems, SHEET_ITEM_TYPE.DailyMemoItem);
  AddItemToSheet(SHEET_NAME_DAILY_MEMO, currentMemoItems, SHEET_ITEM_TYPE.DailyMemoItem, COLUMN_SETTING_DAILY_MEMO.MemoItemId);

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.DailyMemoItem);
  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    `已延伸第${ConvertSymbolDigit(extendNumber)}項\n${originContent}\n→ ${newContent}`,
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//確認待辦事項
function Action_GetMemo() {
  var currentMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);
  if(currentMemoItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_GET_MEMO_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.DailyMemoItem);
  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    GetTextTableValue(TEXT_TABLE_KEY_GET_MEMO_SUCCESS),
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//新增週期行程
function Action_AddSchedule(scheduleTypeName, scheduleNumber, content) {
  if(CheckScheduleTypeIsValid(scheduleTypeName) == false)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_ADD_SCHEDULE_INVALID_KEY),
      ' ',
      MESSAGE_TYPE_TEXT);

  if(CheckScheduleValueIsValid(scheduleTypeName, scheduleNumber) == false) {
    var validTimeRange = GetValidScheduleValueRange(scheduleTypeName);
    return new ServerResponse(
      STATUS_CODE_INVALID,
      ConvertTextFormat(TEXT_TABLE_KEY_ADD_SCHEDULE_INVALID_TIME_RANGE, [scheduleTypeName, validTimeRange[0], validTimeRange[1]]),
      ' ',
      MESSAGE_TYPE_TEXT);
  }

  var newScheduleItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.ScheduleItem);
  var newItem = new ScheduleElement([0, 0, new Date(), String(content), scheduleTypeName, scheduleNumber, 0]);
  newScheduleItems.push(newItem);

  SortAndUpdateSheetItems(newScheduleItems, SHEET_ITEM_TYPE.ScheduleItem);
  AddItemToSheet(SHEET_NAME_SCHEDULE, newScheduleItems, SHEET_ITEM_TYPE.ScheduleItem, COLUMN_SETTING_SCHEDULE.ScheduleItemId);

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.ScheduleItem);
  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    ConvertTextFormat(TEXT_TABLE_KEY_ADD_SCHEDULE_SUCCESS, [newItem.GetFullContent()]),
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//刪除週期行程
function Action_RemoveSchedule(numberText) {
  var removeNumber = parseInt(numberText);
  var oldScheduleItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.ScheduleItem);

  if(oldScheduleItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_REMOVE_SCHEDULE_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  if(removeNumber <= 0 || removeNumber > oldScheduleItems.length)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      ConvertTextFormat(TEXT_TABLE_KEY_REMOVE_SCHEDULE_INVALID_NUMBER, [oldScheduleItems.length]),
      ' ',
      MESSAGE_TYPE_TEXT);

  var newScheduleItems = [];
  var removeScheduleItem = {};
  oldScheduleItems.forEach(function(scheduleItem) {
    if(scheduleItem.number != removeNumber)
      newScheduleItems.push(scheduleItem);
    else
      removeScheduleItem = scheduleItem;
  });

  if(newScheduleItems.length > 0)
    SortAndUpdateSheetItems(newScheduleItems, SHEET_ITEM_TYPE.ScheduleItem);

  AddItemToSheet(SHEET_NAME_SCHEDULE, newScheduleItems, SHEET_ITEM_TYPE.ScheduleItem, COLUMN_SETTING_SCHEDULE.ScheduleItemId);

  var currentScheduleItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.ScheduleItem);
  var replyContent = '';
  if(currentScheduleItems.length <= 0)
    replyContent = '(空)';
  else
    replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.ScheduleItem);

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    ConvertTextFormat(TEXT_TABLE_KEY_REMOVE_SCHEDULE_SUCCESS, [ConvertSymbolDigit(removeNumber), removeScheduleItem.GetFullContent()]),
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//修改週期行程
function Action_ModifySchedule(numberText, scheduleTypeName, scheduleNumber, newScheduleContent) {
  var modifyNumber = parseInt(numberText);
  var currentScheduleItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.ScheduleItem);

  if(currentScheduleItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_MODIFY_SCHEDULE_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  if(modifyNumber <= 0 || modifyNumber > currentScheduleItems.length)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      ConvertTextFormat(TEXT_TABLE_KEY_MODIFY_SCHEDULE_INVALID_NUMBER, [currentScheduleItems.length]),
      ' ',
      MESSAGE_TYPE_TEXT);

  if(CheckScheduleTypeIsValid(scheduleTypeName) == false)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_MODIFY_SCHEDULE_INVALID_KEY),
      ' ',
      MESSAGE_TYPE_TEXT);

  if(CheckScheduleValueIsValid(scheduleTypeName, scheduleNumber) == false) {
    var validTimeRange = GetValidScheduleValueRange(scheduleTypeName);
    return new ServerResponse(
      STATUS_CODE_INVALID,
      ConvertTextFormat(TEXT_TABLE_KEY_MODIFY_SCHEDULE_INVALID_TIME_RANGE, [scheduleTypeName, validTimeRange[0], validTimeRange[1]]),
      ' ',
      MESSAGE_TYPE_TEXT);
  }

  var originFullContent = "";
  var newFullScheduleContent = "";
  currentScheduleItems.forEach(function(scheduleItem) {
    if(scheduleItem.number == modifyNumber)
    {
      originFullContent = scheduleItem.GetFullContent();

      scheduleItem.content = newScheduleContent;
      scheduleItem.scheduleType = scheduleTypeName;
      scheduleItem.scheduleValue = scheduleNumber;

      newFullScheduleContent = scheduleItem.GetFullContent();
    }

  });

  SortAndUpdateSheetItems(currentScheduleItems, SHEET_ITEM_TYPE.ScheduleItem);
  AddItemToSheet(SHEET_NAME_SCHEDULE, currentScheduleItems, SHEET_ITEM_TYPE.ScheduleItem, COLUMN_SETTING_SCHEDULE.ScheduleItemId);

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.ScheduleItem);
  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    ConvertTextFormat(TEXT_TABLE_KEY_MODIFY_SCHEDULE_SUCCESS, [ConvertSymbolDigit(modifyNumber), originFullContent, newFullScheduleContent]),
    replyContent,
    MESSAGE_TYPE_TEXT);

}

//確認週期行程
function Action_GetSchedule() {
  var currentScheduleItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.ScheduleItem);
  if(currentScheduleItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_GET_SCHEDULE_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  SortScheduleItems(currentScheduleItems);
  var replyContent = '';
  currentScheduleItems.forEach(function(item, index) {
    replyContent += `${index + 1}. ${item.GetFullContent()}\n`;
  });

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    GetTextTableValue(TEXT_TABLE_KEY_GET_SCHEDULE_SUCCESS),
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//每日提醒
function Action_DailyScheduler() {
  var now = new Date();
  var nowDay = now.getDay();
  var localWeekTxt = '';
  
  if(nowDay == 0)
    localWeekTxt = "日";
  else
    localWeekTxt = ConvertChineseNumber(nowDay);

  var formatDateTxt = Utilities.formatDate(now, "GMT+8", `yyyy/M/d(${localWeekTxt})`)
  var resHint = `${formatDateTxt}\n『再不用心，老婆就要變心』`;

  var currentScheduleItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.ScheduleItem);
  var matchScheduleItems = [];

  if(currentScheduleItems.length > 0) {
    var currentDay = now.getDate();
    var currentWeekNumber = parseInt(now.getDay());
    var currentMonth = now.getMonth() + 1;

    currentScheduleItems.forEach(function(scheduleItem) {
      if(CheckScheduleTypeIsValid(scheduleItem.scheduleType)) {
        if(scheduleItem.scheduleType == "每天")
          matchScheduleItems.push(scheduleItem);
        else if(scheduleItem.scheduleType == "每週" && currentWeekNumber == scheduleItem.scheduleValue)
          matchScheduleItems.push(scheduleItem);
        else if(scheduleItem.scheduleType == "每月" && currentDay == scheduleItem.scheduleValue)
          matchScheduleItems.push(scheduleItem);
        else if(scheduleItem.scheduleType == "每年" && currentDay == 1 && currentMonth == scheduleItem.scheduleValue)
          matchScheduleItems.push(scheduleItem);
      }
    });
  }

  var autoAccountingItems = [];
  var autoMemoItems = [];

  matchScheduleItems.forEach(function(scheduleItem) {
    if(IsAccountingScheduleItem(scheduleItem.content)) {
      var parsed = ParseAccountingScheduleItem(scheduleItem.content);
      if(parsed != null) {
        Action_Buy(parsed.name, parsed.amount, parsed.category);
        autoAccountingItems.push(parsed);
      } else {
        Action_AddMemo(scheduleItem.content);
        autoMemoItems.push(scheduleItem);
      }
    } else {
      Action_AddMemo(scheduleItem.content);
      autoMemoItems.push(scheduleItem);
    }
  });

  if(autoMemoItems.length > 0) {
    resHint += "\n已自動幫您加入以下待辦事項\n";
    autoMemoItems.forEach(function(scheduleItem, index) {
      resHint += `${ConvertSymbolDigit(index + 1)} ${scheduleItem.GetFullContent()}`;
      if(index < autoMemoItems.length - 1)
        resHint += '\n';
    });
  }

  if(autoAccountingItems.length > 0) {
    resHint += "\n已自動記帳以下項目\n";
    autoAccountingItems.forEach(function(item, index) {
      resHint += `${ConvertSymbolDigit(index + 1)} ${item.name} $${item.amount.toLocaleString('en-US')}`;
      if(index < autoAccountingItems.length - 1)
        resHint += '\n';
    });
  }

  var currentMemoItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);
  if(currentMemoItems.length <= 0)
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_GET_MEMO_EMPTY),
      '(空)',
      MESSAGE_TYPE_TEXT);

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.DailyMemoItem);
  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    resHint,
    replyContent,
    MESSAGE_TYPE_TEXT);
}

//記帳
function Action_Buy(accountItemName, numberText, budgetType = '') {
  var prize = parseInt(numberText);
  KeepAccount(accountItemName, prize, budgetType);

  var accountSuccessText = ConvertTextFormat(TEXT_TABLE_KEY_BUY_SUCCESS, [accountItemName, prize]);
  var reminderNote = CheckAndAddBuyReminder(accountItemName);
  var progressBar = GetBudgetProgressBar(budgetType);

  var resultReplyText = accountSuccessText;
  if (progressBar !== '') {
    resultReplyText += '\n' + progressBar;
  }
  resultReplyText += reminderNote;

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    resultReplyText,
    '　',
    MESSAGE_TYPE_TEXT);
}

//取得記帳項目列表（可選：起始日期、結束日期、分類）
function Action_GetAccountingItems(startDateStr, endDateStr, budgetTypesStr) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_ACCOUNTING);
  var lastRow = targetSheet.getLastRow();

  if(lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, 'success', JSON.stringify([]), MESSAGE_TYPE_TEXT);

  var startDate = (startDateStr && startDateStr != '') ? new Date(startDateStr) : null;
  var endDate = null;
  if(endDateStr && endDateStr != '') {
    endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
  }

  var budgetTypes = [];
  if(budgetTypesStr && budgetTypesStr.trim() != '')
    budgetTypes = budgetTypesStr.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s != ''; });

  var dataRange = targetSheet.getRange(2, 1, lastRow - 1, 5);
  var values = dataRange.getValues();

  var results = [];
  values.forEach(function(row) {
    var date = row[COLUMN_SETTING_ACCOUNTING.Date - 1];
    var content = row[COLUMN_SETTING_ACCOUNTING.AccountingContent - 1];
    var prize = row[COLUMN_SETTING_ACCOUNTING.Prize - 1];
    var budgetType = row[COLUMN_SETTING_ACCOUNTING.BudgetType - 1];

    if(content === '' || date === '') return;

    var rowDate = new Date(date);
    if(startDate && rowDate < startDate) return;
    if(endDate && rowDate > endDate) return;
    if(budgetTypes.length > 0 && !budgetTypes.includes(String(budgetType))) return;

    results.push({
      date: Utilities.formatDate(rowDate, "GMT+8", "yyyy/MM/dd"),
      content: String(content),
      prize: parseInt(prize) || 0,
      budgetType: String(budgetType)
    });
  });

  return new ServerResponse(STATUS_CODE_SUCCESS, 'success', JSON.stringify(results), MESSAGE_TYPE_TEXT);
}

//取得分析圖表
function Action_GetChart(command, chartType) {
  
  switch(chartType){
    case CHART_TYPE_ACCOUNTING:
      return Action_GetAccountPieChart(command);
  }

  return new ServerResponse(
    STATUS_CODE_INVALID,
    GetTextTableValue(TEXT_TABLE_KEY_GET_CHART_COMMAND_INVALID),
    '(空)',
    MESSAGE_TYPE_TEXT);
}

//取得花費統計圓餅圖
function Action_GetAccountPieChart(command) {
  console.log(`command: ${command}`);

  var splitArr = command.split("~");
  var searchKeys = [];
  if(splitArr.length > 1)
  {
    splitArr.forEach(function(str) {
      var parseDate = new Date(ParseDateFromString(str));
      var formatDateTxt = Utilities.formatDate(parseDate, "GMT+8", `yyyy/M月`)
      searchKeys.push(formatDateTxt);
    });
  }
  else
  {
    var parseDate = new Date(ParseDateFromString(command));
    var formatDateTxt = Utilities.formatDate(parseDate, "GMT+8", `yyyy/M月`)
    searchKeys.push(formatDateTxt);
  }

  console.log(`search Keys: ${searchKeys}`);

  var targetColumns = [];
  var startRow = 0;
  var isDataSourceEmpty = false;
  searchKeys.forEach(function(searchKey){
    var matchCell = GetSearchCellFromRow(SHEET_NAME_COST_TABLE, searchKey);
    if(matchCell != undefined)
    {
      console.log(`match cell pos: (${matchCell.getRow()}, ${matchCell.getColumn()})`);
      targetColumns.push(matchCell.getColumn());
      startRow = matchCell.getRow() + 1;
    }
    else
      isDataSourceEmpty = true;
  });

  if(isDataSourceEmpty)
  {
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_GET_CHART_COMMAND_EMPTY_DATA_SOURCE),
      '(空)',
      MESSAGE_TYPE_TEXT);
  }

  var tempTargetColumn = [];
  if(targetColumns.length <= 1)
    tempTargetColumn = targetColumns;
  else
  {
    for (let i = targetColumns[0]; i <= targetColumns[1]; i++) {
      tempTargetColumn.push(i);
    }
  }

  targetColumns = tempTargetColumn;

  console.log(`targetColumns: ${targetColumns}`);

  var dict = {};
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_ACCOUNTING_STATISTICS);
  var accountTypeLength = GetSearchBlankCellFromColumn(SHEET_NAME_ACCOUNTING_STATISTICS).getRow() - 2;
  var total = 0;
  targetColumns.forEach(function(targetColumn){

    for (let i = 0; i < accountTypeLength; i++) {
      var typeNameCell = targetSheet.getRange(startRow + i, COLUMN_SETTING_ACCOUNTING_STATISTICS.Type);
      var typeName = typeNameCell.getValues();
      var value = targetSheet.getRange(startRow + i, targetColumn).getValues();
      console.log(`pos(${startRow + i},${targetColumn}): ${value}, typeName: ${typeName}`);

      if(dict.hasOwnProperty(typeName) == false)
        dict[typeName] = 0;

      dict[typeName] += parseInt(value);
      total += parseInt(value);
    }
  });

  Object.keys(dict).forEach(function(key) {
    if (dict[key] === 0) {
      delete dict[key];
    }
  });

  if(Object.keys(dict).length === 0)
  {
    return new ServerResponse(
      STATUS_CODE_INVALID,
      GetTextTableValue(TEXT_TABLE_KEY_GET_CHART_COMMAND_EMPTY_ACCOUNT_CHART),
      '(空)',
      MESSAGE_TYPE_TEXT);
  }
  else
  {
    var title = '';
    if(searchKeys.length == 1)
      title = ConvertTextFormat(TEXT_TABLE_KEY_GET_CHART_ACCOUNT_PIE_CHART_TITLE_FORMAT, [searchKeys[0], total.toLocaleString('en-US')]);
    else
      title = ConvertTextFormat(TEXT_TABLE_KEY_GET_CHART_ACCOUNT_PIE_CHART_TITLE_FORMAT, [`${searchKeys[0]}~${searchKeys[1]}`, total.toLocaleString('en-US')]);

    dict = GetSortDictionary(dict, true);
    dict = GetCombineDictionaryWhenValueSmallerThen(dict, 0.04, '其他小額花費');
    
    var entity = {
      chartTitle: title,
      data: dict
    };

    var json = JSON.stringify(entity);
    console.log(json);
    
    return new ServerResponse(
      STATUS_CODE_SUCCESS,
      '',
      json,
      MESSAGE_TYPE_CHART);
  }
}

function Action_GetBudgetStatus(yearParam, monthParam) {
  var ss = SpreadsheetApp.getActive();
  var budgetSheet = ss.getSheetByName(SHEET_NAME_BUDGET_SETTING);
  if (!budgetSheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到預算設定分頁', '', MESSAGE_TYPE_TEXT);

  var budgetLastRow = budgetSheet.getLastRow();
  if (budgetLastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '無預算資料', '{"categories":[],"totalBudget":0,"totalSpent":0,"totalDiff":0,"totalIsOverBudget":false}', MESSAGE_TYPE_TEXT);

  var budgetData = budgetSheet.getRange(2, 1, budgetLastRow - 1, 17).getValues();

  var accountingSheet = ss.getSheetByName(SHEET_NAME_ACCOUNTING);
  var accountingData = [];
  if (accountingSheet && accountingSheet.getLastRow() >= 2)
    accountingData = accountingSheet.getRange(2, 1, accountingSheet.getLastRow() - 1, 4).getValues();

  var now = new Date();
  var targetYear = (yearParam && parseInt(yearParam) > 0) ? parseInt(yearParam) : now.getFullYear();
  var currentMonth = (monthParam && parseInt(monthParam) > 0) ? parseInt(monthParam) : now.getMonth() + 1;

  var specialTriples = [
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth1, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount1, COLUMN_SETTING_BUDGET_SETTING.SpecialItem1],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth2, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount2, COLUMN_SETTING_BUDGET_SETTING.SpecialItem2],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth3, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount3, COLUMN_SETTING_BUDGET_SETTING.SpecialItem3],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth4, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount4, COLUMN_SETTING_BUDGET_SETTING.SpecialItem4],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth5, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount5, COLUMN_SETTING_BUDGET_SETTING.SpecialItem5],
  ];

  var categories = [];
  var totalBudget = 0;
  var totalSpent = 0;

  for (var i = 0; i < budgetData.length; i++) {
    var row = budgetData[i];
    var budgetType = String(row[COLUMN_SETTING_BUDGET_SETTING.BudgetType - 1]).trim();
    if (!budgetType || budgetType === '') continue;

    var baseBudget = parseInt(row[COLUMN_SETTING_BUDGET_SETTING.MonthlyAmount - 1]) || 0;
    var specialAdjustment = 0;

    specialTriples.forEach(function(triple) {
      var specialMonth = row[triple[0] - 1];
      var specialAmount = row[triple[1] - 1];
      if (specialMonth !== '' && parseInt(specialMonth) === currentMonth)
        specialAdjustment += parseInt(specialAmount) || 0;
    });

    var effectiveBudget = baseBudget + specialAdjustment;

    var spent = 0;
    accountingData.forEach(function(accRow) {
      var date = accRow[COLUMN_SETTING_ACCOUNTING.Date - 1];
      var prize = accRow[COLUMN_SETTING_ACCOUNTING.Prize - 1];
      var rowBudgetType = accRow[COLUMN_SETTING_ACCOUNTING.BudgetType - 1];
      if (!date || date === '') return;
      var rowDate = new Date(date);
      if (rowDate.getFullYear() === targetYear &&
          rowDate.getMonth() + 1 === currentMonth &&
          String(rowBudgetType) === budgetType)
        spent += parseInt(prize) || 0;
    });

    if (effectiveBudget <= 0 && spent <= 0) continue;

    var isOverBudget = spent > effectiveBudget;
    categories.push({
      name: budgetType,
      baseBudget: baseBudget,
      specialAdjustment: specialAdjustment,
      effectiveBudget: effectiveBudget,
      spent: spent,
      diff: effectiveBudget - spent,
      isOverBudget: isOverBudget,
      overspent: isOverBudget ? spent - effectiveBudget : 0
    });

    totalBudget += effectiveBudget;
    totalSpent += spent;
  }

  var result = {
    year: targetYear,
    month: currentMonth,
    categories: categories,
    totalBudget: totalBudget,
    totalSpent: totalSpent,
    totalDiff: totalBudget - totalSpent,
    totalIsOverBudget: totalSpent > totalBudget
  };

  return new ServerResponse(STATUS_CODE_SUCCESS, '取得預算狀態成功', JSON.stringify(result), MESSAGE_TYPE_TEXT);
}

function Action_GetSpecialSchedule() {
  var budgetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_BUDGET_SETTING);
  if (!budgetSheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到預算設定分頁', '', MESSAGE_TYPE_TEXT);

  var lastRow = budgetSheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '無資料', '[]', MESSAGE_TYPE_TEXT);

  var data = budgetSheet.getRange(2, 1, lastRow - 1, 17).getValues();

  var specialTriples = [
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth1, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount1, COLUMN_SETTING_BUDGET_SETTING.SpecialItem1],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth2, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount2, COLUMN_SETTING_BUDGET_SETTING.SpecialItem2],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth3, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount3, COLUMN_SETTING_BUDGET_SETTING.SpecialItem3],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth4, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount4, COLUMN_SETTING_BUDGET_SETTING.SpecialItem4],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth5, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount5, COLUMN_SETTING_BUDGET_SETTING.SpecialItem5],
  ];

  var results = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var name = String(row[COLUMN_SETTING_BUDGET_SETTING.BudgetType - 1]).trim();
    if (!name || name === '') continue;

    specialTriples.forEach(function(triple) {
      var specialMonth = row[triple[0] - 1];
      var specialAmount = row[triple[1] - 1];
      var specialItem = String(row[triple[2] - 1]).trim();
      var month = parseInt(specialMonth);
      var amount = parseInt(specialAmount);
      if (!isNaN(month) && !isNaN(amount) && amount !== 0) {
        results.push({
          name: name,
          specialMonth: month,
          specialAmount: amount,
          specialItem: specialItem
        });
      }
    });
  }

  return new ServerResponse(STATUS_CODE_SUCCESS, '取得特殊月份設定成功', JSON.stringify(results), MESSAGE_TYPE_TEXT);
}

//TODO : 返回指定月份總花費
//TODO : 返回指定月份指定種類的總花費
//TODO : 返回指定月份預算使用狀況
//TODO : 返回近N個月預算使用趨勢

// 取得物品準備清單
// attributes: 逗號分隔的屬性列表（選填），item 的所有屬性皆需包含在內才符合
// condition:  其他條件篩選（選填），有帶則作為額外 AND 條件
function Action_GetPreparationList(attributesParam, conditionParam) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_PREPARATION_LIST);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到物品準備清單', '', MESSAGE_TYPE_TEXT);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '物品準備清單', '(空)', MESSAGE_TYPE_TEXT);

  var filterAttributes = [];
  if (attributesParam && attributesParam.trim() !== '')
    filterAttributes = attributesParam.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });

  var filterCondition = (conditionParam && conditionParam.trim() !== '') ? conditionParam.trim() : '';

  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var resultText = '';
  var displayIndex = 1;

  data.forEach(function(row) {
    var name = String(row[0]).trim();
    var attributeRaw = String(row[1]).trim();
    var condition = String(row[2]).trim();

    if (name === '') return;

    // 屬性篩選：item 的所有屬性必須都在 filterAttributes 中
    if (filterAttributes.length > 0) {
      var itemAttributes = attributeRaw.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
      var allCovered = itemAttributes.every(function(attr) { return filterAttributes.indexOf(attr) !== -1; });
      if (!allCovered) return;
    }

    // 其他條件篩選
    if (filterCondition !== '' && condition !== filterCondition) return;

    resultText += `${displayIndex}. ${name}`;
    if (condition !== '') resultText += `，${condition}`;
    resultText += '\n';
    displayIndex++;
  });

  if (resultText === '')
    return new ServerResponse(STATUS_CODE_SUCCESS, '物品準備清單', '(空)', MESSAGE_TYPE_TEXT);

  return new ServerResponse(STATUS_CODE_SUCCESS, '物品準備清單', resultText.trim(), MESSAGE_TYPE_TEXT);
}

// 記錄日常時間
function Action_RecordDailyTime(eventType) {
  if (!eventType || eventType.trim() === '')
    return new ServerResponse(STATUS_CODE_INVALID, '請指定事件類型', '', MESSAGE_TYPE_TEXT);

  if (DAILY_TIME_EVENT_TYPES.indexOf(eventType) === -1)
    return new ServerResponse(STATUS_CODE_INVALID, `無效的事件類型：${eventType}`, '', MESSAGE_TYPE_TEXT);

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_DAILY_TIME_RECORD);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到日常時間紀錄分頁', '', MESSAGE_TYPE_TEXT);

  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'GMT+8', 'yyyy/MM/dd');
  var timeStr = Utilities.formatDate(now, 'GMT+8', 'HH:mm:ss');

  var nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1).setValue(dateStr);
  sheet.getRange(nextRow, 2).setValue(timeStr);
  sheet.getRange(nextRow, 3).setValue(eventType);

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    `已記錄：${eventType}`,
    `${dateStr} ${timeStr}`,
    MESSAGE_TYPE_TEXT);
}

// 取得指定日期已紀錄的事件類型清單
function _GetTodayEventTypes(sheet, dateStr) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var events = [];
  data.forEach(function(row) {
    var rowDate = row[0] instanceof Date
      ? Utilities.formatDate(row[0], 'GMT+8', 'yyyy/MM/dd')
      : String(row[0]).trim();
    if (rowDate === dateStr)
      events.push(String(row[2]).trim());
  });
  return events;
}

// 取得指定日期、指定時間段內已紀錄的事件類型清單（startHour inclusive, endHour exclusive）
function _GetEventsInTimeWindow(sheet, dateStr, startHour, endHour) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var events = [];
  data.forEach(function(row) {
    var rowDate = row[0] instanceof Date
      ? Utilities.formatDate(row[0], 'GMT+8', 'yyyy/MM/dd')
      : String(row[0]).trim();
    if (rowDate !== dateStr) return;
    var rowHour = row[1] instanceof Date
      ? parseInt(Utilities.formatDate(row[1], 'GMT+8', 'HH'))
      : parseInt(String(row[1]).trim().substring(0, 2));
    if (rowHour >= startHour && rowHour < endHour)
      events.push(String(row[2]).trim());
  });
  return events;
}

// 取得某列事件的絕對時間戳記（結合日期欄與時間欄）
function _GetRowTimestamp(row) {
  var dateVal = row[0];
  var timeVal = row[1];
  var year, month, day;
  if (dateVal instanceof Date) {
    year = parseInt(Utilities.formatDate(dateVal, 'GMT+8', 'yyyy'));
    month = parseInt(Utilities.formatDate(dateVal, 'GMT+8', 'MM')) - 1;
    day = parseInt(Utilities.formatDate(dateVal, 'GMT+8', 'dd'));
  } else {
    var dateParts = String(dateVal).trim().split('/');
    year = parseInt(dateParts[0]);
    month = parseInt(dateParts[1]) - 1;
    day = parseInt(dateParts[2]);
  }
  var hour, minute, second;
  if (timeVal instanceof Date) {
    hour = parseInt(Utilities.formatDate(timeVal, 'GMT+8', 'HH'));
    minute = parseInt(Utilities.formatDate(timeVal, 'GMT+8', 'mm'));
    second = parseInt(Utilities.formatDate(timeVal, 'GMT+8', 'ss'));
  } else {
    var timeParts = String(timeVal).trim().split(':');
    hour = parseInt(timeParts[0]);
    minute = parseInt(timeParts[1]);
    second = parseInt(timeParts[2] || 0);
  }
  return new Date(year, month, day, hour, minute, second);
}

// 取得截至 now 為止、過去 N 小時內已紀錄的事件類型清單（跨日）
function _GetEventTypesInPastHours(sheet, now, hoursBack) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
  var events = [];
  data.forEach(function(row) {
    var eventTime = _GetRowTimestamp(row);
    if (eventTime >= cutoff && eventTime <= now)
      events.push(String(row[2]).trim());
  });
  return events;
}

// NFC 貼紙觸發 — 依位置執行對應流程
function Action_TriggerNfc(location) {
  if (!location || location.trim() === '')
    return new ServerResponse(STATUS_CODE_INVALID, '請指定NFC位置', '', MESSAGE_TYPE_TEXT);

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_DAILY_TIME_RECORD);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到日常時間紀錄分頁', '', MESSAGE_TYPE_TEXT);

  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'GMT+8', 'yyyy/MM/dd');
  var timeStr = Utilities.formatDate(now, 'GMT+8', 'HH:mm:ss');
  var hour = parseInt(Utilities.formatDate(now, 'GMT+8', 'HH'));

  var todayEvents = _GetTodayEventTypes(sheet, dateStr);
  var eventToRecord = null;

  if (location === NFC_LOCATION_COMPANY_DESK) {
    var hasArrival = todayEvents.indexOf('上班到達公司座位') !== -1;
    var hasLeave   = todayEvents.indexOf('準備下班離開座位') !== -1;
    if (!hasArrival)
      eventToRecord = '上班到達公司座位';
    else if (!hasLeave)
      eventToRecord = '準備下班離開座位';
    else
      return new ServerResponse(STATUS_CODE_SUCCESS, '今日公司座位記錄已完整，無需再記錄', '', MESSAGE_TYPE_TEXT);

  } else if (location === NFC_LOCATION_HOME_DOOR) {
    var hasLeaveHome   = todayEvents.indexOf('準備出門上班') !== -1;
    var hasArriveHome  = todayEvents.indexOf('下班到家') !== -1;
    if (!hasLeaveHome)
      eventToRecord = '準備出門上班';
    else if (!hasArriveHome)
      eventToRecord = '下班到家';
    else
      return new ServerResponse(STATUS_CODE_SUCCESS, '今日家門口記錄已完整，無需再記錄', '', MESSAGE_TYPE_TEXT);

  } else if (location === NFC_LOCATION_COMPUTER_DESK) {
    var recentEvents = _GetEventTypesInPastHours(sheet, now, 12);
    var hasBath      = recentEvents.indexOf('準備洗澡') !== -1;
    var hasEnterRoom = recentEvents.indexOf('準備進房') !== -1;
    if (!hasBath)
      eventToRecord = '準備洗澡';
    else if (!hasEnterRoom)
      eventToRecord = '準備進房';
    else
      return new ServerResponse(STATUS_CODE_SUCCESS, '過去12小時內電腦桌記錄已完整，無需再記錄', '', MESSAGE_TYPE_TEXT);

  } else if (location === NFC_LOCATION_XUAN_ROOM) {
    var hasXuanSleepStart = todayEvents.indexOf('璇璇準備入睡') !== -1;
    var hasXuanSleepEnd   = todayEvents.indexOf('璇璇睡著') !== -1;
    if (!hasXuanSleepStart)
      eventToRecord = '璇璇準備入睡';
    else if (!hasXuanSleepEnd)
      eventToRecord = '璇璇睡著';
    else
      return new ServerResponse(STATUS_CODE_SUCCESS, '今日璇璇房間記錄已完整，無需再記錄', '', MESSAGE_TYPE_TEXT);

  } else if (location === NFC_LOCATION_BEDROOM) {
    if (hour >= 4 && hour < 12) {
      var morningEvents = _GetEventsInTimeWindow(sheet, dateStr, 4, 12);
      if (morningEvents.indexOf('起床') !== -1)
        return new ServerResponse(STATUS_CODE_SUCCESS, '今日 04:00~12:00 內已記錄起床時間', '', MESSAGE_TYPE_TEXT);
      eventToRecord = '起床';
    } else if (hour >= 18 || hour < 4) {
      // 準備睡覺窗口：18:00~03:59（跨日）
      var hasSleep = false;
      if (hour < 4) {
        // 00:00~03:59：往回查昨天 18:00~24:00 + 今天 00:00~04:00
        var yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        var yesterdayStr = Utilities.formatDate(yesterday, 'GMT+8', 'yyyy/MM/dd');
        var lastNightEvents = _GetEventsInTimeWindow(sheet, yesterdayStr, 18, 24);
        var earlyMorningEvents = _GetEventsInTimeWindow(sheet, dateStr, 0, 4);
        hasSleep = lastNightEvents.indexOf('準備睡覺') !== -1 || earlyMorningEvents.indexOf('準備睡覺') !== -1;
      } else {
        // 18:00~23:59：只查今天
        var eveningEvents = _GetEventsInTimeWindow(sheet, dateStr, 18, 24);
        hasSleep = eveningEvents.indexOf('準備睡覺') !== -1;
      }
      if (hasSleep)
        return new ServerResponse(STATUS_CODE_SUCCESS, '今日睡覺時間已記錄', '', MESSAGE_TYPE_TEXT);
      eventToRecord = '準備睡覺';
    } else {
      // 12:00~17:59：不在記錄時間範圍
      return new ServerResponse(STATUS_CODE_SUCCESS, '目前不在記錄時間範圍（12:00~17:59）', '', MESSAGE_TYPE_TEXT);
    }
  } else {
    return new ServerResponse(STATUS_CODE_INVALID, '無效的NFC位置：' + location, '', MESSAGE_TYPE_TEXT);
  }

  var nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1).setValue(dateStr);
  sheet.getRange(nextRow, 2).setValue(timeStr);
  sheet.getRange(nextRow, 3).setValue(eventToRecord);

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    '已記錄：' + eventToRecord,
    dateStr + ' ' + timeStr,
    MESSAGE_TYPE_TEXT);
}

// 取得待辦事項（含建立時間）
function Action_GetMemoJson() {
  var items = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.DailyMemoItem);
  var result = items.map(function(item) {
    var raw = item.modifyTime;
    var modifyTime = raw instanceof Date
      ? Utilities.formatDate(raw, 'GMT+8', 'yyyy/MM/dd HH:mm:ss')
      : String(raw).trim();
    return { content: item.content, modifyTime: modifyTime };
  });
  return new ServerResponse(STATUS_CODE_SUCCESS, '取得待辦事項成功', JSON.stringify(result), MESSAGE_TYPE_TEXT);
}

// 每次最多讀取的歷史列數（避免分頁列數隨使用時間無限增長，拖垮讀取效能）
var MEMO_HISTORY_MAX_ROWS = 15000;

// 取得每日待辦事項分頁的近期歷史原始資料（含已被刪除的舊批次，不經過「僅取最新一批」的邏輯）
function Action_GetMemoHistory() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_DAILY_MEMO);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到每日待辦事項分頁', '[]', MESSAGE_TYPE_TEXT);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '無待辦事項歷史紀錄', '[]', MESSAGE_TYPE_TEXT);

  var totalDataRows = lastRow - 1;
  var readRowCount = Math.min(totalDataRows, MEMO_HISTORY_MAX_ROWS);
  var startRow = lastRow - readRowCount + 1;

  var data = sheet.getRange(startRow, 1, readRowCount, 5).getValues();
  var records = [];
  data.forEach(function(row) {
    var id = row[COLUMN_SETTING_DAILY_MEMO.MemoItemId - 1];
    if (id === '' || id === null)
      return;

    var rawModifyTime = row[COLUMN_SETTING_DAILY_MEMO.ModifyTime - 1];
    var modifyTime = rawModifyTime instanceof Date
      ? Utilities.formatDate(rawModifyTime, 'GMT+8', 'yyyy/MM/dd HH:mm:ss')
      : String(rawModifyTime).trim();

    records.push({
      id: id,
      number: row[COLUMN_SETTING_DAILY_MEMO.MemoNumber - 1],
      modifyTime: modifyTime,
      content: String(row[COLUMN_SETTING_DAILY_MEMO.MemoContent - 1]).trim(),
      totalCount: row[COLUMN_SETTING_DAILY_MEMO.TotalCount - 1],
    });
  });

  return new ServerResponse(STATUS_CODE_SUCCESS, '取得待辦事項歷史紀錄成功', JSON.stringify(records), MESSAGE_TYPE_TEXT);
}

// 新增待購買項目
function Action_AddPurchaseItem(itemName) {
  if (!itemName || itemName.trim() === '')
    return new ServerResponse(STATUS_CODE_INVALID, '請輸入品項名稱', '', MESSAGE_TYPE_TEXT);

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_PURCHASE_LIST);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到購買清單分頁', '', MESSAGE_TYPE_TEXT);

  var now = new Date();
  var timeStr = Utilities.formatDate(now, 'GMT+8', 'yyyy/MM/dd HH:mm:ss');
  var nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, COLUMN_SETTING_PURCHASE_LIST.ItemName).setValue(itemName.trim());
  sheet.getRange(nextRow, COLUMN_SETTING_PURCHASE_LIST.AddTime).setValue(timeStr);

  return new ServerResponse(STATUS_CODE_SUCCESS, '已新增：' + itemName.trim(), itemName.trim(), MESSAGE_TYPE_TEXT);
}

// 取得待購買清單（已購買時間為空的項目）
function Action_GetPurchaseList() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_PURCHASE_LIST);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到購買清單分頁', '', MESSAGE_TYPE_TEXT);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '取得待購買清單成功', '[]', MESSAGE_TYPE_TEXT);

  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var items = [];
  data.forEach(function(row) {
    var name = String(row[COLUMN_SETTING_PURCHASE_LIST.ItemName - 1]).trim();
    var addTimeRaw = row[COLUMN_SETTING_PURCHASE_LIST.AddTime - 1];
    var boughtTimeRaw = row[COLUMN_SETTING_PURCHASE_LIST.BoughtTime - 1];
    var addTime = addTimeRaw instanceof Date
      ? Utilities.formatDate(addTimeRaw, 'GMT+8', 'yyyy/MM/dd HH:mm:ss')
      : String(addTimeRaw).trim();
    var boughtTime = boughtTimeRaw instanceof Date
      ? Utilities.formatDate(boughtTimeRaw, 'GMT+8', 'yyyy/MM/dd HH:mm:ss')
      : String(boughtTimeRaw).trim();
    if (name !== '' && boughtTime === '')
      items.push({ name: name, addTime: addTime });
  });

  return new ServerResponse(STATUS_CODE_SUCCESS, '取得待購買清單成功', JSON.stringify(items), MESSAGE_TYPE_TEXT);
}

// 刪除待購買項目（整列移除，以品項名稱搜尋第一筆符合）
function Action_DeletePurchaseItem(itemName) {
  if (!itemName || itemName.trim() === '')
    return new ServerResponse(STATUS_CODE_INVALID, '請輸入品項名稱', '', MESSAGE_TYPE_TEXT);

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_PURCHASE_LIST);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到購買清單分頁', '', MESSAGE_TYPE_TEXT);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_INVALID, '購買清單目前為空', '', MESSAGE_TYPE_TEXT);

  var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var targetRow = -1;
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === itemName.trim()) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到品項：' + itemName, '', MESSAGE_TYPE_TEXT);

  sheet.deleteRow(targetRow);
  return new ServerResponse(STATUS_CODE_SUCCESS, '已刪除：' + itemName.trim(), itemName.trim(), MESSAGE_TYPE_TEXT);
}

// 標註待購買項目為已購買（填入已購買時間）
function Action_MarkPurchaseItemBought(itemName) {
  if (!itemName || itemName.trim() === '')
    return new ServerResponse(STATUS_CODE_INVALID, '請輸入品項名稱', '', MESSAGE_TYPE_TEXT);

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_PURCHASE_LIST);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到購買清單分頁', '', MESSAGE_TYPE_TEXT);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_INVALID, '購買清單目前為空', '', MESSAGE_TYPE_TEXT);

  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var targetRow = -1;
  for (var i = 0; i < data.length; i++) {
    var name = String(data[i][COLUMN_SETTING_PURCHASE_LIST.ItemName - 1]).trim();
    var boughtTimeRaw = data[i][COLUMN_SETTING_PURCHASE_LIST.BoughtTime - 1];
    var boughtTime = boughtTimeRaw instanceof Date
      ? Utilities.formatDate(boughtTimeRaw, 'GMT+8', 'yyyy/MM/dd HH:mm:ss')
      : String(boughtTimeRaw).trim();
    if (name === itemName.trim() && boughtTime === '') {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到未購買的品項：' + itemName, '', MESSAGE_TYPE_TEXT);

  var now = new Date();
  var timeStr = Utilities.formatDate(now, 'GMT+8', 'yyyy/MM/dd HH:mm:ss');
  sheet.getRange(targetRow, COLUMN_SETTING_PURCHASE_LIST.BoughtTime).setValue(timeStr);

  return new ServerResponse(STATUS_CODE_SUCCESS, '已標記為已購買：' + itemName.trim(), itemName.trim(), MESSAGE_TYPE_TEXT);
}

// 取得預算種類清單（從預算設定分頁 A 欄第2列往下讀到空白）
function Action_GetBudgetTypes() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_BUDGET_SETTING);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到預算設定分頁', '[]', MESSAGE_TYPE_TEXT);

  var types = [];
  var row = 2;
  while (true) {
    var value = sheet.getRange(row, 1).getValue();
    if (value === '' || value === null || value === undefined) break;
    types.push(String(value).trim());
    row++;
  }
  return new ServerResponse(STATUS_CODE_SUCCESS, '取得預算種類成功', JSON.stringify(types), MESSAGE_TYPE_TEXT);
}

// 取得重要日程清單
function Action_GetImportantSchedule() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_IMPORTANT_SCHEDULE);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到重要日程分頁', '[]', MESSAGE_TYPE_TEXT);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '取得重要日程成功', '[]', MESSAGE_TYPE_TEXT);

  var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  var items = [];
  data.forEach(function(row) {
    var name = String(row[COLUMN_SETTING_IMPORTANT_SCHEDULE.Name - 1]).trim();
    var dateRaw = row[COLUMN_SETTING_IMPORTANT_SCHEDULE.Date - 1];
    if (!name) return;
    var dateStr = dateRaw instanceof Date
      ? Utilities.formatDate(dateRaw, 'GMT+8', 'yyyy/MM/dd')
      : String(dateRaw).trim();
    items.push({ name: name, date: dateStr });
  });
  return new ServerResponse(STATUS_CODE_SUCCESS, '取得重要日程成功', JSON.stringify(items), MESSAGE_TYPE_TEXT);
}

// Dashboard 聚合 action — 經濟狀況頁（全年度，月份切換用）
function Action_GetDashboardEconomyAllMonths() {
  var now = new Date();
  var year = parseInt(Utilities.formatDate(now, 'GMT+8', 'yyyy'));
  var currentMonth = parseInt(Utilities.formatDate(now, 'GMT+8', 'MM'));
  var pad = function(n) { return ('0' + n).slice(-2); };

  var months = [];
  for (var m = 1; m <= currentMonth; m++) {
    var lastDay = new Date(year, m, 0).getDate();
    var startDate = year + '/' + pad(m) + '/01';
    var endDate = year + '/' + pad(m) + '/' + pad(lastDay);
    var itemsResp = Action_GetAccountingItems(startDate, endDate);
    var budgetResp = Action_GetBudgetStatus(String(year), String(m));
    months.push({
      month: m,
      items: JSON.parse(itemsResp.responseMsg),
      budget: JSON.parse(budgetResp.responseMsg)
    });
  }

  var scheduleResp = Action_GetSpecialSchedule();
  var memoResp = Action_GetMemo();
  var budgetTypesResp = Action_GetBudgetTypes();

  var result = {
    year: year,
    currentMonth: currentMonth,
    months: months,
    schedule: JSON.parse(scheduleResp.responseMsg),
    memo: memoResp.responseMsg,
    budgetTypes: JSON.parse(budgetTypesResp.responseMsg)
  };
  return new ServerResponse(STATUS_CODE_SUCCESS, '取得全年度經濟狀況資料成功', JSON.stringify(result), MESSAGE_TYPE_TEXT);
}

// Dashboard 聚合 action — 未來安排頁
function Action_GetDashboardFuture() {
  var memoResp = Action_GetMemoJson();
  var purchaseResp = Action_GetPurchaseList();
  var importantResp = Action_GetImportantSchedule();
  var result = {
    memo: JSON.parse(memoResp.responseMsg),
    purchase: purchaseResp.statusCode === STATUS_CODE_SUCCESS ? JSON.parse(purchaseResp.responseMsg) : [],
    importantSchedule: importantResp.statusCode === STATUS_CODE_SUCCESS ? JSON.parse(importantResp.responseMsg) : []
  };
  return new ServerResponse(STATUS_CODE_SUCCESS, '取得未來安排資料成功', JSON.stringify(result), MESSAGE_TYPE_TEXT);
}

function IsAccountingScheduleItem(content) {
  return content.startsWith("記帳 ");
}

function ParseAccountingScheduleItem(content) {
  var match = content.match(/^記帳 (.+?)\((\$\d+|\d+\$)\)(?:\((.+?)\))?$/);
  if(!match) return null;
  return { name: match[1], amount: parseInt(match[2].replace('$', '')), category: match[3] || '' };
}
// 取得所有日常時間紀錄
function Action_GetDailyTimeRecords() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_DAILY_TIME_RECORD);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_INVALID, '找不到日常時間紀錄分頁', '[]', MESSAGE_TYPE_TEXT);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '無日常時間紀錄', '[]', MESSAGE_TYPE_TEXT);
  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var records = [];
  data.forEach(function(row) {
    if (!row[0] || !row[1] || !row[2]) return;
    var dateStr = row[0] instanceof Date
      ? Utilities.formatDate(row[0], 'GMT+8', 'yyyy/MM/dd')
      : String(row[0]).trim();
    var timeStr = row[1] instanceof Date
      ? Utilities.formatDate(row[1], 'GMT+8', 'HH:mm:ss')
      : String(row[1]).trim();
    var eventType = String(row[2]).trim();
    if (dateStr && timeStr && eventType)
      records.push({ date: dateStr, time: timeStr, eventType: eventType });
  });
  return new ServerResponse(STATUS_CODE_SUCCESS, '取得日常時間紀錄成功', JSON.stringify(records), MESSAGE_TYPE_TEXT);
}

// 近期狀況 dashboard 聚合 action
function Action_GetDashboardStatus() {
  var timeRecordsResp = Action_GetDailyTimeRecords();
  var memoHistoryResp = Action_GetMemoHistory();
  var result = {
    dailyTimeRecords: JSON.parse(timeRecordsResp.responseMsg),
    memoHistory: JSON.parse(memoHistoryResp.responseMsg)
  };
  return new ServerResponse(STATUS_CODE_SUCCESS, '取得近期狀況資料成功', JSON.stringify(result), MESSAGE_TYPE_TEXT);
}

// 覆寫商場活動清單（排程任務每次整批更新，找不到分頁時自動建立）
function Action_SetMallActivities(activities) {
  if (!Array.isArray(activities))
    return new ServerResponse(STATUS_CODE_INVALID, '活動資料格式錯誤，需為陣列', '', MESSAGE_TYPE_TEXT);

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(SHEET_NAME_MALL_ACTIVITY);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_MALL_ACTIVITY);
    sheet.appendRow(['商場', '活動名稱', '起始日期', '結束日期', '更新時間']);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1)
    sheet.getRange(2, 1, lastRow - 1, 5).clearContent();

  var now = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy/MM/dd HH:mm:ss');
  var rows = activities.map(function(item) {
    return [
      String(item.mallName || '').trim(),
      String(item.activityName || '').trim(),
      String(item.startDate || '').trim(),
      String(item.endDate || '').trim(),
      now
    ];
  }).filter(function(row) { return row[0] !== '' && row[1] !== ''; });

  if (rows.length > 0)
    sheet.getRange(2, 1, rows.length, 5).setValues(rows);

  return new ServerResponse(STATUS_CODE_SUCCESS, '商場活動資料更新成功', JSON.stringify({ count: rows.length }), MESSAGE_TYPE_TEXT);
}

// 取得商場活動清單
function Action_GetMallActivities() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_MALL_ACTIVITY);
  if (!sheet)
    return new ServerResponse(STATUS_CODE_SUCCESS, '尚無商場活動資料', '[]', MESSAGE_TYPE_TEXT);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2)
    return new ServerResponse(STATUS_CODE_SUCCESS, '尚無商場活動資料', '[]', MESSAGE_TYPE_TEXT);

  var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  var results = [];
  data.forEach(function(row) {
    var mallName = String(row[COLUMN_SETTING_MALL_ACTIVITY.MallName - 1]).trim();
    var activityName = String(row[COLUMN_SETTING_MALL_ACTIVITY.ActivityName - 1]).trim();
    if (!mallName || !activityName) return;

    var startDateRaw = row[COLUMN_SETTING_MALL_ACTIVITY.StartDate - 1];
    var endDateRaw = row[COLUMN_SETTING_MALL_ACTIVITY.EndDate - 1];
    var startDate = startDateRaw instanceof Date
      ? Utilities.formatDate(startDateRaw, 'GMT+8', 'yyyy/MM/dd')
      : String(startDateRaw).trim();
    var endDate = endDateRaw instanceof Date
      ? Utilities.formatDate(endDateRaw, 'GMT+8', 'yyyy/MM/dd')
      : String(endDateRaw).trim();

    results.push({ mallName: mallName, activityName: activityName, startDate: startDate, endDate: endDate });
  });

  return new ServerResponse(STATUS_CODE_SUCCESS, '取得商場活動資料成功', JSON.stringify(results), MESSAGE_TYPE_TEXT);
}