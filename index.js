const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Echo Track server is running fine!");
});

app.listen(port, () => {
  console.log(`Sever is listening on port ${port}`);
});
