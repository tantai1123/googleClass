const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidateLoginInput(data){
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if(Validator.isEmpty(data.name)){
    errors.name ='Tên đăng nhập không được để trống';
  }
  if(Validator.isEmpty(data.password)){
    errors.password ='Mật khẩu không được để trống';
  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  }
}