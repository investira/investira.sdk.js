const test = require('tape');
const { formatDateCustom } = require('../utils/formats');

const dates = require('../utils/dates');

test('\ndates scheduleToDate', t => {
    dates.locale('pt-BR');
    t.deepEqual(
        dates.scheduleToDate({ type: 'D', time: '08:30', workingDay: true }, dates.toDate('2001-01-01T00:00')),
        dates.toDate('2001-01-02T08:30:00')
    );
    t.deepEqual(
        dates.scheduleToDate({ type: 'M', time: '08:30', workingDay: true }, dates.toDate('2001-01-10T00:00')),
        dates.toDate('2001-02-01T08:30:00')
    );
    t.deepEqual(
        dates.scheduleToDate(
            { type: 'W', time: '08:30', weekday: 2, workingDay: false },
            dates.toDate('2020-09-28T00:00')
        ),
        dates.toDate('2020-09-29T08:30')
    );
    t.deepEqual(
        dates.scheduleToDate(
            { type: 'W', time: '08:30', weekday: 1, workingDay: false },
            dates.toDate('2020-09-29T08:31')
        ),
        dates.toDate('2020-10-05T08:30')
    );
    t.end();
});

test('\ndates areDatesEqual', t => {
    dates.locale('pt-BR');
    t.equal(dates.areDatesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:00Z')), true);
    t.equal(dates.areDatesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:01Z')), true);
    t.equal(dates.areDatesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-02T00:01Z')), false);
    t.end();
});

test('\ndates areDateTimesEqual', t => {
    dates.locale('pt-BR');
    t.equal(dates.areDateTimesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:00Z')), true);
    t.equal(dates.areDateTimesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:01Z')), false);
    t.equal(dates.areDateTimesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-02T00:01Z')), false);
    t.end();
});

test('\ndates isWorkingDay', t => {
    dates.locale('pt-BR');
    t.equal(dates.isWorkingDay(dates.toDate('2019-08-03')), false);
    t.equal(dates.isWorkingDay(dates.toDate('2019-08-05')), true);
    t.equal(dates.isWorkingDay(dates.toDate('2019-09-07')), false);
    t.end();
});

test('\ndates isTime', t => {
    dates.locale('pt-BR');
    t.equal(dates.isTime('25:00'), false);
    t.equal(dates.isTime('24:01'), false);
    t.equal(dates.isTime('24:00'), false);
    t.equal(dates.isTime('00:00'), true);
    t.equal(dates.isTime('00:60'), false);
    t.equal(dates.isTime('00:01'), true);
    t.equal(dates.isTime('0:0'), false);
    t.equal(dates.isTime('00'), false);
    t.end();
});

test('\ndates addWorkingDays', t => {
    dates.locale('pt-BR');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-01'), -252), dates.toDate('2018-07-30T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2018-07-30'), 252), dates.toDate('2019-08-01T03:00:00.000Z'));

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-03'), -1), dates.toDate('2019-08-02T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-04'), -1), dates.toDate('2019-08-02T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-05'), -1), dates.toDate('2019-08-02T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-06'), -1), dates.toDate('2019-08-05T03:00:00.000Z'));

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-03'), 0), dates.toDate('2019-08-05T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-05'), 0), dates.toDate('2019-08-05T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-03'), 1), dates.toDate('2019-08-05T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-05'), 1), dates.toDate('2019-08-06T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-03'), 2), dates.toDate('2019-08-06T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-05'), 4), dates.toDate('2019-08-09T03:00:00.000Z'));
    t.end();
});

test('\ndates weekNames', t => {
    dates.locale('pt-BR');
    t.equal(dates.weekNames()[0], 'domingo');
    dates.locale('en-US');
    t.equal(dates.weekNames()[0], 'Sunday');
    t.end();
});

test('\ndates workingDaysInMonth', t => {
    dates.locale('pt-BR');
    t.equal(dates.workingDaysInMonth(dates.toDate('2019-03-03')), 19);
    t.equal(dates.workingDaysInMonth(dates.toDate('2019-04-03')), 21);
    t.end();
});

test('\ndates holidays', t => {
    dates.locale('pt-BR');
    t.equal(dates.isHoliday(dates.toDate('2019-05-01T23:59Z')), true);
    // t.equal(dates.isHoliday(dates.toDate('2019-05-01')), true);
    t.equal(dates.isHoliday(dates.toDate('2019-04-21T23:59Z')), false);
    t.equal(dates.isHoliday(dates.toDate('2019-11-11T23:59Z')), false);
    dates.locale('en-US');
    t.equal(dates.isHoliday(dates.toDate('2019-05-01T23:59Z')), false);
    t.equal(dates.isHoliday(dates.toDate('2019-04-21T23:59Z')), false);
    t.equal(dates.isHoliday(dates.toDate('2019-11-11T23:59Z')), true);
    t.end();
});

test('\ndates workingDaysBetween', t => {
    dates.locale('pt-BR');
    let xData1 = dates.toDate('2019-01-03');
    let xData2 = dates.toDate('2019-05-30');
    t.equal(dates.workingDaysBetween(xData1, xData2), 101);
    xData1 = dates.toDate('2019-05-01');
    xData2 = dates.toDate('2019-05-02');
    t.equal(dates.workingDaysBetween(xData1, xData2), 1);
    xData1 = dates.toDate('2019-04-30');
    xData2 = dates.toDate('2019-05-01');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    // xData1 = dates.toDate('1988-04-20');
    // xData2 = dates.toDate('1988-04-21');
    // t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('2019-04-30');
    xData2 = dates.toDate('2019-05-02');
    t.equal(dates.workingDaysBetween(xData1, xData2), 1);
    xData1 = dates.toDate('1995-12-31');
    xData2 = dates.toDate('2018-12-31');
    t.equal(dates.workingDaysBetween(xData1, xData2), 5774);
    xData1 = dates.toDate('1995-01-01');
    xData2 = dates.toDate('2018-12-31');
    t.equal(dates.workingDaysBetween(xData1, xData2), 6022);
    xData1 = dates.toDate('1995-01-03');
    xData2 = dates.toDate('2070-01-03');
    t.equal(dates.workingDaysBetween(xData1, xData2), 18835);
    xData1 = dates.toDate('2019-08-05');
    xData2 = dates.toDate('2019-08-04');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('2019-08-03');
    xData2 = dates.toDate('2019-08-02');
    t.equal(dates.workingDaysBetween(xData1, xData2), 1);
    xData1 = dates.toDate('2019-08-02');
    xData2 = dates.toDate('2019-08-03');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('2019-05-01');
    xData2 = dates.toDate('2019-05-01');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('2019-05-02');
    xData2 = dates.toDate('2019-05-01');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('2019-05-01');
    xData2 = dates.toDate('2019-05-02');
    t.equal(dates.workingDaysBetween(xData1, xData2), 1);
    xData1 = dates.toDate('2019-08-03');
    xData2 = dates.toDate('2019-08-03');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('2019-08-02');
    xData2 = dates.toDate('2019-08-03');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('2019-08-01');
    xData2 = dates.toDate('2019-08-03');
    t.equal(dates.workingDaysBetween(xData1, xData2), 1);

    t.end();
});

test('\ndates addmonth', t => {
    t.equal(formatDateCustom(dates.addMonths(dates.toDate('2019-01-31'), 1), 'DD/MM/YY'), '28/02/19');
    t.equal(formatDateCustom(dates.addMonths(dates.toDate('2019-01-31T23:59:59'), 1), 'DD/MM/YY'), '28/02/19');
    t.end();
});

test('\ndates isExpired', t => {
    t.equal(dates.isExpired(dates.addDays(dates.toDate(), -1), 1), true);
    t.equal(dates.isExpired(dates.addDays(dates.toDate(), 1), 1), false);
    t.end();
});

test('\ndates addYears', t => {
    t.equal(formatDateCustom(dates.addYears(dates.toDate('2019-01-31T23:59:59'), 1), 'DD/MM/YY'), '31/01/20');
    t.end();
});

test('\ndates daysBetween', t => {
    t.equal(dates.daysBetween(dates.toDate('2018-12-31'), dates.toDate('2018-12-31')), 0);
    t.equal(dates.daysBetween(dates.toDate('2018-12-31'), dates.toDate('2018-12-30')), -1);
    t.equal(dates.daysBetween(dates.toDate('2018-12-30'), dates.toDate('2018-12-31')), 1);
    t.equal(dates.daysBetween(dates.toDate('2018-12-30T00:01Z'), dates.toDate('2018-12-31T23:01Z'), true), 1);
    t.equal(dates.daysBetween(dates.toDate('2018-12-30T23:01Z'), dates.toDate('2018-12-31T00:01Z'), true), 1);
    t.equal(dates.daysBetween(dates.toDate('2018-01-01T00:01Z'), dates.toDate('2018-01-02T23:59Z'), true), 1);
    t.equal(
        dates.daysBetween(dates.toDate('2018-01-01T00:01Z'), dates.toDate('2018-01-02T23:59Z')),
        1.9986111111111111
    );
    t.end();
});
test('\ndates yearsBetween', t => {
    t.equal(
        dates.yearsBetween(dates.toDate('2018-12-31T23:59Z'), dates.toDate('2019-01-01T00:01Z')),
        0.0000037335722819593786
    );
    t.equal(dates.yearsBetween(dates.toDate('2018-12-31T23:59Z'), dates.toDate('2019-01-01T00:01Z'), true), 1);
    t.end();
});

test('\ndates getWeekends', t => {
    t.equal(dates.weekends(dates.toDate('2019-04-27'), dates.toDate('2019-05-03')), 1, '2019-04-27 2019-05-03');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-03')), 0, '2019-05-01 2019-05-03');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-04')), 1, '2019-05-01 2019-05-04');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-05')), 2, '2019-05-01 2019-05-05');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-06')), 2, '2019-05-01 2019-05-06');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-07')), 2, '2019-05-01 2019-05-07');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-10')), 2, '2019-05-01 2019-05-10');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-11')), 3, '2019-05-01 2019-05-11');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-12')), 4, '2019-05-01 2019-05-12');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-13')), 4, '2019-05-01 2019-05-13');
    t.equal(dates.weekends(dates.toDate('2019-05-13'), dates.toDate('2019-05-01')), 4, '2019-05-13 2019-05-01');
    t.equal(dates.weekends(dates.toDate('2019-05-01'), dates.toDate('2019-05-14')), 4, '2019-05-01 2019-05-14');
    t.equal(dates.weekends(dates.toDate('2019-05-04'), dates.toDate('2019-05-05')), 1, '2019-05-04 2019-05-05');
    t.equal(dates.weekends(dates.toDate('2019-05-04'), dates.toDate('2019-05-06')), 1, '2019-05-04 2019-05-06');
    t.equal(dates.weekends(dates.toDate('2019-05-04'), dates.toDate('2019-05-07')), 1, '2019-05-04 2019-05-07');

    t.equal(dates.weekends(dates.toDate('2019-05-05'), dates.toDate('2019-05-06')), 0, '2019-05-05 2019-05-06');
    t.equal(dates.weekends(dates.toDate('2019-05-05'), dates.toDate('2019-05-07')), 0, '2019-05-05 2019-05-07');
    t.equal(dates.weekends(dates.toDate('2019-05-05'), dates.toDate('2019-05-08')), 0, '2019-05-05 2019-05-08');
    t.end();
});

