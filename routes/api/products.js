const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const multer = require("multer");

//set Storage engine
const storage = multer.diskStorage({
  destination: "./public/upload/products/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  {
    name: "coverImage",
    maxCount: 1
  },
  {
    name: "productImages",
    maxCount: 10
  }
]);

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

//@route  Get api/adim_product
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
      });
    });
  }
);

//@route  Get api/adim_product
//@desc   Get Authorized User Post File page
//@acess  private
router.get(
  "/add_products",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user.id);
    User.findOne({ _id: req.user.id }).then(user => {
      if (!user) {
        return res.status(404).redirect("/invalid");
      }
      res.json("render add products page");
    });
  }
);

//@route  Post api/add_product
//@desc   Add Products for Authorized User
//@acess  private
router.post(
  "/add_products",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    upload(req, res, err => {
      if (req.files === undefined) {
        return res
          .status(400)
          .json({ msg: "Error: No Cover and Production Images Selected!" });
      }
      if (
        req.files["coverImage"] === undefined ||
        req.files["productImages"] === undefined
      ) {
        return res
          .status(400)
          .json({ msg: "Error: No Cover or Production Images Selected!" });
      }
      if (err) {
        console.log(err);
        return res.status(400).json({ msg: err });
      }

      imagPaths = req.files["productImages"].map(comibineImagPath);
      console.log(imagPaths);
      console.log(req.files["coverImage"][0].filename);

      const productInfo = {};
      productInfo.name = req.body.name;
      productInfo.facePath =
        "upload/products/" + req.files["coverImage"][0].filename;
      productInfo.bio = req.body.bio;
      productInfo.imagPaths = imagPaths;
      Products.findOne({ name: req.body.name }).then(product => {
        if (product) {
          //update product
          console.log(productInfo);
          console.log(product.id);
          Products.findOneAndUpdate(
            { _id: product.id },
            { $set: productInfo },
            { new: true }
          )
            .then(product => {
              console.log("product update ");
              console.log(product);
              return res.json(product);
            })
            .catch(err => {
              if (err) {
                console.log("error");
                return res.status(400).json(err);
              }
            });
        } else {
          const newProduct = new Products(productInfo);
          console.log("product info " + productInfo);
          newProduct
            .save()
            .then(product => {
              console.log(req.files);
              return res.json(product);
            })
            .catch(err => {
              if (err) {
                return res.status(400).json(err);
              }
            });
        }
      });
    });
  }
);

// Check File Type
function checkFileType(file, cb) {
  //allows
  const filetype = /jpeg|jpg|png|gif/;

  //check
  const extname = filetype.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetype.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb("Error: Images Only!");
}

function comibineImagPath(item, index) {
  return "upload/products/" + item.filename;
}
module.exports = router;
