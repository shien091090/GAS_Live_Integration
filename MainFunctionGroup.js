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

  if(currentCell.isBlank())
  {
    targetDateCell.setValue('');
  }
  else
  {
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

  if(budgetType != ''){
    var budgetTypeCell = targetSheet.getRange(targetRow, COLUMN_SETTING_ACCOUNTING.BudgetType);
    budgetTypeCell.setValue(budgetType);
  }
  
  SpreadsheetApp.getActiveSheet().setActiveSelection(accountItemCell);
  OnAnyCellValueChanged();
}

//取得某分頁某欄的最後一個非空格的格子
function GetLastContentCell(sheetName, columnNumber, startRow = 1) {
  if(sheetName.constructor != String || columnNumber.constructor != Number)
  return;

  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var startCell = targetSheet.getRange(startRow, columnNumber);

  var secondCell = startCell.offset(1, 0);
  var lastRow = 0;
  if(secondCell.getValue() == '')
    lastRow = startCell.getRow();
  else
    lastRow = startCell.getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow();

  var targetCell = targetSheet.getRange(lastRow, columnNumber);
  //console.log(`GetLastContentCell = ${targetCell.getA1Notation()}`);
  return targetCell;
}

//搜尋特定欄取得符合的儲存格位置
function GetSearchCellFromColumn(sheetName, searchKey, columnIndex = 0) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var cells = targetSheet.getRange(`C[${columnIndex}]`)
  var finder = cells.createTextFinder(searchKey)

  var allMatchRange = finder.findAll();

  if(allMatchRange.length > 0)
    return allMatchRange[0];
  else
    return {};
}

//搜尋特定列取得符合的儲存格位置
function GetSearchCellFromRow(sheetName, searchKey, rowIndex = 0) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var cells = targetSheet.getRange(`R[${rowIndex}]`)
  var finder = cells.createTextFinder(searchKey)

  var allMatchRange = finder.findAll();

  if(allMatchRange.length > 0)
    return allMatchRange[0];
  else
    return undefined;
}

//搜尋特定欄裡的第一個空白儲存格位置
function GetSearchBlankCellFromColumn(sheetName, columnIndex = 1) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var cells = targetSheet.getRange(`C[${columnIndex}]`)
  var values = cells.getValues();
  
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === "") {
      var matchBlankCell = targetSheet.getRange(i + 1, columnIndex);
      return matchBlankCell; // 返回第一個空格子的行數
    }
  }
  
  return null;
}

//取得指定工作表類型的項目列表
function GetSpecificCurrentSheetItems(sheetItemType, showLog = false){
  
  var sheetItems = [];
  
  switch(sheetItemType) {
    case SHEET_ITEM_TYPE.DailyMemoItem:
      sheetItems = GetSheetItems(SHEET_NAME_DAILY_MEMO, COLUMN_SETTING_DAILY_MEMO.MemoNumber, sheetItemType);
      break;

    case SHEET_ITEM_TYPE.ScheduleItem:
      sheetItems = GetSheetItems(SHEET_NAME_SCHEDULE, COLUMN_SETTING_SCHEDULE.ScheduleNumber, sheetItemType);
      break;
  }

  if(sheetItems.length >= 0 && showLog){
    sheetItems.forEach(function(item){
      console.log(item.GetLog());
    });
  }

  return sheetItems;
}

