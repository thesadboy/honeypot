var Fs = require('fs');
var Path = require('path');
var UriUtil = require('../utils/uri');
var clients = require('memory-cache');
var lineReader = require('line-reader');

exports.getM3U8 = function (caseInfo, path, req, res, next) {
    if (UriUtil.getNameByUrl(path) == caseInfo.index) {
        getMusterM3U8(path, req, res, next);
    } else {
        getMediaM3U8(caseInfo, path, req, res, next);
    }
}

var getMusterM3U8 = function (path, req, res, next) {
    var id = req.params.id;
    var uuid = req.query.uuid;
    if(!clients.get(uuid) || !clients.get(uuid)[id]){
        return res.redirect('/case/error');
    }
    var m3u8 = Fs.readFileSync(path).toString();
    m3u8 = UriUtil.replaceM3U8Url(m3u8, id, uuid);
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Content-Length', new Buffer(m3u8).length);
    res.send(m3u8);
};

var getMediaM3U8 = function (caseInfo, path, req, res, next) {
    var id = req.params.id;
    var uuid = req.query.uuid;
    var live = clients.get(uuid)[id];
    var pos = live.pos;
    var medias = live.medias;
    var realPos = pos % medias;
    var mul = (pos - realPos) / medias;
    var isMedia = false;
    var aM3U8 = [];
    var aMedia = [];
    var readed = 0;
    var maxread = 5;
    var keypos = 0;
    lineReader.eachLine(path, function (line) {
        if (line.match(/^#EXTINF/)) {
            aMedia.push({
                'INF': line,
                'URI': null
            });
            isMedia = true;
        } else if (line.match(/^#EXT-X-KEY/)) {
            aMedia.push({'KEY': line.replace(/(#EXT-X-KEY[^\n\r]+URI=")([^\"\r\n]+)("[^\n\r]+)/gi, function (matches, $1, $2, $3) {
                var keyName = UriUtil.getNameByUrl($2);
                if (Path.extname(keyName) == '') {
                    keyName = 'key_' + keypos + '.key';
                }
                return $1 + keyName + $3;
            })});
            keypos++;
        } else if (line.match(/^#EXT-X-MEDIA-SEQUENCE/)) {
            aM3U8.push('#EXT-X-MEDIA-SEQUENCE:' + pos);
        } else if (line.match(/^#EXT-X-DISCONTINUITY/) || line.match(/^#EXT-X-ENDLIST/)) {
            //不需要处理
        } else {
            if (isMedia) {
                var lastItem = aMedia[aMedia.length - 1];
                if (typeof lastItem == 'object') {
                    line = line.replace(/^([^#]+_)(\d+)(\.ts)$/, function (matches, $1, $2, $3) {
                        return $1 + (mul * medias + Number($2)) + $3;
                    });
                    lastItem['URI'] = line;
                    isMedia = false;
                }
            } else {
                aM3U8.push(line);
            }
        }
    }).then(function () {
        aMedia = aMedia.concat(aMedia);
        var hasRest = false;
        for (var i = 0; i < aMedia.length; i++) {
            if (readed < maxread + realPos) {
                var item = aMedia[i];
                if (item['KEY']) {
                    if (aM3U8[aM3U8.length - 1].match(/^#EXT-X-KEY/)) {
                        aM3U8[aM3U8.length - 1] = item['KEY'];
                    } else {
                        aM3U8.push(item['KEY']);
                    }
                } else {
                    readed++;
                    if (readed > realPos) {
                        if (readed <= medias) {
                            aM3U8.push(item['INF'], item['URI']);
                        }
                        if (readed >= medias && !hasRest) {
                            hasRest = true;
                            aM3U8.push('#EXT-X-DISCONTINUITY');
                        }
                        if (readed > medias) {
                            aM3U8.push(item['INF'], item['URI'].replace(/^([^#]+_)(\d+)(\.ts)$/, function (matches, $1, $2, $3) {
                                return $1 + (medias + Number($2)) + $3;
                            }));
                        }
                    }
                }
            }
        }
        var m3u8 = aM3U8.join('\n');
        m3u8 = UriUtil.replaceM3U8Url(m3u8, id, uuid);
        console.log('------------------------------------------------------------');
        console.log(m3u8);
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Content-Length', new Buffer(m3u8).length);
        res.send(m3u8);
    });
};