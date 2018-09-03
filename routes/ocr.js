'use strict';

var fs = require('fs');
var appRootPath = require('app-root-path').path;
var commMoudle = require(appRootPath + '\\public\\nodejs\\common\\import.js');
var multer = require('multer');
var request = require('request');
var propertiesConfig = require('../config/propertiesConfig.js');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
});

var router = commMoudle.express.Router();

router.get('/favicon.ico', function (req, res) {
    res.status(204).end();
});

// file upload & OCR API
router.post('/api', upload.any(), function (req, res) {
    commMoudle.addLogging(req, JSON.stringify(req.files[0]));
    var f = req.files[0];

    if (f) {
        var targetFilePath = './uploads/' + f.originalname;

        fs.readFile(targetFilePath, function (fsReaderr, data) {
            if (!fsReaderr) {
                var base64 = new Buffer(data, 'binary').toString('base64');
                var binaryString = new Buffer(base64, 'base64').toString('binary');
                var buffer = new Buffer(binaryString, "binary");
                var params = {
                    'language': 'unk',
                    'detectOrientation': 'true'
                };

                request({
                    headers: {
                        'Ocp-Apim-Subscription-Key': propertiesConfig.ocr.subscriptionKey,
                        'Content-Type': 'application/octet-stream'
                    },
                    uri: propertiesConfig.ocr.uri + '?' + 'language=' + params.language + '&detectOrientation=' + params.detectOrientation,
                    body: buffer,
                    method: 'POST'
                }, function (reqErr, response, body) {
                    fs.stat(targetFilePath, function (fsStatError, stat) {
                        if (!fsStatError) {
                            fs.unlinkSync(targetFilePath); // upload file delete
                            if (!reqErr) {
                                if (!((JSON.parse(body)).code)) { // ocr api response success                  
                                    res.send(body);
                                } else { // ocr api request error
                                    console.log(body);
                                    res.send({ code: (JSON.parse(body)).code, message: (JSON.parse(body)).message });
                                }
                            } else { // request module error
                                console.log(reqErr);
                                res.send({ code: 500, error: 'ocr api request error' });
                            }
                        } else { // fs stat error
                            console.log(fsStatError);
                            res.send({ code:500, error: 'There was an error deleting the file.' });
                        }
                    });
                });

            } else { // fs read error
                console.log(fsReaderr);
                res.send({ code:404, error: 'file Not found' });
            }
        });

    } else { // parameter is null
        res.send({ code:400, error: 'parameter is empty' });
    }

});

module.exports = router;

/* url 로 ocr 호출
var uriBase = 'https://westus.api.cognitive.microsoft.com/vision/v1.0/ocr';
var subscriptionKey = 'fedbc6bb74714bd78270dc8f70593122';
var sourceImageUrl = 'http://kr-ocr.azurewebsites.net/uploads/' + f.originalname;
var params = {
    'language': 'unk',
    'detectOrientation': 'true'
};

request({
    headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json'
    },
    uri: uriBase + '?' + 'language=' + params.language + '&detectOrientation=' + params.detectOrientation,
    body: '{"url": ' + '"' + sourceImageUrl + '"}',
    method: 'POST'
}, function (err, response, body) {
    if (err) { // request err
        res.send({ code: 500, message: err });
    } else {
        if ((JSON.parse(body)).code) { // ocr api error
            res.send({ code: (JSON.parse(body)).code, message: (JSON.parse(body)).message });
        } else { // 성공
            commMoudle.addLogging(req, 'Ocr Api Call Success.');
            res.send({ code: 200, result: body });
        }
    }
});
*/
