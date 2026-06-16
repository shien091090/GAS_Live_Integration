const STATUS_CODE_SUCCESS = 200
const STATUS_CODE_EMPTY_INPUT = 300
const STATUS_CODE_INVALID = 301

const ACTION_MEMO_ADD = 'action_memo_add'
const ACTION_MEMO_REMOVE = 'action_memo_remove'
const ACTION_MEMO_REMOVE_MULTIPLE = 'action_memo_remove_multiple'
const ACTION_MEMO_MODIFY = 'action_memo_modify'
const ACTION_MEMO_GET = 'action_memo_get'
const ACTION_SCHEDULE_ADD = 'action_schedule_add'
const ACTION_SCHEDULE_REMOVE = 'action_schedule_remove'
const ACTION_SCHEDULE_MODIFY = 'action_schedule_modify'
const ACTION_SCHEDULE_GET = 'action_schedule_get'
const ACTION_DAILY_SCHEDULER = 'action_daily_scheduler'
const ACTION_GET_ACCOUNTING_ITEMS = 'action_get_accounting_items'
const ACTION_BUY = 'action_buy'
const ACTION_BUY_WITH_BUDGET_TYPE = 'action_buy_with_budget_type'
const ACTION_GET_TOTAL_COST_BY_MONTH = 'action_get_total_cost_by_month'
const ACTION_GET_CHART = 'action_get_chart'
const ACTION_RECORD_BABY_DIAPER_CHANGING_TIME = 'action_record_baby_diaper_changing_time'
const ACTION_RECORD_BABY_EAT_TIME = 'action_record_baby_eat_time'

const MESSAGE_TYPE_TEXT = 'text'
const MESSAGE_TYPE_CHART = 'chart'

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
  '每年':1,
  '每月':2,
  '每週':3,
  '每天':4
});

const DIRECTION_CHANGE_TYPE = Object.freeze({
  '從上到下':1,
  '從下到上':2
});

const SHEET_NAME_BUY_REMINDER_CONFIG = '記帳接待辦自動化設定';

const COLUMN_SETTING_BUY_REMINDER_CONFIG = Object.freeze({
  DisplayName: 1,
  Keywords: 2,
  BaseUnit: 3,
  DaysPerUnit: 4,
  DefaultQuantity: 5,
  IsEnabled: 6
});


