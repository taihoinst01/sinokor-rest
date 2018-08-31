'use strict';

var commMoudle = require(require('app-root-path').path + '\\public\\nodejs\\common\\import.js');

var app = commMoudle.express();

app.use(commMoudle.logger('dev'));
app.use(commMoudle.bodyParser.json());
app.use(commMoudle.bodyParser.urlencoded({ extended: false }));
app.use(commMoudle.cookieParser());
app.use('/uploads', commMoudle.express.static(__dirname + '/uploads'));

app.set('port', process.env.PORT || 80);

var server = app.listen(app.get('port'), function () {
    console.log('proxy server listening on port ' + server.address().port);
});

