class TideData {
  constructor(date) {
    this.date = date;
    this.tides = [];
  }

  addTide(tideType, tideTime) {
    this.tides.push({type: tideType, time: tideTime});
  }

  getLog()
  {
    return `date = ${GetSimpleDateString(this.date)}, tides = \n${this.getTideLog()}`;
  }

  getTideLog()
  {
    var log = "";
    for (let i = 0; i < this.tides.length; i++) {
      log += `tideType = ${this.tides[i].type}, tideTime = ${GetSimpleDateString(this.tides[i].time)}\n`;
    }

    return log;
  }
}

function TestCombineDictionary()
{
  var dict = {};
  dict['A'] = 100;
  dict['B'] = 10;
  dict['C'] = 180;
  dict['D'] = 5;
  dict['E'] = 50;

  var total = 0;
  Object.values(dict).forEach(function(v){
    total += v;
  });

  console.log(total);

  var threshold = 0.1;
  var otherSum = 0;
  Object.keys(dict).forEach(function(key) {
    console.log(`dict[${key}]/total = ${dict[key]}/${total} = ${dict[key]/total}`);
    if (dict[key]/total <= threshold) {
      otherSum += dict[key];
      delete dict[key];
    }
  });

  dict['other'] = otherSum;

  console.log(dict);
}

function TestSortDictionary()
{
  var dict = {};
  dict['A'] = 100;
  dict['B'] = 60;
  dict['C'] = 180;
  dict['D'] = 75;

  var sortedKeys = Object.keys(dict).sort(function(a, b) {
    return dict[b] - dict[a];  // 由大到小排序
  });

  var sortedDict = {};
  sortedKeys.forEach(function(key) {
    sortedDict[key] = dict[key];
  });

  console.log(sortedDict);
}

function TestGetSearchBlankCellFromColumn()
{
  var blankCell = GetSearchBlankCellFromColumn(SHEET_NAME_ACCOUNTING_STATISTICS);
  console.log(`blank cell pos: (${blankCell.getRow()}:${blankCell.getColumn()})`);
}

function TestDictionaryAccounting()
{
  var dict = {};
  console.log(`dict['Test']: ${dict['Test']}(${dict.hasOwnProperty('Test')})`);
  dict['Test'] = 5;
  console.log(`dict['Test']: ${dict['Test']}(${dict.hasOwnProperty('Test')})`);
  dict['Test'] += 2;
  console.log(`dict['Test']: ${dict['Test']}(${dict.hasOwnProperty('Test')})`);
}

function TestAccountPieChart()
{
  var res = Action_GetAccountPieChart("13");
  res.GetLog();
}

function TestConvertCommandToDateRange()
{
  var commands = [
    "1月","5月份","8","2024/3月份","2023/10月","2022/6","2~5月份","4~10","2023/7~2024/1", "-", "哇"
  ]

  commands.forEach(function(command) {
    console.log(`command: ${command}`);
    var splitArr = command.split("~");
    if(splitArr.length > 1)
    {
      var parseDateArr = [];
      splitArr.forEach(function(str) {
        var parseDate = new Date(ParseDateFromString(str));
        var formatDateTxt = Utilities.formatDate(parseDate, "GMT+8", `yyyy/M/d`)
        parseDateArr.push(formatDateTxt);
      });

      console.log(`parse date array: ${parseDateArr}`);
    }
    else
    {
      var parseDate = new Date(ParseDateFromString(command));
      var formatDateTxt = Utilities.formatDate(parseDate, "GMT+8", `yyyy/M/d`)
      console.log(`parse date: ${formatDateTxt}`);
    }
  })
}

function TestSearchCellFromRow()
{
  var matchCell = GetSearchCellFromRow(SHEET_NAME_ACCOUNTING_STATISTICS, "2023/10月");
  console.log(`MatchCell:(${matchCell.getRow()},${matchCell.getColumn()})`)
}

function TestNullParam() {
  var res = new ServerResponse(1, "a", "b", MESSAGE_TYPE_TEXT);
  res.GetLog();

  if(res.a == undefined)
    console.log("value is undefined");
}

