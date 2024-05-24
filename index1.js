// Importing required modules
const http = require('http');
const url = require('url');

// Creating a server
const server = http.createServer((req, res) => {
    // Parsing the URL to get the query string
    const parsedUrl = url.parse(req.url, true);
    // Extracting the input string from the query parameters
    const inputString = parsedUrl.query.string;

    console.log("parsedUrl" + parsedUrl);
    console.log(parsedUrl.query);
    console.log(parsedUrl.query.string);

    // Setting the response headers
    res.writeHead(200);

    // Sending back the input string as the response
    res.end(`You entered: ${inputString}`);
});

// Specifying the port to listen on
const port = 8000;

// Starting the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
