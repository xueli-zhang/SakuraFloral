const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const permitCode = "yoyoiloveu"; //use different permitCode when running
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = require("../../config/keys").secretKey;
const passport = require("passport");
const path = require("path");
const multer = require("multer");
const checkFileType = require("../../validation/checkFileType");
const fs = require("fs");

//Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateUpdateInput = require("../../validation/userUpdate");

//Set up Storage
const storage = multer.diskStorage({
  destination: "./public/upload/avatars/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 100) +
        path.extname(file.originalname)
    );
  }
});

//Init upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single("avatar");

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
  upload(req, res, err => {
    if (req.file === undefined) {
      avPath = "upload/avatars/default.png";
    } else {
      avPath = "upload/avatars/" + req.file.filename;
    }
    var inviteCode = req.body.permitCode;
    console.log(inviteCode);
    if (inviteCode !== permitCode) {
      return res
        .status(400)
        .json("Watch Dog: Permission Denied! You are not invited!");
    }

    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
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
          avatarPath: avPath,
          title: req.body.title,
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
});

//@route    Get api/admin/login
//@desc     Login admins/ Returning JWT
//@access   Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const name = req.body.nameOrEmail;
  const email = req.body.nameOrEmail;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      User.findOne({ name }).then(user => {
        if (!user) {
          return res.status(404).json({
            nameOrEmail: "Permission Denied!",
            password: "Permissin Denied!"
          });
        } else {
          bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
              //User matched

              const payload = {
                id: user.id,
                name: user.name
              };
              //sign token
              jwt.sign(
                payload,
                secretKey,
                {
                  expiresIn: 7200
                },
                (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token
                  });
                }
              );
            } else {
              return res.status(400).json({
                nameOrEmail: "Permission Denied!",
                password: "Permissin Denied!"
              });
            }
          });
        }
      });
    } else {
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //User matched

          const payload = {
            id: user.id,
            name: user.name
          };
          //sign token
          jwt.sign(
            payload,
            secretKey,
            {
              expiresIn: 7200
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res.status(400).json({
            nameOrEmail: "Permission Denied!",
            password: "Permissin Denied!"
          });
        }
      });
    }
  });
});

//@route Get api/admin/current
//@desc Return current User
//@access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      avatarPath: req.user.avatarPath,
      email: req.user.email,
      date: req.user.date
    });
  }
);

//@route Post api/admin/update
//@desc Update current User
//@access Private
router.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    upload(req, res, err => {
      if (req.file === undefined) {
        avPath = "upload/avatars/default.png";
      } else {
        avPath = "upload/avatars/" + req.file.filename;
      }
      const { errors, isValid } = validateUpdateInput(req.body);
      if (!isValid) {
        return res.status(400).json(errors);
      }
      User.findOne({
        email: req.user.email
      }).then(user => {
        if (!user) {
          return res.status(400).json({
            msg:
              "Alarm! Unauthorized hecker found! Stop Hacking! Tracking your location now!"
          });
        } else {
          if (
            user.avatarPath !== null &&
            user.avatarPath !== "upload/avatars/default.png"
          ) {
            fs.unlink("./public/" + user.avatarPath, err => {
              if (err) {
                return res.status(400).json(err);
              }
            });
          }
          const updateInfo = {};
          updateInfo.name = req.body.name;
          updateInfo.email = req.body.email;
          updateInfo.avatarPath = avPath;
          updateInfo.title = req.body.title;
          User.findOneAndUpdate(
            { _id: user.id },
            { $set: updateInfo },
            { new: true }
          ).then(user => {
            return res.json(user);
          });
        }
      });
    });
  }
);
module.exports = router;
