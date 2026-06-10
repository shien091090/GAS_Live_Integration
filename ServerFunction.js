const STATUS_CODE_SUCCESS = 200
const STATUS_CODE_EMPTY_INPUT = 300
const STATUS_CODE_INVALID = 301

const ACTION_MEMO_ADD = 'action_memo_add'
const ACTION_MEMO_REMOVE = 'action_memo_remove'
const ACTION_MEMO_MODIFY = 'action_memo_modify'
const ACTION_MEMO_GET = 'action_memo_get'
const ACTION_SCHEDULE_ADD = 'action_schedule_add'
const ACTION_SCHEDULE_REMOVE = 'action_schedule_remove'
const ACTION_SCHEDULE_MODIFY = 'action_schedule_modify'
const ACTION_SCHEDULE_GET = 'action_schedule_get'
const ACTION_DAILY_SCHEDULER = 'action_daily_scheduler'
const ACTION_BUY = 'action_buy'
const ACTION_BUY_WITH_BUDGET_TYPE = 'action_buy_with_budget_type'
const ACTION_GET_TOTAL_COST_BY_MONTH = 'action_get_total_cost_by_month';
const ACTION_GET_CHART = 'action_get_chart';
const ACTION_RECORD_BABY_DIAPER_CHANGING_TIME = 'action_record_baby_diaper_changing_time';
const ACTION_RECORD_BABY_EAT_TIME = 'action_record_baby_eat_time';

const MESSAGE_TYPE_TEXT = 'text'
const MESSAGE_TYPE_CHART = 'chart'

function doGet(e) {
  
  var param = e.parameter;
  var action = param.action;
  var res = {};

  switch(action) {
    case ACTION_MEMO_ADD:
      res = Action_AddMemo(param.subContent);
      break;

    case ACTION_MEMO_REMOVE:
      res = Action_RemoveMemo(param.number);
      break;

    case ACTION_MEMO_MODIFY:
      res = Action_ModifyMemo(param.number, param.subContent);
      break;

    case ACTION_MEMO_GET:
      res = Action_GetMemo();
      break;

    case ACTION_SCHEDULE_ADD:
      res = Action_AddSchedule(param.subContent, param.number, param.additionalContent);
      break;

    case ACTION_SCHEDULE_REMOVE:
      res = Action_RemoveSchedule(param.number);
      break;

    case ACTION_SCHEDULE_MODIFY:
      res = Action_ModifySchedule(param.number, param.subContent, param.subNumber, param.additionalContent);
      break;

    case ACTION_SCHEDULE_GET:
      res = Action_GetSchedule();
      break;

    case ACTION_DAILY_SCHEDULER:
      res = Action_DailyScheduler();
      break;

    case ACTION_BUY:
      res = Action_Buy(param.subContent, param.number);
      break;

    case ACTION_BUY_WITH_BUDGET_TYPE:
      res = Action_Buy(param.subContent, param.number, param.additionalContent);
      break;

    case ACTION_RECORD_BABY_DIAPER_CHANGING_TIME:
      res = Action_RecordDiaperChangingTime();
      break;

    case ACTION_RECORD_BABY_EAT_TIME:
      res = Action_RecordEatTime(param.number);
      break;

    case ACTION_GET_CHART:
      res = Action_GetChart(param.subContent, param.additionalContent);
      break;
  }


  return ContentService.createTextOutput(JSON.stringify(res));

}

class ServerResponse
{
  constructor(statusCode, statusMsg, responseMsg, messageType) {
    this.statusCode = statusCode;
    this.statusMsg = statusMsg;
    this.responseMsg = responseMsg;
    this.messageType = messageType
  }

  GetLog(){
    console.log(`StatusCode = ${this.statusCode}, StatusMsg = ${this.statusMsg}, ResponseMsg = \n${this.responseMsg}`);
  }
}

class ChartEntity
{
  constructor(dictData, title) {
    this.dictData = dictData;
    this.title = title;
  }
}