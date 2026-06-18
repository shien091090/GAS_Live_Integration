function GetBudgetProgressBar(budgetType) {
  if (!budgetType || budgetType === '') return '';

  var budgetSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_BUDGET_SETTING);
  if (!budgetSheet) return '';

  var lastRow = budgetSheet.getLastRow();
  if (lastRow < 2) return '';

  var data = budgetSheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var budgetRow = null;
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(budgetType)) {
      budgetRow = data[i];
      break;
    }
  }

  if (!budgetRow) return '';

  var baseBudget = parseInt(budgetRow[COLUMN_SETTING_BUDGET_SETTING.MonthlyAmount - 1]) || 0;
  if (baseBudget <= 0) return '';

  var currentMonth = new Date().getMonth() + 1;
  var effectiveBudget = baseBudget;

  var specialPairs = [
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth1, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount1],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth2, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount2],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth3, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount3],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth4, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount4],
    [COLUMN_SETTING_BUDGET_SETTING.SpecialMonth5, COLUMN_SETTING_BUDGET_SETTING.SpecialAmount5],
  ];

  specialPairs.forEach(function(pair) {
    var specialMonth = budgetRow[pair[0] - 1];
    var specialAmount = budgetRow[pair[1] - 1];
    if (specialMonth !== '' && parseInt(specialMonth) === currentMonth) {
      effectiveBudget += parseInt(specialAmount) || 0;
    }
  });

  var accountingSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME_ACCOUNTING);
  var accountingLastRow = accountingSheet.getLastRow();
  var monthlySpent = 0;

  if (accountingLastRow >= 2) {
    var accountingData = accountingSheet.getRange(2, 1, accountingLastRow - 1, 4).getValues();
    var now = new Date();

    accountingData.forEach(function(row) {
      var date = row[COLUMN_SETTING_ACCOUNTING.Date - 1];
      var prize = row[COLUMN_SETTING_ACCOUNTING.Prize - 1];
      var rowBudgetType = row[COLUMN_SETTING_ACCOUNTING.BudgetType - 1];

      if (!date || date === '') return;

      var rowDate = new Date(date);
      if (rowDate.getFullYear() === now.getFullYear() &&
          rowDate.getMonth() === now.getMonth() &&
          String(rowBudgetType) === String(budgetType)) {
        monthlySpent += parseInt(prize) || 0;
      }
    });
  }

  var ratio = monthlySpent / effectiveBudget;
  var filledCount = Math.min(10, Math.round(ratio * 10));
  var emptyCount = 10 - filledCount;
  var percentage = Math.floor(ratio * 100);

  var bar = '█'.repeat(filledCount) + '░'.repeat(emptyCount);
  var result = bar + ' ' + monthlySpent.toLocaleString('en-US') + '$/' + effectiveBudget.toLocaleString('en-US') + '$ (' + percentage + '%)';

  if (monthlySpent > effectiveBudget) {
    var overspent = monthlySpent - effectiveBudget;
    result += '\n⚠ 超支 ' + overspent.toLocaleString('en-US') + '$';
  }

  return result;
}
