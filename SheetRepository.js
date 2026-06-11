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

  for(var i = 0; i < values.length; i++) {
    if(values[i][0] === "") {
      var matchBlankCell = targetSheet.getRange(i + 1, columnIndex);
      return matchBlankCell;
    }
  }

  return null;
}

//取得指定工作表類型的項目列表
function GetSpecificCurrentSheetItems(sheetItemType, showLog = false) {
  var sheetItems = [];

  switch(sheetItemType) {
    case SHEET_ITEM_TYPE.DailyMemoItem:
      sheetItems = GetSheetItems(SHEET_NAME_DAILY_MEMO, COLUMN_SETTING_DAILY_MEMO.MemoNumber, sheetItemType);
      break;

    case SHEET_ITEM_TYPE.ScheduleItem:
      sheetItems = GetSheetItems(SHEET_NAME_SCHEDULE, COLUMN_SETTING_SCHEDULE.ScheduleNumber, sheetItemType);
      break;
  }

  if(sheetItems.length >= 0 && showLog) {
    sheetItems.forEach(function(item) {
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
  while(targetSheet.getRange(searchRow, defaultLastCellColumn).getValue() != '') {
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
  allMatchRanges.forEach(function(r) {
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
  allMatchRanges.forEach(function(r) {
    console.log(`row = ${r.getRow()}, column = ${r.getColumn()} value = ${parseInt(r.getValue())}`);
  });

  return allMatchRanges;
}

//取得最下方格子的值
function GetNewestCellValue(sheetName, targetColumn, startRow = 2) {
  var lastCell = GetLastContentCell(sheetName, targetColumn, startRow);
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var lastValue = targetSheet.getRange(lastCell.getRow(), targetColumn).getValue();
  return lastValue;
}

//取得工作表項目清單內容字串
function GetSheetItemsText(sheetItemType) {
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

//更新各項清單項目編號
function UpdateSheetItemsNumber(itemList) {
  if(itemList.length <= 0)
    return;

  for(i = 0; i < itemList.length; i++) {
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

  for(i = 0; i < itemList.length; i++) {
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

  for(i = 0; i < itemList.length; i++) {
    var parseTotalCount = parseInt(itemList[i].totalCount);
    if(isNaN(parseTotalCount))
      continue;

    itemList[i].totalCount = itemList.length;
  }
}

//新增清單到工作表
function AddItemToSheet(sheetName, addItems, sheetItemType, defaultItemIdCellColumn = 1, defaultStartCellRow = 2) {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var lastCell = GetLastContentCell(sheetName, defaultItemIdCellColumn, defaultStartCellRow);
  var startRow = 0;
  if(lastCell.getValue() == '')
    startRow = lastCell.getRow();
  else
    startRow = lastCell.getRow() + 1;

  if(addItems.length <= 0) {
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

    columnSettingArr.forEach(function(columnIndex) {
      var cell = targetSheet.getRange(startRow, columnIndex);
      var param = item.GetParam(index);
      cell.setValue(param);
      index++;
    });

    startRow++;
  });
}
