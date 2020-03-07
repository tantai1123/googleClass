const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidatePasswordInput(data){
  let errors = {};

  data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : '';
  data.passwordCfm = !isEmpty(data.passwordCfm) ? data.passwordCfm : '';

  if(!Validator.isLength(data.newPassword, {min: 8, max: 30})){
    errors.newPassword ='Mật khẩu phải có độ dài từ 8 đến 30 ký tự';
  }
  if(Validator.isEmpty(data.newPassword)){
    errors.newPassword ='Mật khẩu không được để trống';
  }
  if(Validator.isEmpty(data.passwordCfm)){
    errors.passwordCfm ='Cần xác nhận lại mật khẩu';
  }
  if(!Validator.equals(data.newPassword, data.passwordCfm)){
    errors.passwordCfm ='Mật khẩu không trùng khớp';
  }
  

  return {
    errors,
    isValid: isEmpty(errors)
  }
}