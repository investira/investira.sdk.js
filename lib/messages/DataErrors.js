const BadRequestError = require('./ClientErrors').BadRequestError;

class GeneralDataError extends BadRequestError {
    /**
     *Creates an instance of GeneralDataError.
     * @param {string} [pMessage='Data Error']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     * @memberof GeneralDataError
     */
    constructor(pMessage = 'Data Error', pProps = {}, pSqlState = '22000') {
        pProps.detail = pProps.detail || {};
        pProps.detail.sqlState = pProps.detail.sqlState || pSqlState;
        pProps.code = pProps.code || {};
        pProps.code.ref = pSqlState;
        super(pMessage, pProps);
    }
}

class Deadlock extends GeneralDataError {
    constructor(pMessage = 'Deadlock', pProps = {}) {
        super(pMessage, pProps, '40001');
    }
}

class DuplicateEntry extends GeneralDataError {
    constructor(pMessage = 'Duplicate Entry', pProps = {}) {
        super(pMessage, pProps, '_DUPENT');
    }
}

class ColumnNotFound extends GeneralDataError {
    constructor(pMessage = 'Column Not Found', pProps = {}) {
        super(pMessage, pProps, '42S22');
    }
}

class InvalidData extends GeneralDataError {
    constructor(pMessage = 'Invalid Data', pProps = {}) {
        super(pMessage, pProps, 'HY000');
    }
}

class TableNotFound extends GeneralDataError {
    constructor(pMessage = 'Table Not Found', pProps = {}) {
        super(pMessage, pProps, 'HV00R');
    }
}

class UKRequired extends GeneralDataError {
    constructor(pMessage = 'UK Required', pProps = {}) {
        super(pMessage, pProps);
    }
}

class ConnectionRequired extends GeneralDataError {
    constructor(pMessage = 'Connection Required', pProps = {}) {
        super(pMessage, pProps);
    }
}

class QueryConditionsRequired extends GeneralDataError {
    constructor(pMessage = 'Query Conditions Required', pProps = {}) {
        super(pMessage, pProps);
    }
}

class ColumnRequired extends GeneralDataError {
    constructor(pMessage = 'Column(s) Required', pProps = {}) {
        super(pMessage, pProps);
    }
}
class DataNotFound extends GeneralDataError {
    constructor(pMessage = 'Data Not Found', pProps = {}) {
        super(pMessage, pProps);
    }
}

module.exports = {
    GeneralDataError,
    Deadlock,
    DuplicateEntry,
    InvalidData,
    TableNotFound,
    ColumnNotFound,
    UKRequired,
    ConnectionRequired,
    QueryConditionsRequired,
    ColumnRequired,
    DataNotFound
};
