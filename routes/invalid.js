const express = require("express");
const router = express.Router();

//@route    Get api/invalid
//@desc     Show invalid page
//@access   Public

router.get("/", (req, res) => {
  res.send("404, Page doesn't exist!");
});

module.exports = router;
