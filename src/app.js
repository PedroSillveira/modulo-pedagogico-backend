const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.set("trust proxy", 1);

const pedagogico = require("./routes/pedagogico");
const publicRoutes = require("./routes/public");

app.use("/pedagogico", pedagogico);
app.use("/public", publicRoutes);

app.listen(4444, () => {
  console.log(`Rodando na porta 4444`);
});