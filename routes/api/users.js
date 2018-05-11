const express = require("express");
const router = express.Router();

//@route    Get api/users/test
//@desc     Test users route
//@access   Public

router.get("/test", (req, res) => {
  res.json({
    msg: "Users Works"
  });
});

module.exports = router;
