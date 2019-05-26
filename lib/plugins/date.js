const dates = require('../utils/dates');

Date.prototype.toSql = function() {
    return dates.toSqlDate(this);
};
Date.prototype.isHoliday = function() {
    return dates.isHoliday(this);
};
