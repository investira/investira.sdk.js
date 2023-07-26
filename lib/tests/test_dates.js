const test = require('tape');
const { formatDateCustom } = require('../utils/formats');

const dates = require('../utils/dates');

test('\ndates toDate', t => {
    t.equal(dates.toDate('2018-12-31T23:59Z').toSql(), '2018-12-31');
    t.equal(dates.toDate('2018-12-31').toSql(), '2018-12-31');
    t.equal(dates.toDate('2018-12-31T23:59Z').toSql(), '2018-12-31');
    t.end();
});

test('\ndates areDatesEqual', t => {
    t.equal(dates.areDatesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:00Z')), true);
    t.equal(dates.areDatesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:01Z')), true);
    t.equal(dates.areDatesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-02T00:01Z')), false);
    t.end();
});

test('\ndates areDateTimesEqual', t => {
    t.equal(dates.areDateTimesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:00Z')), true);
    t.equal(dates.areDateTimesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-01T00:01Z')), false);
    t.equal(dates.areDateTimesEqual(dates.toDate('2001-01-01T00:00Z'), dates.toDate('2001-01-02T00:01Z')), false);
    t.end();
});

test('\ndates isWorkingDay', t => {
    t.equal(dates.isWorkingDay(dates.toDate('2019-08-03')), false);
    t.equal(dates.isWorkingDay(dates.toDate('2019-08-05')), true);
    t.equal(dates.isWorkingDay(dates.toDate('2019-09-07')), false);
    t.end();
});

test('\ndates isTime', t => {
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
    dates.locale('pt-BR');
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
test('\ndates isExpired', t => {
    t.equal(dates.isExpired(dates.addDays(dates.toDate(), -1), 1), true);
    t.equal(dates.isExpired(dates.addDays(dates.toDate(), 1), 1), false);
    t.end();
});

test('\ndates addDays', t => {
    t.equal(dates.addDays(dates.toDate('2019-01-31'), 1).toSql(), '2019-02-01');
    t.equal(dates.addDays(dates.toDate('2019-01-31T23:59:59'), 1).toSql(), '2019-02-01');
    t.equal(dates.addDays(dates.toDate('2019-02-01'), -1).toSql(), '2019-01-31');
    t.equal(dates.addDays(dates.toDate('2019-02-01'), 0).toSql(), '2019-02-01');
    t.equal(dates.addDays(dates.toDate('2019-02-01'), null).toSql(), '2019-02-01');
    t.equal(dates.addDays(dates.toDate('2019-02-01'), undefined).toSql(), '2019-02-01');
    t.end();
});
test('\ndates weekNames', t => {
    dates.locale('pt-BR');
    t.equal(dates.weekNames()[0], 'domingo');
    dates.locale('en-US');
    t.equal(dates.weekNames()[0], 'Sunday');
    dates.locale('pt-BR');
    t.end();
});
test('\ndates addMonths', t => {
    t.equal(dates.addMonths(dates.toDate('2019-01-01'), 1).toSql(), '2019-02-01');
    t.equal(dates.addMonths(dates.toDate('2019-01-31'), 1).toSql(), '2019-02-28');
    t.equal(dates.addMonths(dates.toDate('2019-01-31T23:59:59'), 1).toSql(), '2019-02-28');
    t.equal(dates.addMonths(dates.toDate('2019-02-01'), -1).toSql(), '2019-01-01');
    t.equal(dates.addMonths(dates.toDate('2019-02-28'), -1).toSql(), '2019-01-28');
    t.equal(dates.addMonths(dates.toDate('2019-03-01'), -1).toSql(), '2019-02-01');
    t.equal(dates.addMonths(dates.toDate('2019-03-31'), -1).toSql(), '2019-02-28');
    t.end();
});

test('\ndates addYears', t => {
    t.equal(dates.addYears(dates.toDate('2019-01-31T23:59:59'), 1).toSql(), '2020-01-31');
    t.end();
});
test('\ndates daysBetween', t => {
    t.equal(dates.daysBetween(dates.toDate('2018-12-31'), dates.toDate('2018-12-31')), 0);
    t.equal(dates.daysBetween(dates.toDate('2018-12-31'), dates.toDate('2018-12-30')), -1);
    t.equal(dates.daysBetween(dates.toDate('2018-12-30'), dates.toDate('2018-12-31')), 1);
    t.equal(dates.daysBetween(dates.toDate('2018-12-30T23:59Z'), dates.toDate('2018-12-31T00:01Z'), true), 1);
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
    t.equal(dates.weekends(dates.toDate('2019-03-11'), dates.toDate('2019-03-11')), 0, '2019-03-11 2019-03-11');
    t.equal(dates.weekends(dates.toDate('2019-03-11'), dates.toDate('2019-03-12')), 0, '2019-03-11 2019-03-12');
    t.equal(dates.weekends(dates.toDate('2019-03-11'), dates.toDate('2019-03-15')), 0, '2019-03-11 2019-03-15');

    t.equal(dates.weekends(dates.toDate('2019-03-08'), dates.toDate('2019-03-09')), 1, '2019-03-08 2019-03-09');
    t.equal(dates.weekends(dates.toDate('2019-03-08'), dates.toDate('2019-03-10')), 2, '2019-03-08 2019-03-10');
    t.equal(dates.weekends(dates.toDate('2019-03-08'), dates.toDate('2019-03-11')), 2, '2019-03-08 2019-03-11');
    t.equal(dates.weekends(dates.toDate('2019-03-08'), dates.toDate('2019-03-15')), 2, '2019-03-08 2019-03-15');
    t.equal(dates.weekends(dates.toDate('2019-03-08'), dates.toDate('2019-03-16')), 3, '2019-03-08 2019-03-16');
    t.equal(dates.weekends(dates.toDate('2019-03-08'), dates.toDate('2019-03-17')), 4, '2019-03-08 2019-03-17');

    t.equal(dates.weekends(dates.toDate('2019-03-09'), dates.toDate('2019-03-15')), 2, '2019-03-09 2019-03-15');
    t.equal(dates.weekends(dates.toDate('2019-03-09'), dates.toDate('2019-03-16')), 3, '2019-03-09 2019-03-16');
    t.equal(dates.weekends(dates.toDate('2019-03-09'), dates.toDate('2019-03-17')), 4, '2019-03-09 2019-03-17');
    t.equal(dates.weekends(dates.toDate('2019-03-09'), dates.toDate('2019-03-18')), 4, '2019-03-09 2019-03-18');

    t.equal(dates.weekends(dates.toDate('2019-03-10'), dates.toDate('2019-03-15')), 1, '2019-03-10 2019-03-15');
    t.equal(dates.weekends(dates.toDate('2019-03-10'), dates.toDate('2019-03-16')), 2, '2019-03-10 2019-03-16');
    t.equal(dates.weekends(dates.toDate('2019-03-10'), dates.toDate('2019-03-17')), 3, '2019-03-10 2019-03-17');

    t.equal(dates.weekends(dates.toDate('2019-03-11'), dates.toDate('2019-03-17')), 2, '2019-03-11 2019-03-17');

    t.equal(dates.weekends(dates.toDate('2019-03-12'), dates.toDate('2019-03-11')), 0, '2019-03-11 2019-03-11');
    t.equal(dates.weekends(dates.toDate('2019-03-15'), dates.toDate('2019-03-11')), 0, '2019-03-11 2019-03-11');

    t.equal(dates.weekends(dates.toDate('2019-03-09'), dates.toDate('2019-03-08')), -1, '2019-03-08 2019-03-08');
    t.equal(dates.weekends(dates.toDate('2019-03-10'), dates.toDate('2019-03-08')), -2, '2019-03-08 2019-03-08');
    t.equal(dates.weekends(dates.toDate('2019-03-11'), dates.toDate('2019-03-08')), -2, '2019-03-08 2019-03-08');
    t.equal(dates.weekends(dates.toDate('2019-03-15'), dates.toDate('2019-03-08')), -2, '2019-03-08 2019-03-08');
    t.equal(dates.weekends(dates.toDate('2019-03-16'), dates.toDate('2019-03-08')), -3, '2019-03-08 2019-03-08');
    t.equal(dates.weekends(dates.toDate('2019-03-17'), dates.toDate('2019-03-08')), -4, '2019-03-08 2019-03-08');

    t.equal(dates.weekends(dates.toDate('2019-03-15'), dates.toDate('2019-03-09')), -2, '2019-03-09 2019-03-09');
    t.equal(dates.weekends(dates.toDate('2019-03-16'), dates.toDate('2019-03-09')), -3, '2019-03-09 2019-03-09');
    t.equal(dates.weekends(dates.toDate('2019-03-17'), dates.toDate('2019-03-09')), -4, '2019-03-09 2019-03-09');
    t.equal(dates.weekends(dates.toDate('2019-03-18'), dates.toDate('2019-03-09')), -4, '2019-03-09 2019-03-09');

    t.equal(dates.weekends(dates.toDate('2019-03-15'), dates.toDate('2019-03-10')), -1, '2019-03-10 2019-03-10');
    t.equal(dates.weekends(dates.toDate('2019-03-16'), dates.toDate('2019-03-10')), -2, '2019-03-10 2019-03-10');
    t.equal(dates.weekends(dates.toDate('2019-03-17'), dates.toDate('2019-03-10')), -3, '2019-03-10 2019-03-10');

    t.equal(dates.weekends(dates.toDate('2019-03-17'), dates.toDate('2019-03-11')), -2, '2019-03-11 2019-03-11');
    t.end();
});

test('\ndates workingDaysBetween', t => {
    dates.locale('pt-BR');
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-11'), dates.toDate('2019-03-11')),
        0,
        '2019-03-11 2019-03-11'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-11'), dates.toDate('2019-03-12')),
        1,
        '2019-03-11 2019-03-12'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-11'), dates.toDate('2019-03-15')),
        4,
        '2019-03-11 2019-03-15'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-08'), dates.toDate('2019-03-09')),
        0,
        '2019-03-08 2019-03-09'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-08'), dates.toDate('2019-03-10')),
        0,
        '2019-03-08 2019-03-10'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-08'), dates.toDate('2019-03-11')),
        1,
        '2019-03-08 2019-03-11'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-08'), dates.toDate('2019-03-15')),
        5,
        '2019-03-08 2019-03-15'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-08'), dates.toDate('2019-03-16')),
        5,
        '2019-03-08 2019-03-16'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-08'), dates.toDate('2019-03-17')),
        5,
        '2019-03-08 2019-03-17'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-09'), dates.toDate('2019-03-15')),
        5,
        '2019-03-09 2019-03-15'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-09'), dates.toDate('2019-03-16')),
        5,
        '2019-03-09 2019-03-16'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-09'), dates.toDate('2019-03-17')),
        5,
        '2019-03-09 2019-03-17'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-09'), dates.toDate('2019-03-18')),
        6,
        '2019-03-09 2019-03-18'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-10'), dates.toDate('2019-03-15')),
        5,
        '2019-03-10 2019-03-15'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-10'), dates.toDate('2019-03-16')),
        5,
        '2019-03-10 2019-03-16'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-10'), dates.toDate('2019-03-17')),
        5,
        '2019-03-10 2019-03-17'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-11'), dates.toDate('2019-03-17')),
        4,
        '2019-03-11 2019-03-17'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-11'), dates.toDate('2019-03-10')),
        0,
        '2019-03-11 2019-03-10'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-12'), dates.toDate('2019-03-11')),
        -1,
        '2019-03-12 2019-03-11'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-15'), dates.toDate('2019-03-11')),
        -4,
        '2019-03-15 2019-03-11'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-09'), dates.toDate('2019-03-08')),
        -1,
        '2019-03-09 2019-03-08'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-10'), dates.toDate('2019-03-08')),
        -1,
        '2019-03-10 2019-03-08'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-11'), dates.toDate('2019-03-08')),
        -1,
        '2019-03-11 2019-03-08'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-15'), dates.toDate('2019-03-08')),
        -5,
        '2019-03-15 2019-03-08'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-16'), dates.toDate('2019-03-08')),
        -6,
        '2019-03-16 2019-03-08'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-17'), dates.toDate('2019-03-08')),
        -6,
        '2019-03-17 2019-03-08'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-15'), dates.toDate('2019-03-09')),
        -4,
        '2019-03-15 2019-03-09'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-16'), dates.toDate('2019-03-09')),
        -5,
        '2019-03-16 2019-03-09'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-17'), dates.toDate('2019-03-09')),
        -5,
        '2019-03-17 2019-03-09'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-18'), dates.toDate('2019-03-09')),
        -5,
        '2019-03-18 2019-03-09'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-15'), dates.toDate('2019-03-10')),
        -4,
        '2019-03-15 2019-03-10'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-16'), dates.toDate('2019-03-10')),
        -5,
        '2019-03-16 2019-03-10'
    );
    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-17'), dates.toDate('2019-03-10')),
        -5,
        '2019-03-17 2019-03-10'
    );

    t.equal(
        dates.workingDaysBetween(dates.toDate('2019-03-17'), dates.toDate('2019-03-11')),
        -5,
        '2019-03-17 2019-03-11'
    );

    let xData1 = dates.toDate('2019-01-03');
    let xData2 = dates.toDate('2019-05-30');
    t.equal(dates.workingDaysBetween(xData1, xData2), 101);
    xData1 = dates.toDate('2019-05-01');
    xData2 = dates.toDate('2019-05-02');
    t.equal(dates.workingDaysBetween(xData1, xData2), 1);
    xData1 = dates.toDate('2019-04-30');
    xData2 = dates.toDate('2019-05-01');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
    xData1 = dates.toDate('1988-04-20');
    xData2 = dates.toDate('1988-04-21');
    t.equal(dates.workingDaysBetween(xData1, xData2), 0);
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
    t.equal(dates.workingDaysBetween(xData1, xData2), -1);
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

// ##########################################################################################

test('\ndates addWorkingDays', t => {
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-11'), 0), dates.toDate('2019-03-11'), '2019-03-11 0');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-11'), 0), dates.toDate('2019-03-11'), '2019-03-11 0');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-11'), 0), dates.toDate('2019-03-11'), '2019-03-11 0');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-08'), 1), dates.toDate('2019-03-11'), '2019-03-08 1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-08'), 2), dates.toDate('2019-03-12'), '2019-03-08 2');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-08'), 3), dates.toDate('2019-03-13'), '2019-03-08 3');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-08'), 4), dates.toDate('2019-03-14'), '2019-03-08 4');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-08'), 5), dates.toDate('2019-03-15'), '2019-03-08 5');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-08'), 6), dates.toDate('2019-03-18'), '2019-03-08 6');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-09'), 2), dates.toDate('2019-03-12'), '2019-03-09 2');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-09'), 5), dates.toDate('2019-03-15'), '2019-03-09 5');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-09'), 6), dates.toDate('2019-03-18'), '2019-03-09 6');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-10'), 1), dates.toDate('2019-03-11'), '2019-03-10 0');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-10'), 1), dates.toDate('2019-03-11'), '2019-03-10 1');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-11'), 2), dates.toDate('2019-03-13'), '2019-03-11 3');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-09'), -1), dates.toDate('2019-03-08'), '2019-03-09 -1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-10'), -1), dates.toDate('2019-03-08'), '2019-03-20 -1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-11'), -1), dates.toDate('2019-03-08'), '2019-03-08 -1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-03-11'), -2), dates.toDate('2019-03-07'), '2019-03-08 -1');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-04-30'), 1), dates.toDate('2019-05-02'), '2019-04-30 1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-04-30'), 2), dates.toDate('2019-05-03'), '2019-04-30 1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-05-01'), -1), dates.toDate('2019-04-30'), '2019-05-01 -1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-05-02'), -1), dates.toDate('2019-04-30'), '2019-05-02 -1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-05-03'), -1), dates.toDate('2019-05-02'), '2019-05-03 -1');
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-05-03'), -3), dates.toDate('2019-04-29'), '2019-05-03 -3');

    t.deepEqual(dates.addWorkingDays(dates.toDate('2018-07-30'), 252), dates.toDate('2019-08-01T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-01'), -252), dates.toDate('2018-07-30T03:00:00.000Z'));
    t.deepEqual(dates.addWorkingDays(dates.toDate('2019-08-01'), -252), dates.toDate('2018-07-30T03:00:00.000Z'));

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

test('\ndates workingDaysInMonth', t => {
    t.equal(dates.workingDaysInMonth(dates.toDate('2019-03-03')), 19);
    t.equal(dates.workingDaysInMonth(dates.toDate('2019-04-03')), 21);
    t.end();
});

test('\ndates scheduleToDate', t => {
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
