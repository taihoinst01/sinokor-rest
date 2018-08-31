'use strict';

var commMoudle = require(require('app-root-path').path + '\\public\\nodejs\\common\\import.js');

var index = require('./routes/index');
var ocr = require('./routes/ocr');
var ml = require('./routes/ml');

var app = commMoudle.express();

app.set('views', commMoudle.path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(commMoudle.logger('dev'));
app.use(commMoudle.bodyParser.json());
app.use(commMoudle.bodyParser.urlencoded({ extended: false }));
app.use(commMoudle.cookieParser());
app.use(commMoudle.express.static(commMoudle.path.join(__dirname, 'public')));
app.use('/uploads', commMoudle.express.static(__dirname + '/uploads'));

app.use('/', index);
app.use('/ocr', ocr);
app.use('/ml', ml);

app.set('port', process.env.PORT || 8888);

var server = app.listen(app.get('port'), function () {
    console.log('proxy server listening on port ' + server.address().port);
});

