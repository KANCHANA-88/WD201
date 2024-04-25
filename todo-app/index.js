const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the port provided by the environment or default to 3000

const app = require("./app");



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
