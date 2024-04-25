const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the port provided by the environment or default to 3000

// Define route to handle requests to the root URL
app.get('/', (req, res) => {
  res.send('Hello, World!'); // Respond with a simple message
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
