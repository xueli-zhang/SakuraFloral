const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const checkFileType = require("../../validation/checkFileType");
const removeCode = "removeit";
const twilSid = require("../../config/twilioAcc").accountSid;
const twilToken = require("../../config/twilioAcc").authToken;
const shopNum = require("../../config/twilioAcc").shopPhone;
const twilNum = require("../../config/twilioAcc").twilNum;

//set up twilio msg client
const client = require("twilio")(twilSid, twilToken);

//Load validation
const validateProductInput = require("../../validation/products");

//set Storage engine
const storage = multer.diskStorage({
  destination: "./public/upload/products/",
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
const Products = require("../../models/Product");

//Load User Authorization Model
const User = require("../../models/User");

//Load Order Model
const Orders = require("../../models/Order");

//@route    Get api/profile/test
//@desc     Test profile route
//@access   Public
router.get("/test", (req, res) => {
  res.json({
    msg: "Products Works"
  });
});

//@route    Get api/products
//@desc     Get Products Page
//@access   Public
router.get("/", (req, res) => {
  Products.find({}, (err, products) => {
    res.json({ products: products });
  });
});

//@route    Get api/products/:nameOrId
//@desc     Get Single Product Page by name Or ID
//@access   Public
router.get("/:nameorid", (req, res) => {
  //console.log(req.params.nameorid);
  Products.findOne({ name: req.params.nameorid })
    .then(product => {
      if (!product) {
        if (mongoose.Types.ObjectId.isValid(req.params.nameorid)) {
          //console.log(req.params.nameorid);
          Products.findOne({ _id: req.params.nameorid }).then(product => {
            if (!product) {
              return res.status(404).json({ msg: "No Such Product!" });
            } else {
              return res.json(product);
            }
          });
        } else {
          return res.status(404).json({ msg: "No Such Product!" });
        }
      } else {
        return res.json(product);
      }
    })
    .catch(err => {
      if (err) {
        return res.status(400).json({ msg: err });
      }
    });
});

//@route    Post api/products/:nameOrId
//@desc     Get Single Product Order by name Or ID
//@access   Public
router.post("/order/:nameorid", (req, res) => {
  if (req.body.phoneNum === undefined) {
    return res.status(400).res.json({ msg: "phone number is required!" });
  }
  if (req.body.orderNum === undefined) {
    req.body.orderNum = "not sure";
  }
  Products.findOne({ name: req.params.nameorid })
    .then(product => {
      if (!product) {
        if (mongoose.Types.ObjectId.isValid(req.params.nameorid)) {
          //console.log(req.params.nameorid);
          Products.findOne({ _id: req.params.nameorid }).then(product => {
            if (!product) {
              return res.status(404).json({ msg: "No Such Product!" });
            } else {
              const orderInfo = {};
              const updateInfo = {};
              orderInfo.clientNum = req.body.phoneNum;
              orderInfo.productName = product.name;
              orderInfo.orderNum = req.body.orderNum;

              updateInfo.rank = product.rank + 1;
              Products.findOneAndUpdate(
                { _id: product.id },
                { $set: updateInfo },
                { new: true }
              ).then(product => {
                console.log(product.rank);
              });
              const msg =
                "Order: " +
                product.name +
                " Amount: " +
                req.body.orderNum +
                " Client Phone Number: " +
                req.body.phoneNum;
              console.log(msg);
              client.messages
                .create({
                  to: shopNum,
                  from: twilNum,
                  body: msg
                })
                .then(message => {
                  const newOrder = new Orders(orderInfo);
                  newOrder.save().then(order => {
                    return res.json({ msg: "Successfully Ordered!" });
                  });
                })
                .catch(err => {
                  if (err) {
                    return res.status(400).json(err);
                  }
                });
            }
          });
        } else {
          return res.status(404).json({ msg: "No Such Product!" });
        }
      } else {
        const orderInfo = {};
        const updateInfo = {};
        orderInfo.clientNum = req.body.phoneNum;
        orderInfo.productName = product.name;
        orderInfo.orderNum = req.body.orderNum;
        updateInfo.rank = product.rank + 1;
        Products.findOneAndUpdate(
          { _id: product.id },
          { $set: updateInfo },
          { new: true }
        ).then(product => {
          console.log(product.rank);
        });
        const msg =
          "Order: " +
          product.name +
          " Amount: " +
          req.body.orderNum +
          " Client Phone Number: " +
          req.body.phoneNum;
        console.log(msg);
        client.messages
          .create({
            to: shopNum,
            from: twilNum,
            body: msg
          })
          .then(message => {
            const newOrder = new Orders(orderInfo);
            newOrder.save().then(order => {
              return res.json({ msg: "Successfully Ordered!" });
            });
          })
          .catch(err => {
            if (err) {
              return res.status(400).json(err);
            }
          });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(400).json({ msg: err });
      }
    });
});
//@route  Get api/products/admin_product/main
//@desc   Get Current User's Authorization
//@acess  private
router.get(
  "/admin_products/main",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //console.log(req.user.id);
    User.findOne({ _id: req.user.id }).then(user => {
      if (!user) {
        return res.status(404).redirect("/invalid");
      }
      //console.log("valid login");
      Products.find({}, (err, products) => {
        if (!products) {
          return res.json({ msg: "you haven't add any products!" });
        }
        res.json({ products: products });
      });
    });
  }
);

//@route  Get api/products/admin/:nameorid
//@desc   Get Single Product for Authorized Users
//@acess  private
router.get(
  "/admin/:nameorid",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //console.log(req.user.id);
    Products.findOne({ name: req.params.nameorid })
      .then(product => {
        if (!product) {
          if (mongoose.Types.ObjectId.isValid(req.params.nameorid)) {
            //console.log(req.params.nameorid);
            Products.findOne({ _id: req.params.nameorid }).then(product => {
              if (!product) {
                return res.status(404).json({ msg: "No Such Product!" });
              } else {
                return res.json(product);
              }
            });
          } else {
            return res.status(404).json({ msg: "No Such Product!" });
          }
        } else {
          return res.json(product);
        }
      })
      .catch(err => {
        if (err) {
          return res.status(400).json({ msg: err });
        }
      });
  }
);

