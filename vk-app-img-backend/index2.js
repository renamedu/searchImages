// Importing required modules
var http = require("http");
var fs = require("fs");
var path = require("path");

// Creating a server
http
  .createServer(function (request, response) {
    // Log the requested URL
    console.log("request ", request.url);

    // Constructing file path from requested URL
    var filePath = "." + request.url;
    if (filePath == "./") {
      filePath = "./index.html";
    }

    // Determining content type based on file extension
    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
    };

    // Setting content type or defaulting to binary stream
    var contentType = mimeTypes[extname] || "application/octet-stream";

    // Reading the file asynchronously
    fs.readFile(filePath, function (error, content) {
      if (error) {
        // If file not found, serve a 404 page
        if (error.code == "ENOENT") {
          fs.readFile("./404.html", function (error, content) {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(content, "utf-8");
          });
        } else {
          // If other error, serve a 500 error
          response.writeHead(500);
          response.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n",
          );
        }
      } else {
        // If file is found, serve it with appropriate content type
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content, "utf-8");
      }
    });
  })
  .listen(8000); // Listening on port 8125
console.log("Server running at http://127.0.0.1:8000/");