function TestActionRecordEatTime() {
  var res = Action_RecordEatTime(20);
  res.GetLog();
}

function TestPadStart() {
  var a = 1;
  var b = 9;
  var c = 15;

  var a1 = String(a).padStart(2, '0');
  var b1 = String(b).padStart(2, '0');
  var c1 = String(c).padStart(2, '0');

  console.log(`a = ${a1}, b = ${b1}, c = ${c1}`);
}

function TestActionRecordDiaperChangingTime() {
  var res = Action_RecordDiaperChangingTime();
  res.GetLog();
}

function TestTideData() {
  var now  = new Date();
  let tideData = new TideData(now);
  tideData.addTide("乾潮", new Date("2023/4/5"));
  tideData.addTide("滿潮", new Date("2023/4/2"));
  console.log(tideData.getLog());
}

function TestGetURLData() {
    var response = UrlFetchApp.fetch("https://www.cwb.gov.tw/V8/C/M/Fishery/tide_30day_MOD/T001009.html"),
    content = response.getContentText();
    console.log(content);

    const dateRegex = /<td id="day\d+" headers="date" rowspan="\d+">([\d\/\s\(\)\u4e00-\u9fa5]+)<br \/>\s+農曆 ([\d\/\s\(\)]+)<span class="orange-text">潮差：大<\/span><\/td>/g;
    const tideRegex = /<td headers="day\d+ tide">([\u4e00-\u9fa5]+) <i aria-hidden="true" class="icon-cwb-(height|low)"><\/i><\/td>\s+<td headers="day\d+ time">([\d:]+)<\/td>/g;

    const tides = [];
    let dateMatch;
    let tideMatch;

    while ((dateMatch = dateRegex.exec(content)) !== null) {
      const date = dateMatch[1];
      const tidesArr = [];

      while ((tideMatch = tideRegex.exec(content)) !== null) {
        if (tideMatch.index > dateRegex.lastIndex) {
          break;
        }
        const tide = {
          type: tideMatch[1],
          time: tideMatch[3],
        };
        tidesArr.push(tide);
      }

      const tide = new Tide(date, tidesArr);
      tides.push(tide);
    }

    console.log(tides);
}

function TestFindKeyAtWholeColumn() {
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_ACCOUNTING);
  var columnIndex = 0;
  var searchKey = "2022/10";
  var cells = targetSheet.getRange(`C[${columnIndex}]`)
  var finder = cells.createTextFinder(searchKey);

  var allMatchRange = finder.findAll();
  allMatchRange.forEach(function(r) {
    console.log(`(${r.getRow()}, ${r.getColumn()})`);
  });
  
}

function TestGetTextTableValue() {
  var textTableValue = GetTextTableValue("ACTION_REMOVE_MEMO_INVALID_NUMBER");
  console.log(`textTableValue = ${textTableValue}`);
}

function TestDummyContents() {
  var dummyContents = GetDummyFullMemoContentArray(
    DUMMY_TIME_CONTENT_TYPE.ShortFormat | DUMMY_TIME_CONTENT_TYPE.NoExistDate,
    DUMMY_MEMO_CONTENT_TYPE.SimpleCharacter | DUMMY_MEMO_CONTENT_TYPE.SimpleChenese | DUMMY_MEMO_CONTENT_TYPE.SpecielSymbol);
  console.log(dummyContents);
}

function TestDice() {
  var dict = {};
  var min = 0;
  var max = 10;
  var loopTimes = 10000;
  for(var i = min; i <= max; i++) {
    dict[i.toString()] = 0;
  }

  console.log(dict);

  for(var i = 0; i <= loopTimes; i++) {
    var dice = GetRandomNumber(min, max);
    var key = dice.toString();

    if(key in dict)
      dict[key]++;
    else
      dict[key] = 1;

  }

  console.log(dict);
}

function TestCheckScheduleParamIsValid() {
  testArr = [
    ['每月', 30],
    ['每月', 32],
    ['每月', 0],
    ['每週', 0],
    ['每週', 2],
    ['每週', 8],
    ['每天', 0],
    ['每天', 5],
    ['每天', 24],
    ['每年', 0],
    ['每年', 1],
    ['每年', 6],
    ['每年', 12],
    ['每年', 13],
    ['每', 4],
    ['Test', 10]
  ];

  testArr.forEach(function(paramArr){
    console.log(`Param = ${paramArr[0]}, ${paramArr[1]}, IsValid = ${CheckScheduleParamIsValid(paramArr[0], paramArr[1])}`);
  });

}

