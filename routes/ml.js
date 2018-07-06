'use strict';

var commMoudle = require('./public/js/common/import.js');
var pythonShell = require('python-shell');
var csvWriter = require('csv-write-stream');

var router = commMoudle.express.Router();

router.get('/favicon.ico', function (req, res) {
    res.status(204).end();
});

router.post('/api', function (req, res) {
    var fvParams = req.body.data;

    // 고정가변 분류 알고리즘
    var options = {
        mode: 'json',
        encoding: 'utf8',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: require('app-root-path').path + '\\ml',
        args: fvParams
    };

    pythonShell.run('fvClassification.py', options, function (err, results) {
        if (err) {
            res.send({ code: 500, message: err });
        } else {
            results[0] = results[0].replace(/Scored Labels/gi, 'ScoredLabels');
            results[0] = results[0].replace(/Scored Probabilities/gi, 'ScoredProbabilities');
            var fvResult = JSON.parse(results[0]).Results.output;

            res.send({ code: 200, result: fvResult });
        }
    });
});


// 학습파일(.csv) 데이터 추가
router.get('/train', function (req, res) {
    //var fvParams = req.body.data;
    var trainData = [
        '1::1::test::TRUE',
        '12::12::안녕::TRUE',
        '123::123::test2::FALSE'
    ];
    var csvPath = require('app-root-path').path + '\\uploads\\trainData\\httpTest.csv';
    var writer = csvWriter();

    if (!commMoudle.fs.existsSync(csvPath)){
        writer = csvWriter({ headers: ['x', 'y', 'text', 'isFixed'] });
    } else {
        writer = csvWriter({ sendHeaders: false });
    }
    writer.pipe(commMoudle.fs.createWriteStream(csvPath, { flags: 'a' }));
    for (var i = 0; i < trainData.length; i++) {
        var item = trainData[i].split('::');
        writer.write({
            x: item[0],
            y: item[1],
            text: item[2],
            isFixed: item[3]
        });
    }
    writer.end();

    res.send({});
});

module.exports = router;
