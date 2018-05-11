const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const permitCode = "yoyoiloveu";
const bcrypt = require("bcryptjs");

//@route    Get api/users/test
//@desc     Test users route
//@access   Public

router.get("/test", (req, res) => {
  res.json({
    msg: "Users Works"
  });
});

//@route    Get api/admin/register
//@desc     register admins
//@access   Public

router.post("/register", (req, res) => {
  var inviteCode = req.body.permitCode;
  if (inviteCode !== permitCode) {
    return res
      .status(400)
      .json("Watch Dog: Permission Denied! You are not invited!");
  }
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exisits!" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

module.exports = router;

//@route    Get api/admin/login
//@desc     Login admins/ Returning JWT
//@access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  //Find user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({
        email: "Permission Denied!",
        password: "Permissin Denied!"
      });
    }
    User.findOne({ name }).then(user => {
      if (!user) {
        return res.status(404).json({
          email: "Permission Denied!",
          password: "Permissin Denied!"
        });
      }
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          res.json({ msg: "Success" });
        } else {
          return res.status(400).json({
            email: "Permission Denied!",
            password: "Permissin Denied!"
          });
        }
      });
    });
  });
});
