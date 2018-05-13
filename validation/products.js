const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProductInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";

  data.bio = !isEmpty(data.bio) ? data.bio : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name is required!";
  }

  if (Validator.isEmpty(data.bio)) {
    errors.bio = "Description is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
