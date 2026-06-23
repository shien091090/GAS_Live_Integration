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
    if (attributeRaw !== '') resultText += `（${attributeRaw}）`;
    if (condition !== '') resultText += `，${condition}`;
    resultText += '\n';
    displayIndex++;
  });

  if (resultText === '')
    return new ServerResponse(STATUS_CODE_SUCCESS, '物品準備清單', '(空)', MESSAGE_TYPE_TEXT);

  return new ServerResponse(STATUS_CODE_SUCCESS, '物品準備清單', resultText.trim(), MESSAGE_TYPE_TEXT);
}

function IsAccountingScheduleItem(content) {
  return content.startsWith("記帳 ");
}

function ParseAccountingScheduleItem(content) {
  var match = content.match(/^記帳 (.+?)\((\$\d+|\d+\$)\)(?:\((.+?)\))?$/);
  if(!match) return null;
  return { name: match[1], amount: parseInt(match[2].replace('$', '')), category: match[3] || '' };
}