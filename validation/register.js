const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidateRegisterInput(data){
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.gmail = !isEmpty(data.gmail) ? data.gmail : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.passwordCfm = !isEmpty(data.passwordCfm) ? data.passwordCfm : '';

  if(!Validator.isLength(data.name, {min: 3, max: 20})){
    errors.name ='Tên phải có độ dài từ 3 đến 20 ký tự';
  }
  if(Validator.isEmpty(data.name)){
    errors.name ='Tên không được để trống';
  }
  if(Validator.isEmpty(data.gmail)){
    errors.gmail ='Email không được để trống';
  }
  if(!Validator.isEmail(data.gmail)){
    errors.gmail ='Email không đúng định dạng';
  }
  if(!Validator.isLength(data.password, {min: 8, max: 30})){
    errors.password ='Mật khẩu phải có độ dài từ 8 đến 30 ký tự';
  }
  if(Validator.isEmpty(data.password)){
    errors.password ='Mật khẩu không được để trống';
  }
  if(Validator.isEmpty(data.passwordCfm)){
    errors.passwordCfm ='Cần xác nhận lại mật khẩu';
  }
  if(!Validator.equals(data.password, data.passwordCfm)){
    errors.passwordCfm ='Mật khẩu không trùng khớp';
  }
  

  return {
    errors,
    isValid: isEmpty(errors)
  }
}