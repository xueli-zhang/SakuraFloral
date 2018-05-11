const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

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
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
