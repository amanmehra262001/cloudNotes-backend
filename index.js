const connectToMongo = require("./db");
const cors = require("cors");

connectToMongo();
const express = require("express");
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

//Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});