//取得指定工作表項目列表
function GetSheetItems(sheetName, lastNumberColumn, sheetItemType, defaultLastCellColumn = 1, defaultLastCellRow = 2) {
  var lastCell = GetLastContentCell(sheetName, defaultLastCellColumn, defaultLastCellRow);
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var lastNumer = targetSheet.getRange(lastCell.getRow(), lastNumberColumn).getValue();
  var sheetItemList = [];
  if(lastNumer == 0)
    return sheetItemList;

  var columnSettingArr = [];
  switch(sheetItemType) {
    case SHEET_ITEM_TYPE.DailyMemoItem:
      columnSettingArr = Object.values(COLUMN_SETTING_DAILY_MEMO);
      break;

    case SHEET_ITEM_TYPE.ScheduleItem:
      columnSettingArr = Object.values(COLUMN_SETTING_SCHEDULE);
      break;
  }

  var searchRow = lastCell.getRow() - (lastNumer - 1);
  while(targetSheet.getRange(searchRow, defaultLastCellColumn).getValue() != '')
  {
    var params = [];
    columnSettingArr.forEach(function(columnValue) {
      var cellValue = targetSheet.getRange(searchRow, columnValue).getValue();
      params.push(cellValue);
    });
    
    var sheetItem = {};
    switch(sheetItemType) {
      case SHEET_ITEM_TYPE.DailyMemoItem:
        sheetItem = new MemoElement(params);
        break;

      case SHEET_ITEM_TYPE.ScheduleItem:
        sheetItem = new ScheduleElement(params);
        break;
    }

    sheetItemList.push(sheetItem);

    searchRow += 1;
  }

/*
  console.log(`GetSheetItems(sheetName = ${sheetName}, lastNumberColumn = ${lastNumberColumn}, sheetItemType = ${sheetItemType}, defaultLastCellColumn = ${defaultLastCellColumn}, defaultLastCellRow = ${defaultLastCellRow}):`);
  sheetItemList.forEach(function(sheetItem) {
    console.log(sheetItem.GetLog());
  });

  console.log(GetSheetItemsText(sheetItemList));
*/

  return sheetItemList;
}

//取得從上到下或從下到上搜尋符合某一欄位值的複數儲存格
function GetCellsFromSearchMatchSpecificColumnValue(sheetName, compareDirectionType, specificColumnIndex, defaultStartRow = 2) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var startCell = {};

  if(compareDirectionType == DIRECTION_CHANGE_TYPE.從上到下)
    startCell = targetSheet.getRange(defaultStartRow, specificColumnIndex);
  else if(compareDirectionType == DIRECTION_CHANGE_TYPE.從下到上)
    startCell = GetLastContentCell(sheetName, specificColumnIndex, defaultStartRow);
  else
    return [];

  var searchKey = startCell.getDisplayValue();
  var cells = targetSheet.getRange(`C[${specificColumnIndex - 1}]`)
  var finder = cells.createTextFinder(searchKey);
  var allMatchRanges = finder.findAll();

  console.log(`SearchKey = ${searchKey}`);
  allMatchRanges.forEach(function(r){
    console.log(`row = ${r.getRow()}, column = ${r.getColumn()} value = ${parseInt(r.getValue())}`);
  });

  return allMatchRanges;
}

//取得從上到下或從下到上搜尋符合某一欄位月份的複數儲存格
function GetCellsFromSearchMatchSpecificMonthValue(sheetName, compareDirectionType, specificColumnIndex, defaultStartRow = 2) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var startCell = {};

  if(compareDirectionType == DIRECTION_CHANGE_TYPE.從上到下)
    startCell = targetSheet.getRange(defaultStartRow, specificColumnIndex);
  else if(compareDirectionType == DIRECTION_CHANGE_TYPE.從下到上)
    startCell = GetLastContentCell(sheetName, specificColumnIndex, defaultStartRow);
  else
    return [];

  var dateStr = startCell.getDisplayValue();
  var yearStr = GetDateValueFromSpecificFormat(DATE_VALUE_TYPE.年, dateStr);
  var monthStr = GetDateValueFromSpecificFormat(DATE_VALUE_TYPE.月, dateStr).toString().padStart(2, '0');
  var searchKey = `${yearStr}/${monthStr}`;
  var cells = targetSheet.getRange(`C[${specificColumnIndex - 1}]`)
  var finder = cells.createTextFinder(searchKey);
  var allMatchRanges = finder.findAll();

  console.log(`SearchKey = ${searchKey}`);
  allMatchRanges.forEach(function(r){
    console.log(`row = ${r.getRow()}, column = ${r.getColumn()} value = ${parseInt(r.getValue())}`);
    
  });

  return allMatchRanges;
}

