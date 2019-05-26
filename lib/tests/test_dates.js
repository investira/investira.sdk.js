const test = require('tape');
const moment = require('moment');
const { formatDateCustom } = require('../utils/formats');
moment.locale('pt-BR');
// moment.locale('en-US');
// moment.locale('UTC');

const dates = require('../utils/dates');

test('\ndates addmonth', t => {
    t.equal(
        formatDateCustom(
            dates.addMonths(new Date('2019-01-31'), 1),
            'DD/MM/YY'
        ),
        '28/02/19'
    );
    t.equal(
        formatDateCustom(
            dates.addMonths(new Date('2019-01-31T23:59:59'), 1),
            'DD/MM/YY'
        ),
        '28/02/19'
    );
    t.end();
});

test('\ndates isExpired', t => {
    t.equal(dates.isExpired(dates.addDays(new Date(), -1), 1), true);
    t.equal(dates.isExpired(dates.addDays(new Date(), 1), 1), false);
    t.end();
});

test('\ndates addYears', t => {
    t.equal(
        formatDateCustom(
            dates.addYears(new Date('2019-01-31T23:59:59'), 1),
            'DD/MM/YY'
        ),
        '31/01/20'
    );
    t.end();
});

test('\ndates daysBetween', t => {
    t.equal(
        dates.daysBetween(new Date('2018-12-31'), new Date('2018-12-31')),
        0
    );
    t.equal(
        dates.daysBetween(new Date('2018-12-31'), new Date('2018-12-30')),
        -1
    );
    t.equal(
        dates.daysBetween(new Date('2018-12-30'), new Date('2018-12-31')),
        1
    );
    t.equal(
        dates.daysBetween(
            new Date('2018-12-30T00:01'),
            new Date('2018-12-31T23:01'),
            true
        ),
        1
    );
    t.equal(
        dates.daysBetween(
            new Date('2018-12-30T23:01'),
            new Date('2018-12-31T00:01'),
            true
        ),
        1
    );
    t.equal(
        dates.daysBetween(
            new Date('2018-01-01T00:01'),
            new Date('2018-01-02T23:59'),
            true
        ),
        1
    );
    t.equal(
        dates.daysBetween(
            new Date('2018-01-01T00:01'),
            new Date('2018-01-02T23:59')
        ),
        1.9986111111111111
    );
    t.end();
});
test('\ndates yearsBetween', t => {
    t.equal(
        dates.yearsBetween(
            new Date('2018-12-31T23:59'),
            new Date('2019-01-01T00:01')
        ),
        0.000003733572281959067
    );
    t.equal(
        dates.yearsBetween(
            new Date('2018-12-31T23:59'),
            new Date('2019-01-01T00:01'),
            true
        ),
        1
    );
    t.end();
});

test('\ndates getWeekends', t => {
    t.equal(
        dates.getWeekends(new Date('2019-04-27'), new Date('2019-05-03')),
        1,
        '2019-04-27 2019-05-03'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-03')),
        0,
        '2019-05-01 2019-05-03'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-04')),
        1,
        '2019-05-01 2019-05-04'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-05')),
        2,
        '2019-05-01 2019-05-05'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-06')),
        2,
        '2019-05-01 2019-05-06'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-07')),
        2,
        '2019-05-01 2019-05-07'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-10')),
        2,
        '2019-05-01 2019-05-10'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-11')),
        3,
        '2019-05-01 2019-05-11'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-12')),
        4,
        '2019-05-01 2019-05-12'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-13')),
        4,
        '2019-05-01 2019-05-13'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-13'), new Date('2019-05-01')),
        4,
        '2019-05-13 2019-05-01'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-01'), new Date('2019-05-14')),
        4,
        '2019-05-01 2019-05-14'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-04'), new Date('2019-05-05')),
        1,
        '2019-05-04 2019-05-05'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-04'), new Date('2019-05-06')),
        1,
        '2019-05-04 2019-05-06'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-04'), new Date('2019-05-07')),
        1,
        '2019-05-04 2019-05-07'
    );

    t.equal(
        dates.getWeekends(new Date('2019-05-05'), new Date('2019-05-06')),
        0,
        '2019-05-05 2019-05-06'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-05'), new Date('2019-05-07')),
        0,
        '2019-05-05 2019-05-07'
    );
    t.equal(
        dates.getWeekends(new Date('2019-05-05'), new Date('2019-05-08')),
        0,
        '2019-05-05 2019-05-08'
    );
    t.end();
});
