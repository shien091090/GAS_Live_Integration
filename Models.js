class MemoElement {
  constructor(params) {
    this.id = params[0];
    this.number = params[1];
    this.modifyTime = params[2];
    this.content = params[3];
    this.totalCount = params[4];
  }

  GetLog() {
    return `id = ${this.id}, number = ${this.number}, modifyTime = ${this.modifyTime}, content = ${this.content}, totalCount = ${this.totalCount}`;
  }

  GetParam(index) {
    var params = [this.id, this.number, this.modifyTime, this.content, this.totalCount];
    return params[index];
  }
}

class ScheduleElement {
  constructor(params) {
    this.id = params[0];
    this.number = params[1];
    this.modifyTime = params[2];
    this.content = params[3];
    this.scheduleType = params[4];
    this.scheduleValue = params[5];
    this.totalCount = params[6];
  }

  GetLog() {
    return `id = ${this.id}, number = ${this.number}, modifyTime = ${this.modifyTime}, content = ${this.content}, scheduleType = ${this.scheduleType}, scheduleValue = ${this.scheduleValue}, totalCount = ${this.totalCount}`;
  }

  GetParam(index) {
    var params = [this.id, this.number, this.modifyTime, this.content, this.scheduleType, this.scheduleValue, this.totalCount];
    return params[index];
  }

  GetFullContent() {
    if(this.scheduleType == "每天")
      return `每天 ${this.content}`;
    else if(this.scheduleType == "每週") {
      if(this.scheduleValue == 7)
        return `每週 禮拜日 ${this.content}`;
      else
        return `每週 禮拜${ConvertChineseNumber(this.scheduleValue)} ${this.content}`;
    }
    else if(this.scheduleType == "每年")
      return `每年 ${this.scheduleValue}月1號 ${this.content}`;
    else
      return `${this.scheduleType} ${this.scheduleValue}號 ${this.content}`;
  }
}
