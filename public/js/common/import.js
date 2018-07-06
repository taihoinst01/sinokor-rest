var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

exports.debug = debug;
exports.express = express;
exports.path = path;
exports.favicon = favicon;
exports.logger = logger;
exports.cookieParser = cookieParser;
exports.bodyParser = bodyParser;
exports.fs = fs;