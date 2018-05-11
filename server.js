const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const products = require("./routes/api/products");
const posts = require("./routes/api/posts");
const invalid = require("./routes/invalid");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//DB config

const db = require("./config/keys").mongoURI;

//Connect to MongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch(err => {
    console.log(err);
  });

app.use(passport.initialize());

//passport config
require("./config/passport")(passport);

//Use Routes
app.use("/api/admin", users);
app.use("/api/products", products);
app.use("/api/posts", posts);
app.use("/invalid", invalid);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
