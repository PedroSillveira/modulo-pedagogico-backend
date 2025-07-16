const express = require("express");
const app = express();
const cors = require("cors");

// CONFIGURAÇÃO CORS COM UTF-8
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// CONFIGURAÇÃO EXPRESS COM UTF-8 EXPLÍCITO
app.use(
  express.json({
    limit: "20mb",
    type: "application/json",
    charset: "utf-8",
  })
);

app.use(
  express.urlencoded({
    limit: "20mb",
    extended: true,
    type: "application/x-www-form-urlencoded",
    charset: "utf-8",
  })
);

app.set("trust proxy", 1);

// MIDDLEWARE PARA FORÇAR UTF-8
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

const pedagogico = require("./routes/pedagogico");
const publicRoutes = require("./routes/public");

app.use("/pedagogico", pedagogico);
app.use("/public", publicRoutes);

app.listen(4444, () => {
  console.log(`Rodando na porta 4444`);
});
