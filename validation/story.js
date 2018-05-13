const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateStoryInput(data) {
  let errors = {};
  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 3, max: 500 })) {
    errors.text = "Post must be between 3 and 500 characters";
  }
  if (Validator.isEmpty(data.text)) {
    errors.text = "Text is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
