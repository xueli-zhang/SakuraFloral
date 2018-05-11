const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};
  data.nameOrEmail = !isEmpty(data.nameOrEmail) ? data.nameOrEmail : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.nameOrEmail)) {
    errors.name = "Name Or Email is required!";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
