'use strict';

var commMoudle = require(require('app-root-path').path + '\\public\\js\\common\\import.js');
var multer = require('multer');
var request = require('request');

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
                    res.send({ code: 200, result: body });
                }
            }
        });
    } else { // file not found
        res.send({ code: 404, message: '요청 파일이 없습니다.' });
    }

});

module.exports = router;
