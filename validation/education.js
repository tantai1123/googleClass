const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : '';
  data.degree = !isEmpty(data.degree) ? data.degree : '';
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if(Validator.isEmpty(data.school)){
    errors.school = 'Không được để trống';
  }
  if(Validator.isEmpty(data.degree)){
    errors.degree = 'Không được để trống';
  }
  if(Validator.isEmpty(data.fieldofstudy)){
    errors.fieldofstudy = 'Không được để trống';
  }
  if(Validator.isEmpty(data.from)){
    errors.from = 'Không được để trống';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};