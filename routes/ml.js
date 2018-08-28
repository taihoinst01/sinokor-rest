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
    var data = req.body.data.data;
	var type = req.body.type;
	var param = [];
	var targetPy = '';
	var ogCompany = [];
	var ctnm = [];
    var isRun = true;

    try {
        if (type == 'formLabelMapping') {
            targetPy = 'formLabelMapping.py';
            for (var i in data) {
                param.push({ DATA: "'" + data[i].sid.replace(/,/g, "','") + "'", CLASS: 0 });
            }
        } else if (type == 'formMapping') {
            if (!req.body.data.docCategory) {
                targetPy = 'formMapping.py';

                for (var i in data) {
                    if (data[i].formLabel == 0) {
                        ogCompany.push(data[i].text);
                    } else if (data[i].formLabel == 1) {
                        ctnm.push(data[i].text);
                    }
                }

                if (ogCompany.length == 1 && ctnm.length == 1) {
                    param.push({ DATA: "'" + ogCompany[0].replace(/,/g, "','") + "','" + ctnm[0].replace(/,/g, "','") + "'", CLASS: 0 });
                } else if (ogCompany.length > 1 && ctnm.length == 1) {
                    for (var i in ogCompany) {
                        param.push({ DATA: "'" + ogCompany[i].replace(/,/g, "','") + "','" + ctnm[0].replace(/,/g, "','") + "'", CLASS: 0 });
                    }
                } else if (ogCompany.length == 1 && ctnm.length > 1) {
                    for (var i in ctnm) {
                        param.push({ DATA: "'" + ogCompany[0].replace(/,/g, "','") + "','" + ctnm[i].replace(/,/g, "','") + "'", CLASS: 0 });
                    }
                }
                param.push({ DATA: data[i].sid, CLASS: 0 });
            } else {
                req.body.data.docCategory.score = 0.99;
                isRun = false;
            }
        } else if (type == 'columnMapping') {
            targetPy = 'columnMapping.py';
            for (var i in data) {
                if (!data[i].colLbl) {
                    param.push({ DATA: "'" + req.body.data.docCategory.DOCTYPE + "','" + data[i].sid.replace(/,/g, "','") + "'", CLASS: 0 });
                } else {
                    data[i].colAccu = 0.99;
                }
            }
        }
        if (isRun && param.length != 0) {
            //Azure WebApp
            var options = {
                mode: 'json',
                encoding: 'utf8',
                pythonPath: 'D:\\home\\python354x64\\python.exe',
                pythonOptions: ['-u'],
                scriptPath: require('app-root-path').path + '\\ml',
                args: [JSON.stringify(param)]
            };

            /*
            var options = {
                mode: 'json',
                encoding: 'utf8',
                pythonPath: '',
                pythonOptions: ['-u'],
                scriptPath: require('app-root-path').path + '\\ml',
                args: [JSON.stringify(param)]
            };
            */

            pythonShell.run(targetPy, options, function (err, results) {
                if (err) {
                    console.log(err);
                    res.send({ code: 500, message: err });
                } else {
                    results[0] = results[0].replace(/Scored Labels/gi, 'ScoredLabels');
                    results[0] = results[0].replace(/Scored Probabilities/gi, 'ScoredProbabilities');
                    var outResult = JSON.parse(results[0]).Results.output1;

                    if (type == 'formLabelMapping') {
                        for (var i in outResult) {
                            if (req.body.data.data[i].sid == outResult[i].DATA.replace(/'/g, '')) {
                                if (!req.body.data.data[i].formLabel) {
                                    req.body.data.data[i].formLabel = outResult[i].ScoredLabels;
                                }
                            }
                        }
                    } else if (type == 'formMapping') {
                        var docNum = 0;
                        var docScore = 0;
                        for (var i in outResult) {
                            if (outResult[i]['ScoredProbabilities for Class "' + outResult[i].ScoredLabels + '"'] > docScore) {
                                docNum = outResult[i].ScoredLabels;
                                docScore = outResult[i]['ScoredProbabilities for Class "' + outResult[i].ScoredLabels + '"'];
                            }
                        }
                        req.body.data.docCategory = { DOCTYPE: docNum, Score: docScore };
                    } else if (type == 'columnMapping') {
                        for (var i in outResult) {
                            if (req.body.data.docCategory.DOCTYPE + ',' + req.body.data.data[i].sid == outResult[i].DATA.replace(/'/g, '')) {
                                if (!req.body.data.data[i].colLbl) {
                                    req.body.data.data[i].colLbl = outResult[i].ScoredLabels;
                                    req.body.data.data[i].colAccu = outResult[i]['ScoredProbabilities for Class "' + outResult[i].ScoredLabels + '"'];
                                }
                            }
                        }
                    }
                    commMoudle.addLogging(req, type + ' Machine Learning Query Success.');
                    res.send(req.body.data);
                }
            });
        } else {
            res.send(req.body.data);
        }
    } catch (e) {
        console.log(e);
        res.send(req.body.data);
    }
});


// 학습파일(.csv) 데이터 추가
router.post('/train', function (req, res) {
    commMoudle.addLogging(req, JSON.stringify(req.body));
    var flmdata = req.body.flmdata;
	var fmData = req.body.fmData;
	var cmData = req.body.cmData;
	var dataArr = [flmdata, fmData, cmData];
	var csvPathArr = ['formLabelMapping.csv','formMapping.csv','columnMapping.csv'];

    try {
        for (var i in dataArr) {
            var trainData = dataArr[i];

            var csvPath = require('app-root-path').path + '\\uploads\\trainData\\' + csvPathArr[i];
            var writer = csvWriter();

            if (!commMoudle.fs.existsSync(csvPath)) {
                writer = csvWriter({ headers: ['DATA', 'CLASS'] });
            } else {
                writer = csvWriter({ sendHeaders: false });
            }
            writer.pipe(commMoudle.fs.createWriteStream(csvPath, { flags: 'a' }));
            for (var i = 0; i < trainData.length; i++) {
                var item = trainData[i];
                writer.write({
                    DATA: "'" + item.data.replace(/,/g, "','") + "'",
                    CLASS: item.class
                });
            }
            commMoudle.addLogging(req, 'Machine Learning ReTrain Success.')
            writer.end();
        }

        res.send({ code: 200, message: 'Machine Learning ReTrain Success.' });
    } catch (e) {
        res.send({ code: 500, message: e });
    }
});

module.exports = router;
