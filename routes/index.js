'use strict';

var commMoudle = require(require('app-root-path').path + '\\public\\js\\common\\import.js');
var router = commMoudle.express.Router();

router.get('/favicon.ico', function (req, res) {
    res.status(204).end();
});

// home
router.get('/', function (req, res) {
    res.render('index');
});

module.exports = router;