test('\ndates weekOfMonth (absolute)', t => {
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-01'), true), 1);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-08'), true), 2);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-15'), true), 3);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-22'), true), 4);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-25'), true), 5);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-31'), true), 6);
    t.end();
});

test('\ndates weekOfMonth', t => {
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-01')), 1);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-08')), 2);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-15')), 3);
    t.equal(dates.weekOfMonth(dates.toDate('2022-01-25')), 4);
    t.end();
});

test('\ndates weekOfYear', t => {
    t.equal(dates.weekOfYear(dates.toDate('2022-01-01')), 1);
    t.equal(dates.weekOfYear(dates.toDate('2022-01-08')), 2);
    t.equal(dates.weekOfYear(dates.toDate('2022-01-15')), 3);
    t.equal(dates.weekOfYear(dates.toDate('2022-01-22')), 4);
    t.equal(dates.weekOfYear(dates.toDate('2022-01-24')), 5);
    t.end();
});

test('\ndates weekOf "month"', t => {
    t.deepEqual(dates.weekOf(dates.toDate('2022-01-01')), { month: 1, year: 1 });
    t.deepEqual(dates.weekOf(dates.toDate('2022-01-08')), { month: 2, year: 2 });
    t.deepEqual(dates.weekOf(dates.toDate('2022-01-15')), { month: 3, year: 3 });
    t.deepEqual(dates.weekOf(dates.toDate('2022-01-25')), { month: 4, year: 5 });
    t.end();
});
