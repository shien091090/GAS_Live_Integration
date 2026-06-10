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

  var replyContent = GetSheetItemsText(SHEET_ITEM_TYPE.ScheduleItem);
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

 // var greetingMsg = RequestChatGPT("給我一個開啟今日新的一天的祝賀語");
 // resHint += `\n${greetingMsg}`;

  var currentScheduleItems = GetSpecificCurrentSheetItems(SHEET_ITEM_TYPE.ScheduleItem);
  var matchScheduleItems = [];

  if(currentScheduleItems.length > 0) {
    var currentDay = now.getDate();
    var currentWeekNumber = parseInt(now.getDay());

    currentScheduleItems.forEach(function(scheduleItem) {
      if(CheckScheduleTypeIsValid(scheduleItem.scheduleType)) {
        if(scheduleItem.scheduleType == "每天")
          matchScheduleItems.push(scheduleItem);
        else if(scheduleItem.scheduleType == "每週" && currentWeekNumber == scheduleItem.scheduleValue)
          matchScheduleItems.push(scheduleItem);
        else if(scheduleItem.scheduleType == "每月" && currentDay == scheduleItem.scheduleValue)
          matchScheduleItems.push(scheduleItem);
      }
    });
  }

  if(matchScheduleItems.length > 0) {
    resHint += "\n已自動幫您加入以下待辦事項\n";
    var index = 1;

    matchScheduleItems.forEach(function(scheduleItem) {
      resHint += `${ConvertSymbolDigit(index)} ${scheduleItem.GetFullContent()}`;

      if(index < matchScheduleItems.length)
        resHint += '\n';

      Action_AddMemo(scheduleItem.content);

      index++;
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

  var targetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_ACCOUNTING);
  var dailyMatchRanges = GetCellsFromSearchMatchSpecificColumnValue(SHEET_NAME_ACCOUNTING, DIRECTION_CHANGE_TYPE.從下到上, COLUMN_SETTING_ACCOUNTING.Date);
  var dailyTotal = 0;
  if(dailyMatchRanges.length > 0)
  {
    var startRow = dailyMatchRanges[0].getRow();
    var endRow = dailyMatchRanges[dailyMatchRanges.length - 1].getRow();
    var values = targetSheet.getRange(startRow, COLUMN_SETTING_ACCOUNTING.Prize, endRow - startRow + 1).getValues();
    
    values.forEach(function(v) {
      dailyTotal += parseInt(v);
    });
  }

  var monthMatchRanges = GetCellsFromSearchMatchSpecificMonthValue(SHEET_NAME_ACCOUNTING, DIRECTION_CHANGE_TYPE.從下到上, COLUMN_SETTING_ACCOUNTING.Date);
  var monthlyTotal = 0;
  if(monthMatchRanges.length > 0)
  {
    var startRow = monthMatchRanges[0].getRow();
    var endRow = monthMatchRanges[monthMatchRanges.length - 1].getRow();
    var values = targetSheet.getRange(startRow, COLUMN_SETTING_ACCOUNTING.Prize, endRow - startRow + 1).getValues();
    
    values.forEach(function(v) {
      monthlyTotal += parseInt(v);
    });
  }

  var accountSuccessText = ConvertTextFormat(TEXT_TABLE_KEY_BUY_SUCCESS, [accountItemName, prize]);
  var dailyTotalText = ConvertTextFormat(TEXT_TABLE_KEY_ACCOUNTING_DAILY_TOTAL, [dailyTotal]);
  var monthlyTotalText = ConvertTextFormat(TEXT_TABLE_KEY_ACCOUNTING_MONTHLY_TOTAL, [monthlyTotal]);
  var resultReplyText = `${accountSuccessText}\n${dailyTotalText}\n${monthlyTotalText}`;

  return new ServerResponse(
    STATUS_CODE_SUCCESS,
    resultReplyText,
    '　',
    MESSAGE_TYPE_TEXT);
}

//紀錄寶寶換尿布時間
function Action_RecordDiaperChangingTime() {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_BABY_DIAPER_CHANGING);
  var lastCell = GetLastContentCell(SHEET_NAME_BABY_DIAPER_CHANGING, 1, 2);
  var targetRow = 0;
  if(lastCell.getValue() == '')
    targetRow = lastCell.getRow();
  else
    targetRow = lastCell.getRow() + 1;

  var today = new Date();
  var todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var dateCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_DIAPER_CHANGING.Date);
  dateCell.setValue(todayZero);

  var timeCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_DIAPER_CHANGING.Time);
  timeCell.setValue(today);

  var previousDateCell = targetSheet.getRange(targetRow - 1, COLUMN_SETTING_BABY_DIAPER_CHANGING.Date);
  var previousDate = Date.parse(previousDateCell.getValue());

  var summationTimes = 0;
  var summationTimesCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_DIAPER_CHANGING.SummationTimes);
  if(previousDate == Date.parse(todayZero)) {
    var previousTimesCell = targetSheet.getRange(targetRow - 1, COLUMN_SETTING_BABY_DIAPER_CHANGING.SummationTimes);
    summationTimes = previousTimesCell.getValue() + 1;
  }
  else {
    summationTimes = 1;
  }

  summationTimesCell.setValue(summationTimes);

  var averageIntervalTimeCell_hour = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_DIAPER_CHANGING.RecentAverageIntervalTime_Hour);
  var averageIntervalTimeCell_minute = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_DIAPER_CHANGING.RecentAverageIntervalTime_Minute);
  var averageIntervalTimeValue_hour = parseInt(averageIntervalTimeCell_hour.getValue());
  var averageIntervalTimeValue_minute = parseInt(averageIntervalTimeCell_minute.getValue());
  var intervalTime = `${String(averageIntervalTimeValue_hour).padStart(2, '0')}:${String(averageIntervalTimeValue_minute).padStart(2, '0')}`;

  return new ServerResponse(
  STATUS_CODE_SUCCESS,
  ConvertTextFormat(TEXT_TABLE_KEY_RECORD_BABY_DIAPER_CHANGING_TIME, [summationTimes, intervalTime]),
  '　',
  MESSAGE_TYPE_TEXT);
}

