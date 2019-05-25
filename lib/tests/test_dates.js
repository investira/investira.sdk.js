const test = require('tape');
const moment = require('moment');
moment.locale('pt-BR');

const dates = require('../utils/dates');

test('\ndates addmonth', t => {
    t.equal(
        moment(dates.addMonths(moment('2019-01-31'), 1)).format('DD/MMM/YY'),
        '28/Fev/19'
    );
    t.equal(
        moment(dates.addMonths(moment('2019-01-31T23:59:59'), 1)).format(
            'DD/MMM/YY'
        ),
        '28/Fev/19'
    );
    t.equal(
        dates.toUTC(dates.addMonths(moment('2019-01-31'), 1)),
        '2019-02-28T00:00:00-03:00'
    );
    t.end();
});

test('\ndates getWeekends', t => {
    t.equal(
        dates.getWeekends(
            moment('2019-04-27').toDate(),
            moment('2019-05-03').toDate()
        ),
        1,
        '2019-04-27 2019-05-03'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-03').toDate()
        ),
        0,
        '2019-05-01 2019-05-03'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-04').toDate()
        ),
        1,
        '2019-05-01 2019-05-04'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-05').toDate()
        ),
        2,
        '2019-05-01 2019-05-05'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-06').toDate()
        ),
        2,
        '2019-05-01 2019-05-06'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-07').toDate()
        ),
        2,
        '2019-05-01 2019-05-07'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-10').toDate()
        ),
        2,
        '2019-05-01 2019-05-10'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-11').toDate()
        ),
        3,
        '2019-05-01 2019-05-11'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-12').toDate()
        ),
        4,
        '2019-05-01 2019-05-12'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-13').toDate()
        ),
        4,
        '2019-05-01 2019-05-13'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-13').toDate(),
            moment('2019-05-01').toDate()
        ),
        4,
        '2019-05-13 2019-05-01'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-01').toDate(),
            moment('2019-05-14').toDate()
        ),
        4,
        '2019-05-01 2019-05-14'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-04').toDate(),
            moment('2019-05-05').toDate()
        ),
        1,
        '2019-05-04 2019-05-05'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-04').toDate(),
            moment('2019-05-06').toDate()
        ),
        1,
        '2019-05-04 2019-05-06'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-04').toDate(),
            moment('2019-05-07').toDate()
        ),
        1,
        '2019-05-04 2019-05-07'
    );

    t.equal(
        dates.getWeekends(
            moment('2019-05-05').toDate(),
            moment('2019-05-06').toDate()
        ),
        0,
        '2019-05-05 2019-05-06'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-05').toDate(),
            moment('2019-05-07').toDate()
        ),
        0,
        '2019-05-05 2019-05-07'
    );
    t.equal(
        dates.getWeekends(
            moment('2019-05-05').toDate(),
            moment('2019-05-08').toDate()
        ),
        0,
        '2019-05-05 2019-05-08'
    );
    t.end();
});
