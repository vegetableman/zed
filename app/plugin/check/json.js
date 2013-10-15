define(function(require, exports, module) {
    var session = require("zed/session");

    var parse = require("./json_parse.js");

    return function(data, callback) {
        var path = data.path;
        session.getText(path, function(err, text) {
            try {
                parse(text);
            } catch (e) {
                var lines = text.substring(0, e.at).split("\n");
                return session.setAnnotations(path, [{
                    row: lines.length-1,
                    text: e.message,
                    type: "error"
                }], callback);
            }
            session.setAnnotations(path, [], callback);
        });
    };
});