//@route  Get api/products/add_product
//@desc   Get Authorized User Post File Form page
//@acess  private
router.get(
  "/admin_products/add_products",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //console.log(req.user.id);
    User.findOne({ _id: req.user.id }).then(user => {
      if (!user) {
        return res.status(404).redirect("/invalid");
      }
      res.json("render add products page");
    });
  }
);

//@route  Post api/products/add_product
//@desc   Add Or Update Products for Authorized User
//@acess  private
router.post(
  "/add_products",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //check validation
    //console.log(req);

    upload(req, res, cb => {
      const { errors, isValid } = validateProductInput(req.body);

      if (!isValid) {
        return res.status(400).json(errors);
      }
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

      imagPaths = req.files["productImages"].map(comibineImagPath);
      //console.log(imagPaths);
      //console.log(req.files["coverImage"][0].filename);

      const productInfo = {};
      productInfo.name = req.body.name;
      productInfo.facePath =
        "upload/products/" + req.files["coverImage"][0].filename;
      productInfo.bio = req.body.bio;
      productInfo.imgPaths = imagPaths;
      Products.findOne({ name: req.body.name }).then(product => {
        if (product) {
          //update product
          //console.log(productInfo);
          //console.log(product.id);

          imgPaths = product.imgPaths;
          if (imgPaths !== null) {
            removeImages("./public/", imgPaths);
          }
          if (product.facePath !== null) {
            fs.unlink("./public/" + product.facePath, err => {
              if (err) {
                return res.status(400).json(err);
              }
            });
          }
          Products.findOneAndUpdate(
            { _id: product.id },
            { $set: productInfo },
            { new: true }
          )
            .then(product => {
              //console.log("product update ");
              //console.log(product);
              return res.json(product);
            })
            .catch(err => {
              if (err) {
                //console.log("error");
                return res.status(400).json(err);
              }
            });
        } else {
          const newProduct = new Products(productInfo);
          //console.log("product info " + productInfo);
          newProduct
            .save()
            .then(product => {
              //console.log(req.files);
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

//@route  Post api/products/remove_product
//@desc   Remove Products for Authorized User
//@acess  private
router.post(
  "/remove_products",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.body.removeCode !== removeCode) {
      return res.status(400).json({
        msg: "failed to delete!"
      });
    }
    Products.findOne({ _id: req.body.id }).then(product => {
      //console.log(product);
      if (!product) {
        return res
          .status(404)
          .json({ msg: "cannot delete unexsited product!" });
      }
      imgPaths = product.imgPaths;
      if (imgPaths !== null) {
        removeImages("./public/", imgPaths);
      }
      if (product.facePath !== null) {
        fs.unlink("./public/" + product.facePath, err => {
          if (err) {
            return res.status(400).json(err);
          }

          product
            .remove()
            .then(() => {
              return res.json("Successfully Deleted Product!");
            })
            .catch(err => {
              return res.status(400).json(err);
            });
        });
      }
    });
  }
);

// Combine Image locations
function comibineImagPath(item, index) {
  return "upload/products/" + item.filename;
}

//Remove specific image
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
