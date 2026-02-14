const express = require("express");

const app = express();


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const db = require("./models");

const routes = require("./routes");

db.sequelize.sync();

// normal use. Doesn't delete the database data

// In development, you may need to drop existing tables and re-sync database
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to CISNE application."});
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});