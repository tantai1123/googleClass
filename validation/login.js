const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidateLoginInput(data){
  let errors = {};

  data.gmail = !isEmpty(data.gmail) ? data.gmail : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if(!Validator.isEmail(data.gmail)){
    errors.gmail ='Email không đúng định dạng';
  }
  if(Validator.isEmpty(data.gmail)){
    errors.gmail ='Email không được để trống';
  }
  if(Validator.isEmpty(data.password)){
    errors.password ='Mật khẩu không được để trống';
  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  }
}