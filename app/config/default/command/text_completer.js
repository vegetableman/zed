/* global _ */
var session = require("zed/session");
var Map = require("zed/lib/collection").Map;

var splitRegex = /[^a-zA-Z_0-9\$\-]+/;

module.exports = function(info) {
    var path = info.path;

    function getWordIndex(pos) {
        return session.getTextRange(path, {
            row: 0,
            column: 0
        }, pos).then(function(textBefore) {
            return textBefore.split(splitRegex).length - 1;
        });
    }

    /**
     * Does a distance analysis of the word `prefix` at position `pos` in `doc`.
     * @return Map
     */
    function wordDistance(text, pos) {
        return getWordIndex(pos).then(function(prefixPos) {
            var words = text.split(splitRegex);
            var wordScores = new Map();

            var currentWord = words[prefixPos];

            words.forEach(function(word, idx) {
                if (!word || word === currentWord) {
                    return;
                }

                var distance = Math.abs(prefixPos - idx);
                var score = words.length - distance;
                if (wordScores.contains(word)) {
                    wordScores.set(word, Math.max(score, wordScores.get(word)));
                } else {
                    wordScores.set(word, score);
                }
            });

            return wordScores;
        });
    }

    var text;
    return session.getText(path).then(function(text_) {
        text = text_;
        return session.getCursorPosition(path);
    }).then(function(pos) {
        return wordDistance(text, pos);
    }).then(function(wordScores) {
        var wordList = wordScores.keys();
        return wordList.map(function(word) {
            return {
                name: word,
                value: word,
                score: wordScores.get(word),
                meta: "local"
            };
        });
    });
};
