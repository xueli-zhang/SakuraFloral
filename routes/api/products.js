const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Product Model
const Products = require("../../models/Products");

//Load User Authorization
const User = require("../../models/User");

//@route    Get api/profile/test
//@desc     Test profile route
//@access   Public

router.get("/test", (req, res) => {
  res.json({
    msg: "Products Works"
  });
});

//@route  Get api/product
//@desc   Get Current User's Authorization
//@acess  private
router.get(
  "/admin_products",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user.id);
    User.findOne({ _id: req.user.id }).then(user => {
      if (!user) {
        return res.status(404).redirect("/invalid");
      }
      console.log("valid login");
      Products.find({}, (err, products) => {
        res.json({ products: products });
        console.log("done!");
      });
    });
  }
);
module.exports = router;
