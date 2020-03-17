## Technology Project
- Programming Language: JavaScript
## Function
1. *User*
- Login
- Register
- Get current user profile
- Create or edit user profile
- Add education to profile
- Delete education from profile
2. *Class*
- CRUD post and comment
- Get members
3. *Admin*
- Get all users
- Get all profiles
- Create class
- Add students

## api
1. *User*
- **/users/register**  `<POST>`
>gmail, name, password, passwordCfm, secretCode

- **/users/login**  `<POST>`
>gmail, password

- **/users/changepassword**  `<POST>`
>oldPassword, newPassword, passwordCfm

- **/users/forgot**  `<POST>` (cái này anh register và login bằng gmail thật, r post forgot để nhận mail)
>gmail

- **/users/reset/:token**  `<POST>` (token được gửi trong mail)
>newPassword, passwordCfm
- **/users/current**  `<GET>`

2. *Profile*
- **/profile**  `<GET>`

- **/profile/user/:name**  `<GET>`
>params: user name
- **/profile**  `<POST>`
>fullname, maso, facebook, zalo, twitter, instagram

- **/profile/education**  `<POST>`
>school, degree, fieldofstudy, from, to, current, description

- **/profile/education/:id** (delete 1 education) `<POST>`

3. *Admin* (admin@gmail.com - admin1234)
- **/admin/class/create**  `<POST>`
>name, description, startTime, endTime, time

- **/admin/user/all**  `<GET>`

- **/admin/profile/all**  `<GET>`

- **/admin/class/all**  `<GET>`

- **/admin/class/:classId/addteacher/:idTeacher**  `<POST>`
>params: id class, id user

- **/admin/class/:classId/addstudent/:idStudent**  `<POST>`
>params: id class, id user

- **/admin/class/:classId/members** `<POST>`
>params: id class

4. *Class*  
- **/classes**  `<GET>`

- **/classes/:classId/members**  `<GET>`
>params: id class

---
- **/classes/:classId/** `<POST>`
>params: id class
>text
- **/classes/:classId/upload** `<POST>`
>form-data: myFile
(hai cái này là post bài kèm file, dùng formdata và thư viên axios)
---
5. *Comment*
- **/comments** `<POST>`