//取得最下方格子的值
function GetNewestCellValue(sheetName, targetColumn, startRow = 2)
{
  var lastCell = GetLastContentCell(sheetName, targetColumn, startRow);
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var lastValue = targetSheet.getRange(lastCell.getRow(), targetColumn).getValue();
  return lastValue;
}

//取得工作表項目清單內容字串
function GetSheetItemsText(sheetItemType)
{
  var sheetItemTxt = '';

  switch(sheetItemType) {
    case SHEET_ITEM_TYPE.DailyMemoItem:
      var dailyMemoItems = GetSpecificCurrentSheetItems(sheetItemType);

      dailyMemoItems.forEach(function(item) {
        sheetItemTxt += `${ConvertSymbolDigit(item.number)} ${item.content}\n`;
      });

    break;

    case SHEET_ITEM_TYPE.ScheduleItem:
      var scheduleItems = GetSpecificCurrentSheetItems(sheetItemType);

      scheduleItems.forEach(function(item) {
        sheetItemTxt += `${item.number}. ${item.GetFullContent()}\n`;
      });
    break;
  }

  return sheetItemTxt;
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

    case "每天": //目前每天固定時間推播, 無法指定幾點
    validRange = [0, 999];
    break;
    
  }

  return validRange;
}

//排序清單項目
function SortSheetItems(itemList, sheetItemType){

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
function SortMemoItems(memoItems)
{
  memoItems.sort(function(m1, m2) {
    var m1SpecialKeyValue = 0;
    var m2SpecialKeyValue = 0;
    var sortKeyWords = Object.getOwnPropertyNames(CONTENT_SORT_KEY_WORD);
    sortKeyWords.forEach(function(keyWord) {
      
      if(String(m1.content).indexOf(keyWord) == 0)
        m1SpecialKeyValue = CONTENT_SORT_KEY_WORD[keyWord];

      if(String(m2.content).indexOf(keyWord) == 0)
        m2SpecialKeyValue = CONTENT_SORT_KEY_WORD[keyWord];

    })

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
function SortScheduleItems(scheduleItems)
{
  scheduleItems.sort(function(s1, s2) {
    var s1TypeNameValue = 0;
    var s2TypeNameValue = 0;
    var sortKeyWords = Object.getOwnPropertyNames(SCHEDULE_TYPE);
    sortKeyWords.forEach(function(keyWord) {
      if(String(s1.content).indexOf(keyWord) == 0)
        s1TypeNameValue = SCHEDULE_TYPE[keyWord];

      if(String(s2.content).indexOf(keyWord) == 0)
        s2TypeNameValue = SCHEDULE_TYPE[keyWord];

    })

    if(s1TypeNameValue > s2TypeNameValue)
      return -1;
    else if(s1TypeNameValue < s2TypeNameValue)
      return 1;
    else if(s1TypeNameValue == s2TypeNameValue && s1TypeNameValue != 0)
      return 0;

  });

}

//更新各項清單項目編號
function UpdateSheetItemsNumber(itemList) {
  if(itemList.length <= 0)
    return;

  for(i = 0; i < itemList.length; i++)
  {
    var parseNumber = parseInt(itemList[i].number);
    if(isNaN(parseNumber))
      continue;

    itemList[i].number = i + 1;
  }
}

//更新清單項目ID
function UpdateSheetItemsID(itemList, sheetName, defaultItemIdCellColumn = 1, defaultStartCellRow = 2) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var lastCell = GetLastContentCell(sheetName, defaultItemIdCellColumn, defaultStartCellRow);

  var newMemoItemId = lastCell.getValue() + 1;

  for(i = 0; i < itemList.length; i++)
  {
    var parseId = parseInt(itemList[i].id);
    if(isNaN(parseId))
      continue;

    itemList[i].id = newMemoItemId;
  }
}

//更新清單項目總數量
function UpdateSheetItemTotalCount(itemList) {
  if(itemList.length <= 0)
    return;

  for(i = 0; i < itemList.length; i++)
  {
    var parseTotalCount = parseInt(itemList[i].totalCount);
    if(isNaN(parseTotalCount))
      continue;

    itemList[i].totalCount = itemList.length;
  }
}

//新增清單到工作表
function AddItemToSheet(sheetName, addItems, sheetItemType, defaultItemIdCellColumn = 1, defaultStartCellRow = 2)
{
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var lastCell = GetLastContentCell(sheetName, defaultItemIdCellColumn, defaultStartCellRow);
  var startRow = 0;
  if(lastCell.getValue() == '')
    startRow = lastCell.getRow();
  else
    startRow = lastCell.getRow() + 1;

  if(addItems.length <= 0)
  {
    var addCell_id = targetSheet.getRange(startRow, defaultItemIdCellColumn);
    addCell_id.setValue(lastCell.getValue());
    return;
  }

  var columnSettingArr = [];
  switch(sheetItemType) {
    case SHEET_ITEM_TYPE.DailyMemoItem:
      columnSettingArr = Object.values(COLUMN_SETTING_DAILY_MEMO);
      break;

    case SHEET_ITEM_TYPE.ScheduleItem:
      columnSettingArr = Object.values(COLUMN_SETTING_SCHEDULE);
      break;
  }

  addItems.forEach(function(item) {

    var index = 0;

    columnSettingArr.forEach(function(columnIndex){
      var cell = targetSheet.getRange(startRow, columnIndex);
      var param = item.GetParam(index);
      cell.setValue(param);

      index++;
    });

    startRow++;

  });

}

class MemoElement
{
  
  /*
  constructor(memoId, memoNumber, modifyTime, content, totalMemoCount) {
    this.memoId = memoId;
    this.memoNumber = memoNumber;
    this.modifyTime = modifyTime;
    this.content = content;
    this.totalMemoCount = totalMemoCount;
  }
  */
  
  constructor(params) {
    this.id = params[0];
    this.number = params[1];
    this.modifyTime = params[2];
    this.content = params[3];
    this.totalCount = params[4];
  }

  GetLog()
  {
    return `id = ${this.id}, number = ${this.number}, modifyTime = ${this.modifyTime}, content = ${this.content}, totalCount = ${this.totalCount}`;
  }

  GetParam(index) {
    var params = [this.id, this.number, this.modifyTime, this.content, this.totalCount];
    return params[index];
  }
}

class ScheduleElement
{
  /*
  constructor(scheduleId, scheduleNumber, modifyTime, content, scheduleType, scheduleValue, totalScheduleCount) {
    this.scheduleId = scheduleId;
    this.scheduleNumber = scheduleNumber;
    this.modifyTime = modifyTime;
    this.content = content;
    this.scheduleType = scheduleType;
    this.scheduleValue = scheduleValue;
    this.totalScheduleCount = totalScheduleCount;
  }
  */

  constructor(params) {
    this.id = params[0];
    this.number = params[1];
    this.modifyTime = params[2];
    this.content = params[3];
    this.scheduleType = params[4];
    this.scheduleValue = params[5];
    this.totalCount = params[6];
  }

  GetLog()
  {
    return `id = ${this.id}, number = ${this.number}, modifyTime = ${this.modifyTime}, content = ${this.content}, scheduleType = ${this.scheduleType}, scheduleValue = ${this.scheduleValue}, totalCount = ${this.totalCount}`;
  }

  GetParam(index) {
    var params = [this.id, this.number, this.modifyTime, this.content, this.scheduleType, this.scheduleValue, this.totalCount];
    return params[index];
  }

  GetFullContent() {
    if(this.scheduleType == "每天")
      return `每天 ${this.content}`;
    else if(this.scheduleType == "每週") {
      if(this.scheduleValue == 7)
        return `每週 禮拜日 ${this.content}`;
      else
        return `每週 禮拜${ConvertChineseNumber(this.scheduleValue)} ${this.content}`;
    }
    else
      return `${this.scheduleType} ${this.scheduleValue}號 ${this.content}`;
  }
}