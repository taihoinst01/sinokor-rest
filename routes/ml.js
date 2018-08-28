'use strict';

var commMoudle = require(require('app-root-path').path + '\\public\\js\\common\\import.js');
var pythonShell = require('python-shell');
var csvWriter = require('csv-write-stream');

var router = commMoudle.express.Router();

router.get('/favicon.ico', function (req, res) {
    res.status(204).end();
});

router.post('/api', function (req, res) {
    commMoudle.addLogging(req, JSON.stringify(req.body.data));
    var fvParams = req.body.data;

    // 고정가변 분류 알고리즘
    var options = {
        mode: 'json',
        encoding: 'utf8',
        pythonPath: 'D:\\home\\python354x64\\python.exe',
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
            var fvResult = JSON.parse(results[0]).Results.output1;

            commMoudle.addLogging(req, 'fixed or variable Classification Machine Learning Query Success.');
            res.send({ code: 200, result: fvResult });
        }
    });
});


// 학습파일(.csv) 데이터 추가
router.post('/train', function (req, res) {
    commMoudle.addLogging(req, JSON.stringify(req.body));
    var flmdata = req.body.flmdata;
	var fmData = req.body.fmData;
	var cmData = req.body.cmData;
	var dataArr = [flmdata, fmData, cmData];
	var csvPathArr = ['formLabelMapping.csv','formMapping.csv','columnMapping.csv'];
	
	for(var i in dataArr){
		var trainData = dataArr[i];
		
		var csvPath = require('app-root-path').path + '\\uploads\\trainData\\' + csvPathArr[i];
		var writer = csvWriter();

		if (!commMoudle.fs.existsSync(csvPath)){
			writer = csvWriter({ headers: ['DATA', 'CLASS'] });
		} else {
			writer = csvWriter({ sendHeaders: false });
		}
		writer.pipe(commMoudle.fs.createWriteStream(csvPath, { flags: 'a' }));
		for (var i = 0; i < trainData.length; i++) {
			var item = trainData[i];
			writer.write({
				DATA: "'" + item.data.replace(/,/g,"','") + "'",
				CLASS: item.class
			});
		}
		commMoudle.addLogging(req, 'Machine Learning ReTrain Success.')
		writer.end();
	}

    res.send({ code: 200, message: 'Machine Learning ReTrain Success.' });
});

module.exports = router;
