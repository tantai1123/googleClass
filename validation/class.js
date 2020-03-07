const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidateCreateClass(data){
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
//   data.description = !isEmpty(data.description) ? data.description: '';


  if(!Validator.isLength(data.name, {min: 1, max: 50})){
    errors.name ='Tên nhóm phải hơn 1 ký tự';
  }
  if(Validator.isEmpty(data.name)){
    errors.name ='Tên không được để trống';
  }
//   if(Validator.isEmpty(data.description)){
//     errors.description ='Thêm mô tả về nhóm';
//   }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}