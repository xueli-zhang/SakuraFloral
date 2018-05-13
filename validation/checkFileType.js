const path = require("path");
// Check File Type
const checkFileType = (file, cb) => {
  //allows
  const filetype = /jpeg|jpg|png|gif/;

  //check
  const extname = filetype.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetype.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb("Error: Images Only!");
};

module.exports = checkFileType;
