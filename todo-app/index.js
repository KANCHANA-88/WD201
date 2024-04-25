const port = process.env.PORT || 3000; // Use the port provided by the environment or default to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