function TestConvertStringToDate() {
  var d1 = "阿1/1 hkoo";
  var dateValue = ParseDateFromString(d1);

  if(dateValue == 0) {
    console.log("Parse Failed")
  }
  else
  {
    var parseD1 = new Date(dateValue);
    console.log(parseD1.toString());
  }
}

function TestFomatDateString() {
  var now  = new Date();
  var weekTxt = ConvertChineseNumber(Utilities.formatDate(now, "GMT+8", "u"));
  var formatDateTxt = Utilities.formatDate(now, "GMT+8", `yyyy/M/d(${weekTxt}) H:m`)
  console.log(formatDateTxt);

}

function TestActionAddMemo(){
  var addContentArr = GetDummyFullMemoContentArray(
    DUMMY_TIME_CONTENT_TYPE.None,
    DUMMY_MEMO_CONTENT_TYPE.SimpleCharacter|DUMMY_MEMO_CONTENT_TYPE.SimpleChenese|DUMMY_MEMO_CONTENT_TYPE.SimpleJapanese);

  var dice = GetRandomNumber(0, addContentArr.length - 1);
  var res = Action_AddMemo(addContentArr[dice]);
  res.GetLog();
}

function TestActionRemoveMemo(){
  var res = Action_RemoveMemo("6");
  res.GetLog();
}

function TestActionModifyMemo() {
  var res = Action_ModifyMemo(3, "1/5 haskey");
  res.GetLog();
}

function TestActionGetMemoList() {
  var res = Action_GetMemo();
  res.GetLog();
}

function TestActionAddScheduleItem() {
  var addContentArr = GetDummyFullMemoContentArray(
    DUMMY_TIME_CONTENT_TYPE.ShortFormat,
    DUMMY_MEMO_CONTENT_TYPE.SimpleCharacter|DUMMY_MEMO_CONTENT_TYPE.SimpleChenese|DUMMY_MEMO_CONTENT_TYPE.SimpleJapanese|DUMMY_MEMO_CONTENT_TYPE.SpecielSymbol);

  var dice = GetRandomNumber(0, addContentArr.length - 1);

  var res = Action_AddSchedule("每月", 3, addContentArr[dice]);
  res.GetLog();
}

function TestActionRemoveScheduleItem() {
  var res = Action_RemoveSchedule(1);
  res.GetLog();
}

function TestActionModifyScheduleItem() {
  var addContentArr = GetDummyFullMemoContentArray(
    DUMMY_TIME_CONTENT_TYPE.None,
    DUMMY_MEMO_CONTENT_TYPE.SimpleCharacter|DUMMY_MEMO_CONTENT_TYPE.SimpleChenese|DUMMY_MEMO_CONTENT_TYPE.SimpleJapanese|DUMMY_MEMO_CONTENT_TYPE.SpecielSymbol);

  var dice = GetRandomNumber(0, addContentArr.length - 1);
  var newContent = addContentArr[dice];
  console.log(`New Content = ${newContent}`);

  var res = Action_ModifySchedule(4, "每月", 20, newContent);
  res.GetLog();
}

function TestGetScheduleList() {
  var res = Action_GetSchedule();
  res.GetLog();
}

function TestDailyRemind() {
  var res = Action_DailyScheduler();
  res.GetLog();
}

function TestActionBuy() {
  var res = Action_Buy("菜瓜布", 1500);
  res.GetLog();
}

function TestActionBuyWithBudgetType() {
  var res = Action_Buy("菜瓜布", 1200, '餐費');
  res.GetLog();
}

function TestStringForamt() {
  var params = ["AAA"];
  var t = ConvertTextFormat("a", params);
  console.log(t);
}

function TestIsAccountingScheduleItem() {
  var s = "記帳 PixelLabT1訂閱($398)";
  console.log(IsAccountingScheduleItem(s));
}