//紀錄寶寶喝奶時間
function Action_RecordEatTime(feedingAmount) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_BABY_EAT_TIME);
  var lastCell = GetLastContentCell(SHEET_NAME_BABY_EAT_TIME, 1, 2);
  var targetRow = 0;
  if(lastCell.getValue() == '')
    targetRow = lastCell.getRow();
  else
    targetRow = lastCell.getRow() + 1;

  var today = new Date();
  var todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var dateCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_EAT.Date);
  dateCell.setValue(todayZero);

  var timeCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_EAT.Time);
  timeCell.setValue(today);

  var feedingAmountCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_EAT.FeedingAmount);

  var tempFeedingAmount = 0;
  if(feedingAmount == undefined)
  {
    var previousFeedingAmountCell = targetSheet.getRange(targetRow - 1, COLUMN_SETTING_BABY_EAT.FeedingAmount);
    tempFeedingAmount = parseInt(previousFeedingAmountCell.getValue());
    
  }
  else
    tempFeedingAmount = parseInt(feedingAmount);

  feedingAmountCell.setValue(tempFeedingAmount);

  var previousDateCell = targetSheet.getRange(targetRow - 1, COLUMN_SETTING_BABY_EAT.Date);
  var previousDate = Date.parse(previousDateCell.getValue());

  var summationTimes = 0;
  var summationFeedingAmount = 0;
  if(previousDate == Date.parse(todayZero)) {
    var previousTimesCell = targetSheet.getRange(targetRow - 1, COLUMN_SETTING_BABY_EAT.SummationTimes);
    summationTimes = previousTimesCell.getValue() + 1;

    var previousFeedingAmountCell = targetSheet.getRange(targetRow - 1, COLUMN_SETTING_BABY_EAT.SummationFeedingAmount);
    summationFeedingAmount = parseInt(previousFeedingAmountCell.getValue()) + tempFeedingAmount;
  }
  else {
    summationTimes = 1;
    summationFeedingAmount = tempFeedingAmount;
  }

  var summationTimesCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_EAT.SummationTimes);
  summationTimesCell.setValue(summationTimes);

  var summationFeedingAmountCell = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_EAT.SummationFeedingAmount);
  summationFeedingAmountCell.setValue(summationFeedingAmount);

  var averageIntervalTimeCell_hour = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_EAT.RecentAverageIntervalTime_Hour);
  var averageIntervalTimeCell_minute = targetSheet.getRange(targetRow, COLUMN_SETTING_BABY_EAT.RecentAverageIntervalTime_Minute);
  var averageIntervalTimeValue_hour = parseInt(averageIntervalTimeCell_hour.getValue());
  var averageIntervalTimeValue_minute = parseInt(averageIntervalTimeCell_minute.getValue());
  var intervalTime = `${String(averageIntervalTimeValue_hour).padStart(2, '0')}:${String(averageIntervalTimeValue_minute).padStart(2, '0')}`;

  return new ServerResponse(
  STATUS_CODE_SUCCESS,
  ConvertTextFormat(TEXT_TABLE_KEY_RECORD_BABY_EAT_TIME, [tempFeedingAmount, summationTimes, summationFeedingAmount, intervalTime]),
  '　',
  MESSAGE_TYPE_TEXT);
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