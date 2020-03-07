const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidateProfileInput(data){
  let errors = {};

  data.fullname = !isEmpty(data.fullname) ? data.fullname : '';
  data.maso = !isEmpty(data.maso) ? data.maso: '';

  if(!Validator.isLength(data.fullname, {min: 5, max: 50})){
    errors.fullname ='Phải dài từ 5 đến 50 ký tự';
  }
  if(Validator.isEmpty(data.fullname)){
    errors.fullname ='Tên không được bỏ trống';
  }
  if(Validator.isEmpty(data.maso)){
    errors.maso ='Mã số không được để trống';
  }

  if(!isEmpty(data.facebook)){
    if(!Validator.isURL(data.facebook)){
      errors.facebook = 'Không đúng định dạng';
    }
  }
  if(!isEmpty(data.zalo)){
    if(!Validator.isNumeric(data.zalo)){
      errors.facebook = 'Không đúng định dạng';
    }
  }
  if(!isEmpty(data.twitter)){
    if(!Validator.isURL(data.twitter)){
      errors.twitter = 'Không đúng định dạng';
    }
  }
  if(!isEmpty(data.instagram)){
    if(!Validator.isURL(data.instagram)){
      errors.instagram = 'Không đúng định dạng';
    }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};