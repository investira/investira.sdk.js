exports.dates = require("./lib/utils/dates");
exports.objects = require("./lib/utils/tokens");
exports.passwords = require("./lib/utils/passwords");
exports.sqls = require("./lib/utils/tokens");
exports.tokens = require("./lib/utils/tokens");
exports.validators = require("./lib/utils/validators");
exports.numbers = require("./lib/utils/numbers");
exports.invests = require("./lib/utils/invests");
exports.httpRequests = require("./lib/utils/httpRequests");

exports.crud = require("./lib/hofs/crud");
exports.dao = require("./lib/hofs/dao");
// exports.dao2 = require("./lib/hofs/dao2");
exports.model = require("./lib/hofs/model");
exports.mySqlServer = require("./lib/dbs/mySqlServer");

exports.httpCors = require("./lib/middlewares/httpCors");
exports.hostsCheckPoint = require("./lib/middlewares/hostsCheckPoint");

exports.requestContext = require("./lib/middlewares/requestContext").requestContext;
exports.requestContextEvents = require("./lib/middlewares/requestContext").requestContextEvents;
exports.requestContextMiddleware = require("./lib/middlewares/requestContext").requestContextMiddleware;

//GLobals-------------------------
//Log
gLog = require("./lib/log");
