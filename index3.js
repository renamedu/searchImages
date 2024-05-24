const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST endpoint to handle requests
app.post('/process', (req, res) => {
    // Assuming the request body contains parameters in JSON format
    const parameters = req.body;

    // Do something with the parameters
    // For example, let's just echo back the received parameters
    const result = {
        message: 'Received parameters:',
        parameters: parameters
    };

    // Sending the result back as JSON
    res.json(result);
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
