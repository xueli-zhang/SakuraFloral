const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const checkFileType = require("../../validation/checkFileType");
const removeCode = "removeit";

const Stories = require("../../models/Stroy");

//set up storage
const storage = multer.diskStorage({
  destination: "./public/upload/stories",
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

//Init Upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).array("demoImages", 10);

//Validation
const validateStoryInput = require("../../validation/story");

//@route    Get api/posts/test
//@desc     Test posts route
//@access   Public
router.get("/test", (req, res) => {
  res.json({
    msg: "Stories Works"
  });
});

//@route Get api/stories
//@des: Get Stories
//@access Public
router.get("/", (req, res) => {
  Stories.find({})
    .sort({ date: -1 })
    .then(stories => {
      res.json(stories);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

//@route Get api/stories/admin
//@des: Get Stories to Delete
//@access Private
router.get(
  "/admin",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Stories.find({})
      .sort({ date: -1 })
      .then(stories => {
        res.json(stories);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

//@route Post api/stories/add_story
//@des: Create Product Story
//@access Private
router.post(
  "/add_story",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    upload(req, res, cb => {
      const { errors, isValid } = validateStoryInput(req.body);

      if (!isValid) {
        return res.status(400).json(errors);
      }

      const storyInfo = {};
      storyInfo.text = req.body.text;
      storyInfo.name = req.body.name;
      storyInfo.avatar = req.body.avatar;
      storyInfo.user = req.user.id;
      console.log(req.files);
      if (req.files !== undefined) {
        imagPaths = req.files.map(comibineImagPath);
        storyInfo.demoPaths = imagPaths;
      }
      if (req.body.videoUrl !== undefined) {
        storyInfo.videoUrl = req.body.videoUrl;
      }

      const newStory = new Stories(storyInfo);
      //console.log("product info " + storyInfo);
      newStory
        .save()
        .then(story => {
          //console.log(req.files);
          return res.json(story);
        })
        .catch(err => {
          if (err) {
            return res.status(400).json(err);
          }
        });
    });
  }
);

//@route Post api/stories/remove_story
//@des: Delete Product Story
//@access Private
router.post(
  "/remove_story",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.body.removeCode !== removeCode) {
      return res.status(400).json({ msg: "remove failed!" });
    }
    Stories.findOne({ _id: req.body.id }).then(story => {
      //console.log(product);
      if (!story) {
        return res.status(404).json({ msg: "cannot delete unexsited story!" });
      }
      imgPaths = story.demoPaths;
      if (imgPaths !== null) {
        removeImages("./public/", imgPaths);
      }

      story
        .remove()
        .then(() => {
          return res.json("Successfully Deleted Product!");
        })
        .catch(err => {
          return res.status(400).json(err);
        });
    });
  }
);

// Combine Image locations
function comibineImagPath(item, index) {
  return "upload/stories/" + item.filename;
}

function removeImages(filePath, files) {
  files.forEach(file => {
    fs.unlink(filePath + file, err => {
      if (err) {
        return res.status(400).json(err);
      }
      //console.log("file deleted!");
    });
  });
}
module.exports = router;
