const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidateStoryInput(data){
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : '';
  data.cmttext = !isEmpty(data.cmttext) ? data.cmttext : '';
  // data.password = !isEmpty(data.password) ? data.password : '';
    if(Validator.isEmpty(data.text)){
    errors.text ='Nội dung không được để trống';
  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  }
}