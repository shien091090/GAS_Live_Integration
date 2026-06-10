const DUMMY_TIME_CONTENT_TYPE = Object.freeze({
  None:0,
  ShortFormat:1,
  LongFormat:2,
  NoExistDate:4,
  Chinese:8,
  IrregularFormat:16
});

const DUMMY_MEMO_CONTENT_TYPE = Object.freeze({
  None:0,
  SimpleCharacter:1,
  SimpleChenese:2,
  SimpleJapanese:4,
  SpecielSymbol:8,
  WithBlank:16
});

function GetDummyTimeContentArray(containType) {

  var dummyTimeContents = [];

  if((containType & DUMMY_TIME_CONTENT_TYPE.ShortFormat) == DUMMY_TIME_CONTENT_TYPE.ShortFormat) {
    dummyTimeContents.push("1/1");
    dummyTimeContents.push("3/13");
  }

  if((containType & DUMMY_TIME_CONTENT_TYPE.LongFormat) == DUMMY_TIME_CONTENT_TYPE.LongFormat) {
    dummyTimeContents.push("2021/11/18");
    dummyTimeContents.push("2022/9/14");
  }

  if((containType & DUMMY_TIME_CONTENT_TYPE.NoExistDate) == DUMMY_TIME_CONTENT_TYPE.NoExistDate) {
    dummyTimeContents.push("13/18");
    dummyTimeContents.push("2/31");
  }

  if((containType & DUMMY_TIME_CONTENT_TYPE.Chinese) == DUMMY_TIME_CONTENT_TYPE.Chinese) {
    dummyTimeContents.push("三月五日");
    dummyTimeContents.push("八月二十五日");
  }

  if((containType & DUMMY_TIME_CONTENT_TYPE.IrregularFormat) == DUMMY_TIME_CONTENT_TYPE.IrregularFormat) {
    dummyTimeContents.push("007/025");
    dummyTimeContents.push("9.12");
  }

  return dummyTimeContents;
}

function GetDummyMemoElementArray(containType) {

  var dummyMemoContents = [];

  if((containType & DUMMY_MEMO_CONTENT_TYPE.SimpleCharacter) == DUMMY_MEMO_CONTENT_TYPE.SimpleCharacter) {
    dummyMemoContents.push("asobou");
    dummyMemoContents.push("GotoGameJam");
  }

  if((containType & DUMMY_MEMO_CONTENT_TYPE.SimpleChenese) == DUMMY_MEMO_CONTENT_TYPE.SimpleChenese) {
    dummyMemoContents.push("跑步");
    dummyMemoContents.push("買衛生紙");
  }

  if((containType & DUMMY_MEMO_CONTENT_TYPE.SimpleJapanese) == DUMMY_MEMO_CONTENT_TYPE.SimpleJapanese) {
    dummyMemoContents.push("木を伐ります");
    dummyMemoContents.push("ロードローラーをつぶす");
  }

  if((containType & DUMMY_MEMO_CONTENT_TYPE.SpecielSymbol) == DUMMY_MEMO_CONTENT_TYPE.SpecielSymbol) {
    dummyMemoContents.push("↔◎Ⓙ♂☝");
  }

  if((containType & DUMMY_MEMO_CONTENT_TYPE.WithBlank) == DUMMY_MEMO_CONTENT_TYPE.WithBlank) {
    dummyMemoContents.push("在三倍金剛 亞瑟王 福祿壽 贏得 SuperWin 以上贏分");
    dummyMemoContents.push("獲得 一般廳 威力卡+  1張");
  }

  return dummyMemoContents;
}

function GetDummyFullMemoContentArray(timeType, memoElementType) {
  var timeContentArr = GetDummyTimeContentArray(timeType);
  var memoElementArr = GetDummyMemoElementArray(memoElementType);
  var combineArr = [];

  if(timeContentArr.length > 0 && memoElementArr.length > 0) {

    timeContentArr.forEach(function(timeContent) {
      
      memoElementArr.forEach(function(memoElement) {

        combineArr.push(`${timeContent} ${memoElement}`);

      });
    });
  }
  else {
    var tempArr = [];
    if(timeContentArr.length > 0)
      tempArr = timeContentArr;
    else if(memoElementArr.length > 0)
      tempArr = memoElementArr;
    
    if(tempArr.length > 0) {
      tempArr.forEach(function(contentElement) {
        combineArr.push(contentElement);
      });
    }
  }
  
  return combineArr;
  
}

function GetDummyBuyTexts() {

  var dummyBuys = [
    '晚餐 200',
    '午餐200',
    '晚餐 那個鍋 300',
    '晚餐 八方500',
    '早餐 二十',
    '垃圾袋',
    '8787 150',
    '網購 除濕袋 800',
    '網購 小狗碗 *2 800',
    '網購 冷氣',
    '網購',
    '網購 網購 1000',
  ];

  return dummyBuys;
}