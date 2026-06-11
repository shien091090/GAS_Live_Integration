function OnAnyCellValueChanged() {
  console.log('OnAnyCellValueChanged');
  if(IS_AUTO_SET_DATE)
    AutoWriteInDateWhenAddItem()
}

//在記新的帳時自動填入當下時間
function AutoWriteInDateWhenAddItem() {
  var activeSheet = SpreadsheetApp.getActiveSheet();
  var currentSheetName = activeSheet.getName();

  if(currentSheetName != SHEET_NAME_ACCOUNTING)
    return;

  var currentSelection = activeSheet.getSelection();
  var currentCell = currentSelection.getCurrentCell();

  if(currentCell.getColumn() != COLUMN_SETTING_ACCOUNTING.AccountingContent)
    return;

  var targetRow = currentCell.getRow();
  var targetDateCell = activeSheet.getRange(targetRow, COLUMN_SETTING_ACCOUNTING.Date);

  if(currentCell.isBlank()) {
    targetDateCell.setValue('');
  } else {
    var today = new Date();
    var todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    targetDateCell.setValue(todayZero);
  }
}

//新增一筆記帳項目
function KeepAccount(accountItemName, prize, budgetType = '') {
  if(accountItemName.constructor != String || prize.constructor != Number)
    return;

  var targetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_ACCOUNTING);
  var startCell = targetSheet.getRange(1, COLUMN_SETTING_ACCOUNTING.AccountingContent);
  var targetRow = startCell.getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() + 1;

  var accountItemCell = targetSheet.getRange(targetRow, COLUMN_SETTING_ACCOUNTING.AccountingContent);
  accountItemCell.setValue(accountItemName);

  var prizeCell = targetSheet.getRange(targetRow, COLUMN_SETTING_ACCOUNTING.Prize);
  prizeCell.setValue(prize);

  if(budgetType != '') {
    var budgetTypeCell = targetSheet.getRange(targetRow, COLUMN_SETTING_ACCOUNTING.BudgetType);
    budgetTypeCell.setValue(budgetType);
  }

  SpreadsheetApp.getActiveSheet().setActiveSelection(accountItemCell);
  OnAnyCellValueChanged();
}

//檢查週期類別名稱是否有效
function CheckScheduleTypeIsValid(scheduleTypeName) {
  scheduleTypeNames = [];
  scheduleTypeNames = Object.keys(SCHEDULE_TYPE);
  return scheduleTypeNames.includes(scheduleTypeName);
}

//檢查週期值是否有效
function CheckScheduleValueIsValid(scheduleTypeName, scheduleNumber) {
  if(CheckScheduleTypeIsValid(scheduleTypeName) == false)
    return false;

  var validRange = GetValidScheduleValueRange(scheduleTypeName);
  return validRange[0] <= scheduleNumber && scheduleNumber <= validRange[1];
}

//返回週期值有效範圍
function GetValidScheduleValueRange(scheduleTypeName) {
  var validRange = [];

  switch(scheduleTypeName) {
    case "每月":
      validRange = [1, 31];
      break;

    case "每週":
      validRange = [1, 7];
      break;

    case "每天":
      validRange = [0, 999];
      break;
  }

  return validRange;
}

//排序清單項目
function SortSheetItems(itemList, sheetItemType) {
  switch(sheetItemType) {
    case SHEET_ITEM_TYPE.DailyMemoItem:
      SortMemoItems(itemList);
      break;

    case SHEET_ITEM_TYPE.ScheduleItem:
      SortScheduleItems(itemList);
      break;
  }
}

//排序&更新清單項目
function SortAndUpdateSheetItems(itemList, sheetItemType) {
  switch(sheetItemType) {
    case SHEET_ITEM_TYPE.DailyMemoItem:
      SortSheetItems(itemList, SHEET_ITEM_TYPE.DailyMemoItem);
      UpdateSheetItemsNumber(itemList);
      UpdateSheetItemsID(itemList, SHEET_NAME_DAILY_MEMO, COLUMN_SETTING_DAILY_MEMO.MemoItemId);
      UpdateSheetItemTotalCount(itemList);
      break;

    case SHEET_ITEM_TYPE.ScheduleItem:
      SortSheetItems(itemList, SHEET_ITEM_TYPE.ScheduleItem);
      UpdateSheetItemsNumber(itemList);
      UpdateSheetItemsID(itemList, SHEET_NAME_SCHEDULE, COLUMN_SETTING_SCHEDULE.ScheduleItemId);
      UpdateSheetItemTotalCount(itemList);
      break;
  }
}

//排序待辦事項清單
function SortMemoItems(memoItems) {
  memoItems.sort(function(m1, m2) {
    var m1SpecialKeyValue = 0;
    var m2SpecialKeyValue = 0;
    var sortKeyWords = Object.getOwnPropertyNames(CONTENT_SORT_KEY_WORD);
    sortKeyWords.forEach(function(keyWord) {
      if(String(m1.content).indexOf(keyWord) == 0)
        m1SpecialKeyValue = CONTENT_SORT_KEY_WORD[keyWord];

      if(String(m2.content).indexOf(keyWord) == 0)
        m2SpecialKeyValue = CONTENT_SORT_KEY_WORD[keyWord];
    });

    if(m1SpecialKeyValue > m2SpecialKeyValue)
      return -1;
    else if(m1SpecialKeyValue < m2SpecialKeyValue)
      return 1;
    else if(m1SpecialKeyValue == m2SpecialKeyValue && m1SpecialKeyValue != 0)
      return 0;

    var m1Date = ParseDateFromString(String(m1.content));
    var m2Date = ParseDateFromString(String(m2.content));

    if(m1Date > 0 && m2Date == 0)
      return -1;
    else if(m1Date == 0 && m2Date > 0)
      return 1;
    else if(m1Date == 0 && m2Date == 0)
      return 0;

    if(m1Date < m2Date)
      return -1;
    else if(m1Date > m2Date)
      return 1;
    else
      return 0;
  });
}

//排序週期行程清單
function SortScheduleItems(scheduleItems) {
  scheduleItems.sort(function(s1, s2) {
    var s1TypeNameValue = 0;
    var s2TypeNameValue = 0;
    var sortKeyWords = Object.getOwnPropertyNames(SCHEDULE_TYPE);
    sortKeyWords.forEach(function(keyWord) {
      if(String(s1.content).indexOf(keyWord) == 0)
        s1TypeNameValue = SCHEDULE_TYPE[keyWord];

      if(String(s2.content).indexOf(keyWord) == 0)
        s2TypeNameValue = SCHEDULE_TYPE[keyWord];
    });

    if(s1TypeNameValue > s2TypeNameValue)
      return -1;
    else if(s1TypeNameValue < s2TypeNameValue)
      return 1;
    else if(s1TypeNameValue == s2TypeNameValue && s1TypeNameValue != 0)
      return 0;
  });
}
