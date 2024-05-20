import * as iqdb from '@l2studio/iqdb-api';
import * as http from 'http';
import * as url from 'url';

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the request URL
  const parsedUrl = url.parse(req.url);
  
  // Handle POST requests
  if (parsedUrl.pathname === '/image-search' && req.method === 'POST') {
    let body = '';

    // Read incoming data stream
    req.on('data', (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });

    // When all data is received
    req.on('end', async () => {
      try {
        // Parse JSON data
        let data = JSON.parse(body);
        console.log(data)

        let imgUrl = data.imgUrl;
        const searchImageResult = await iqdb.search(imgUrl);
        
        // Modify the received data
        data.node_backend = 'ok';
        data.searchImageResult = searchImageResult;
        
        // Set response headers
        res.setHeader('Content-Type', 'application/json');
        
        // Send back modified data along with async data in the response
        res.end(JSON.stringify(data));
      } catch (error) {
        console.error('Error occurred:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'An error occurred while processing the image search.' }));
      }
      });
  } else {
    // If the request doesn't match the '/image-search' route, respond with a 404 Not Found
    res.writeHead(404);
    res.end();
  }
});

// Define the port number for the server to listen on
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
