var PORT = 80;

var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var mime = require("./mime").types;
var config = require("./expires");

var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var realPath = "assets" + pathname;
    console.log(realPath);

    path.exists(realPath, function (exists) {

        var ext = path.extname(realPath);
        ext = ext ? ext.slice(1) : 'unknown';
        var contentType = mime[ext] || "text/plain";

        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();

        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': contentType
                    });

                    response.end(err);
                } else {

                    if (ext.match(config.Expires.fileMatch)) {
                        var expires = new Date();
                        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
                        response.setHeader("Expires", expires.toUTCString());
//                        response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);

                        var lastModified = "Sat, 09 Nov 2013 13:01:18 GMT";
                        response.setHeader("Last-Modified", lastModified);
                    }

                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
});


server.listen(PORT);

console.log("Server runing at port: " + PORT + ".");