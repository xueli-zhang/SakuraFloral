const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateUpdateInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.title = !isEmpty(data.title) ? data.title : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be 2~30 characters long.";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name is required!";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid!";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required!";
  }
  if (Validator.isEmpty(data.title)) {
    errors.title = "Title is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
