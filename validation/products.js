const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProductInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.flies["coverImage"] = !isEmpty(data.flies["coverImage"])
    ? data.flies["coverImage"]
    : "";
  data.files["productImages"] = !isEmpty(data.files["productImages"])
    ? data.files["productImages"]
    : "";
  data.bio = !isEmpty(data.bio) ? data.bio : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name is required!";
  }
  if (Validator.isEmpty(data.coverImage)) {
    errors.coverImage = "Cover Image is required!";
  }
  if (Validator.isEmpty(data.productImages)) {
    errors.productImages = "Product Images are required!";
  }
  if (Validator.isEmpty(data.bio)) {
    errors.bio = "Description is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
