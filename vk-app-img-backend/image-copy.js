import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { promisify } from 'util';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import { createCanvas, loadImage } from 'canvas';

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
    if (parsedUrl.pathname === '/image-copy' && req.method === 'POST') {
        let body = '';
    
        // Read incoming data stream
        req.on('data', (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
    
        // When all data is received
        req.on('end', async () => {
            // Parse JSON data
            let data = JSON.parse(body);

            let images = data.images;

            const downloadImage = async (url) => {
                return new Promise((resolve, reject) => {
                    https.get(url, (response) => {
                        const chunks = [];
                        response.on('data', (chunk) => {
                            chunks.push(chunk);
                        });
                        response.on('end', () => {
                            const buffer = Buffer.concat(chunks);
                            resolve(buffer);
                        });
                    }).on('error', (error) => {
                        reject(error);
                    });
                });
            };
            
            async function compareImages(images) {
                const similarImages = [];
                const seenIds = new Set();
            
                const loadedImages = await Promise.all(images.map(async (image) => {
                    try {
                        const imgBuffer = await downloadImage(image.imgMaxResolution.previewImg);
                        const img = await loadImage(imgBuffer);
                        return {
                            album_id: image.album_id,
                            date: image.date,
                            id: image.id,
                            imgMaxResolution: image.imgMaxResolution,
                            owner_id: image.owner_id,
                            web_view_token: image.web_view_token,
                            img,
                        };
                    } catch (error) {
                        console.error('Error downloading image:', error);
                        return null;
                    }
                }));
            
                for (let i = 0; i < loadedImages.length; i++) {
                    console.log("loading... " + i + " out of " + loadedImages.length);
                    if (!loadedImages[i]) continue;
                    if (seenIds.has(loadedImages[i].id)) continue;
                    for (let j = i + 1; j < loadedImages.length; j++) {
                        if (!loadedImages[j]) continue;
                        const canvas1 = createCanvas(loadedImages[i].img.width, loadedImages[i].img.height);
                        const context1 = canvas1.getContext('2d');
                        context1.drawImage(loadedImages[i].img, 0, 0);
                        const imageData1 = context1.getImageData(0, 0, loadedImages[i].img.width, loadedImages[i].img.height);
            
                        const canvas2 = createCanvas(loadedImages[j].img.width, loadedImages[j].img.height);
                        const context2 = canvas2.getContext('2d');
                        context2.drawImage(loadedImages[j].img, 0, 0);
                        const imageData2 = context2.getImageData(0, 0, loadedImages[j].img.width, loadedImages[j].img.height);
            
                        const diff = new Uint8Array(imageData1.data.length);
                        const numDiffPixels = pixelmatch(imageData1.data, imageData2.data, diff, loadedImages[i].img.width, loadedImages[i].img.height, { threshold: 0.1 });
            
                        if (numDiffPixels < 9000) {
                            loadedImages[j].numDiffPixels = numDiffPixels;
                            if (!seenIds.has(loadedImages[i].id)) {
                                loadedImages[i].similarImages = [];
                                similarImages.push(loadedImages[i]);
                                seenIds.add(loadedImages[i].id);
                            }
                            loadedImages[i].similarImages.push(loadedImages[j]);
                            seenIds.add(loadedImages[j].id);
                            
                            // Creating diff image URL
                            const diffCanvas = createCanvas(loadedImages[i].img.width, loadedImages[i].img.height);
                            const diffContext = diffCanvas.getContext('2d');
                            const diffImageData = new ImageData(new Uint8ClampedArray(diff), loadedImages[i].img.width, loadedImages[i].img.height);
                            diffContext.putImageData(diffImageData, 0, 0);
                            loadedImages[j].diffImage = diffCanvas.toDataURL(); // Convert diff canvas to data URL
                        }
                    }
                }
                return similarImages;
            }
        const similarImages = await compareImages(images);

        data.node_backend = 'ok';
        data.similarImages = similarImages;
        // data.images = images;

        res.setHeader('Content-Type', 'application/json');
        
        res.end(JSON.stringify(data));

        });
    } else {
      // If the request doesn't match the '/image-copy' route, respond with a 404 Not Found
      res.writeHead(404);
      res.end();
    }
  });
  
  // Define the port number for the server to listen on
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  