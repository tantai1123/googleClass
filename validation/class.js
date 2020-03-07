const Validator = require('validator');
const isEmpty = require('../utils/isEmpty');

module.exports = function ValidateCreateClass(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  //   data.description = !isEmpty(data.description) ? data.description: '';
  data.startTime = !isEmpty(data.startTime) ? data.startTime : '';
  data.endTime = !isEmpty(data.endTime) ? data.endTime : '';


  if (!Validator.isLength(data.name, { min: 1, max: 50 })) {
    errors.name = 'Tên nhóm phải hơn 1 ký tự';
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = 'Tên không được để trống';
  }
  if (Validator.isEmpty(data.startTime)) {
    errors.startTime = 'Thời gian bắt đầu không được để trống';
  }
  if (Validator.isEmpty(data.endTime)) {
    errors.endTime = 'Thời gian kết thúc không được để trống';
  }
  //   if(Validator.isEmpty(data.description)){
  //     errors.description ='Thêm mô tả về nhóm';
  //   }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}