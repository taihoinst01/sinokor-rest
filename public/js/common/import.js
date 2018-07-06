var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var log4js = require('log4js');
log4js.configure({
    appenders: {
        access: {
            type: 'dateFile',
            filename: 'logs/access.log',
            pattern: "-yyyy-MM-dd",
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %X{url} : %m'
            }
        }
    },
    categories: {
        default: {
            appenders: ['access'],
            level: 'info'
        }
    }
});

addLogging = function (req, context) {
    var logging = log4js.getLogger();
    if (req.originalUrl) {
        logging.addContext('url', req.originalUrl);
    } else if (req._parsedOriginalUrl.path) {
        logging.addContext('url', req._parsedOriginalUrl.path);
    } else {
        logging.addContext('url', req.url);
    }
    logging.info(context);
}

exports.debug = debug;
exports.express = express;
exports.path = path;
exports.favicon = favicon;
exports.logger = logger;
exports.cookieParser = cookieParser;
exports.bodyParser = bodyParser;
exports.fs = fs;
exports.log4js = log4js;
exports.addLogging = addLogging;