
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

    case ACTION_MEMO_REMOVE_MULTIPLE:
      res = Action_RemoveMultipleMemo(param.numbers);
      break;

    case ACTION_MEMO_MODIFY:
      res = Action_ModifyMemo(param.number, param.subContent);
      break;

    case ACTION_MEMO_EXTEND:
      res = Action_ExtendMemo(param.number, param.subContent);
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

    case ACTION_GET_ACCOUNTING_ITEMS:
      res = Action_GetAccountingItems(param.startDate, param.endDate, param.budgetTypes);
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

    case ACTION_GET_PREPARATION_LIST:
      res = Action_GetPreparationList(param.attributes, param.condition);
      break;

    case ACTION_RECORD_DAILY_TIME:
      res = Action_RecordDailyTime(param.eventType);
      break;

    case ACTION_GET_BUDGET_STATUS:
      res = Action_GetBudgetStatus(param.year, param.month);
      break;

    case ACTION_GET_SPECIAL_SCHEDULE:
      res = Action_GetSpecialSchedule();
      break;

    case ACTION_MEMO_GET_JSON:
      res = Action_GetMemoJson();
      break;

    case ACTION_GET_BUDGET_TYPES:
      res = Action_GetBudgetTypes();
      break;

    case ACTION_GET_DASHBOARD_ECONOMY_ALL_MONTHS:
      res = Action_GetDashboardEconomyAllMonths();
      break;

    case ACTION_GET_IMPORTANT_SCHEDULE:
      res = Action_GetImportantSchedule();
      break;

    case ACTION_GET_DASHBOARD_FUTURE:
      res = Action_GetDashboardFuture();
      break;

    case ACTION_PURCHASE_LIST_ADD:
      res = Action_AddPurchaseItem(param.itemName);
      break;

    case ACTION_PURCHASE_LIST_GET:
      res = Action_GetPurchaseList();
      break;

    case ACTION_PURCHASE_LIST_DELETE:
      res = Action_DeletePurchaseItem(param.itemName);
      break;

    case ACTION_PURCHASE_LIST_MARK_BOUGHT:
      res = Action_MarkPurchaseItemBought(param.itemName);
      break;

    case 'action_debug_buy_reminder':
      res = new ServerResponse(STATUS_CODE_SUCCESS, 'debug', JSON.stringify(GetBuyReminderConfigs()), MESSAGE_TYPE_TEXT);
      break;
  }


  if (param.format === 'text')
    return ContentService.createTextOutput(res.responseMsg || '').setMimeType(ContentService.MimeType.TEXT);

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