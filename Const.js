const STATUS_CODE_SUCCESS = 200
const STATUS_CODE_EMPTY_INPUT = 300
const STATUS_CODE_INVALID = 301

const ACTION_MEMO_ADD = 'action_memo_add'
const ACTION_MEMO_REMOVE = 'action_memo_remove'
const ACTION_MEMO_REMOVE_MULTIPLE = 'action_memo_remove_multiple'
const ACTION_MEMO_MODIFY = 'action_memo_modify'
const ACTION_MEMO_EXTEND = 'action_memo_extend'
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
const ACTION_GET_PREPARATION_LIST = 'action_get_preparation_list'
const ACTION_RECORD_DAILY_TIME = 'action_record_daily_time'
const ACTION_GET_BUDGET_STATUS = 'action_get_budget_status'
const ACTION_GET_SPECIAL_SCHEDULE = 'action_get_special_schedule'
const ACTION_MEMO_GET_JSON = 'action_memo_get_json'
const ACTION_MEMO_GET_HISTORY = 'action_memo_get_history'
const ACTION_GET_BUDGET_TYPES = 'action_get_budget_types'
const ACTION_GET_DASHBOARD_ECONOMY_ALL_MONTHS = 'action_get_dashboard_economy_all_months'
const ACTION_GET_IMPORTANT_SCHEDULE = 'action_get_important_schedule'
const ACTION_GET_DASHBOARD_FUTURE = 'action_get_dashboard_future'
const ACTION_PURCHASE_LIST_ADD = 'action_purchase_list_add'
const ACTION_PURCHASE_LIST_GET = 'action_purchase_list_get'
const ACTION_PURCHASE_LIST_DELETE = 'action_purchase_list_delete'
const ACTION_PURCHASE_LIST_MARK_BOUGHT = 'action_purchase_list_mark_bought'

const DAILY_TIME_EVENT_TYPES = [
  '準備出門上班',
  '上班到達公司座位',
  '準備下班離開座位',
  '下班到家',
  '準備洗澡',
  '準備進房',
  '準備睡覺',
  '起床',
  '璇璇準備入睡',
  '璇璇睡著',
]
const ACTION_RECORD_BABY_DIAPER_CHANGING_TIME = 'action_record_baby_diaper_changing_time'
const ACTION_RECORD_BABY_EAT_TIME = 'action_record_baby_eat_time'
const ACTION_GET_DAILY_TIME_RECORDS = 'action_get_daily_time_records'
const ACTION_GET_DASHBOARD_STATUS = 'action_get_dashboard_status'
const ACTION_TRIGGER_NFC = 'action_trigger_nfc'

const NFC_LOCATION_COMPANY_DESK   = 'nfc_company_desk'
const NFC_LOCATION_HOME_DOOR      = 'nfc_home_door'
const NFC_LOCATION_COMPUTER_DESK  = 'nfc_computer_desk'
const NFC_LOCATION_BEDROOM        = 'nfc_bedroom'
const NFC_LOCATION_XUAN_ROOM      = 'nfc_xuan_room'

const MESSAGE_TYPE_TEXT = 'text'
const MESSAGE_TYPE_CHART = 'chart'

const IS_AUTO_SET_DATE = false;
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

const COLUMN_SETTING_PURCHASE_LIST = Object.freeze({
  ItemName: 1,
  Category: 2,
  AddTime: 3,
  BoughtTime: 4
});

const PURCHASE_CATEGORY_SHORT_TERM = '短期'
const PURCHASE_CATEGORY_LONG_TERM = '長期'

const COLUMN_SETTING_IMPORTANT_SCHEDULE = Object.freeze({
  Name: 1,
  Date: 2
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

const SHEET_NAME_BUDGET_SETTING = '預算設定'
const SHEET_NAME_PREPARATION_LIST = '物品準備清單'
const SHEET_NAME_DAILY_TIME_RECORD = '日常時間紀錄'
const SHEET_NAME_PURCHASE_LIST = '購買清單'
const SHEET_NAME_IMPORTANT_SCHEDULE = '重要日程'
const SHEET_NAME_BUDGET_SNAPSHOT = '預算快照'

const COLUMN_SETTING_BUDGET_SNAPSHOT = Object.freeze({
  Year: 1,
  Month: 2,
  BudgetType: 3,
  Spent: 4,
  EffectiveBudget: 5,
  Diff: 6,
  IsOverBudget: 7,
  Overspent: 8,
  SnapshotTime: 9
})

const COLUMN_SETTING_BUDGET_SETTING = Object.freeze({
  BudgetType: 1,
  MonthlyAmount: 2,
  SpecialMonth1: 3,
  SpecialAmount1: 4,
  SpecialItem1: 5,
  SpecialMonth2: 6,
  SpecialAmount2: 7,
  SpecialItem2: 8,
  SpecialMonth3: 9,
  SpecialAmount3: 10,
  SpecialItem3: 11,
  SpecialMonth4: 12,
  SpecialAmount4: 13,
  SpecialItem4: 14,
  SpecialMonth5: 15,
  SpecialAmount5: 16,
  SpecialItem5: 17,
})


