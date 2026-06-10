const DATE_VALUE_TYPE = Object.freeze({
  "年":1,
  "月":2,
  "日":3,
  "禮拜":4
});

//將字串轉為日期數值
function ParseDateFromString(str) {
  var contentLength = str.length;
  if(contentLength <= 0 || str == '')
    return 0;

  var finalSucceedDate = 0;

  for(i = 1; i < contentLength + 1; i++) {
    var subStr = str.substring(0, i);
    var parseDate = new Date(subStr);

    if(isNaN(parseDate) == false)
    {
      finalSucceedDate = parseDate;
    }
  }

  if(finalSucceedDate != 0 && finalSucceedDate.getFullYear() <= 2020)
  {
    var nowYear = new Date(Date.now()).getFullYear();
    finalSucceedDate.setFullYear(nowYear);
  }

  return finalSucceedDate;
}

/*
//將字串轉為日期數值
function ParseDateFromString(str) {
  var contentLength = str.length;
  if(contentLength <= 0 || str == '')
    return 0;

  var continuousParseFailedTimes = 0;
  var finalSucceedDate;
  var nowYear = new Date(Date.now()).getFullYear();
  for(i = 1; i < contentLength + 1; i++) {
    var subStr = str.substring(0, i);
    var parseDate = Date.parse(subStr);

    if(isNaN(parseDate)) {
      continuousParseFailedTimes += 1;
    }
    else {
      var d = new Date(parseDate);

      if(d.getFullYear() < nowYear) {
        d.setFullYear(nowYear);
        parseDate = Date.parse(d);
      }

      finalSucceedDate = parseDate;
      continuousParseFailedTimes = 0;
      //console.log(`${subStr} = ${new Date(finalSucceedDate)}`);
    }

    if(continuousParseFailedTimes >= 5)
      break;
  }

  return finalSucceedDate;
}
*/

//將日期轉成簡單字串
function GetSimpleDateString(date) {
  var weekTxt = ConvertChineseNumber(Utilities.formatDate(date, "GMT+8", "u"));
  var formatDateTxt = Utilities.formatDate(date, "GMT+8", `yyyy/M/d(${weekTxt}) H:m`)
  return formatDateTxt;
}

//阿拉伯數字轉中文數字
function ConvertChineseNumber(number) {
  var parseNum = parseInt(number);
  if(parseNum > 10)
    return '';
  
  var chineseNumbers = [
    "零",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十"
  ];

  return chineseNumbers[parseNum];
}

//數字轉成符號數字
function ConvertSymbolDigit(number) {
  return `(${number})`;

  //var symbolDigits = [
  //  "⓪","①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳"
  //];

  //var symbol = symbolDigits[number]

  //if(number >= symbolDigits.length)
  //  return String(number);
  //else
  //  return symbolDigits[number];
}

//取得隨機數字
function GetRandomNumber(min, max) {
  var len = max - min + 1;

  var dice = Math.random();
  dice = (Math.floor(dice * 1000) % len) + min;

  return dice;
}

//檢查儲存格資料是否為Null
function CheckCellIsNull(cellObj) {
  return Object.getOwnPropertyNames(cellObj).length === 0;
}

//string.format
function ConvertTextFormat(formatKey, params) {
  var formatText = GetTextTableValue(formatKey);
  var replaceCount = params.length;
  for(i = 0; i < replaceCount; i++) {
    formatText = formatText.replace(`{${i}}`, params[i]);
  }

  return formatText;
}

//從"2022/1/1 週三"的日期格式中取得特定日期值
function GetDateValueFromSpecificFormat(dateType, dateStr) {
  var tempDateStr = dateStr.split(" ")[0];
  var parseDate = new Date(tempDateStr);

  if(dateType == DATE_VALUE_TYPE.年)
    return parseDate.getFullYear();
  else if(dateType == DATE_VALUE_TYPE.月)
    return parseDate.getMonth() + 1;
  else if(dateType == DATE_VALUE_TYPE.日)
    return parseDate.getDate();
  else if(dateType == DATE_VALUE_TYPE.禮拜) {
    if(parseDate.getDay() == 0)
      return 7;
    else
      return parseDate.getDay();
  }
  else
    return 0;
}

//排序value為數字的Dictionary(isOrderByDescending:從大到小排序)
function GetSortDictionary(dict, isOrderByDescending)
{
  var sortedKeys = Object.keys(dict).sort(function(a, b) {
    if(isOrderByDescending) //由大到小排序
      return dict[b] - dict[a];
    else //由小到大排序
      return dict[a] - dict[b];
  });

  var sortedDict = {};
  sortedKeys.forEach(function(key) {
    sortedDict[key] = dict[key];
  });

  return sortedDict;
}

//value為數字的Dictionary中所占比例小於指定值的項目會合併起來
function GetCombineDictionaryWhenValueSmallerThen(dict, threshold, combineKeyName)
{
  var total = 0;
  Object.values(dict).forEach(function(v){
    total += v;
  });

  var otherSum = 0;
  Object.keys(dict).forEach(function(key) {
    if (dict[key]/total <= threshold) {
      otherSum += dict[key];
      delete dict[key];
    }
  });

  dict[combineKeyName] = otherSum;

  return dict;
}