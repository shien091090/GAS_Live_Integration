const IS_AUTO_SET_DATE = true;
const SHEET_NAME_ACCOUNTING = '記帳';
const SHEET_NAME_DAILY_MEMO = '每日待辦事項'
const SHEET_NAME_SCHEDULE = '週期行程'
const SHEET_NAME_COST_TABLE = '花費統計';
const SHEET_NAME_TEXT_TABLE = '字表';
const SHEET_NAME_BABY_DIAPER_CHANGING = '寶寶換尿布時間紀錄';
const SHEET_NAME_BABY_EAT_TIME = '寶寶喝奶時間紀錄';
const SHEET_NAME_ACCOUNTING_STATISTICS = "花費統計"

const CHART_TYPE_ACCOUNTING = "花費"

const COLUMN_SETTING_DAILY_MEMO = Object.freeze({
  MemoItemId:1,
  MemoNumber:2,
  ModifyTime:3,
  MemoContent:4,
  TotalCount:5
  }); 

const COLUMN_SETTING_SCHEDULE = Object.freeze({
  ScheduleItemId:1,
  ScheduleNumber:2,
  ModifyTime:3,
  ScheduleContent:4,
  ScheduleType:5,
  ScheduleValue:6,
  TotalCount:7
  }); 

const COLUMN_SETTING_ACCOUNTING = Object.freeze({
  Date:1,
  AccountingContent:2,
  Prize:3,
  BudgetType:4,
  RemainBudget:5
});

const COLUMN_SETTING_BABY_DIAPER_CHANGING = Object.freeze({
  Date:1,
  Time:2,
  SummationTimes:3,
  RecentAverageIntervalTime_Hour:6,
  RecentAverageIntervalTime_Minute:7
});

const COLUMN_SETTING_BABY_EAT = Object.freeze({
  Date:1,
  Time:2,
  FeedingAmount:3,
  SummationTimes:4,
  SummationFeedingAmount:5,
  RecentAverageIntervalTime_Hour:8,
  RecentAverageIntervalTime_Minute:9
});

const COLUMN_SETTING_ACCOUNTING_STATISTICS = Object.freeze({
  Type:1
});

const CONTENT_SORT_KEY_WORD = Object.freeze({
  '(每月)':1,
  '(每週)':2
  }); 

const SHEET_ITEM_TYPE = Object.freeze({
  DailyMemoItem:1,
  ScheduleItem:2
});

const SCHEDULE_TYPE = Object.freeze({
  '每月':1,
  '每週':2,
  '每天':3
});

const DIRECTION_CHANGE_TYPE = Object.freeze({
  '從上到下':1,
  '從下到上':2
});


