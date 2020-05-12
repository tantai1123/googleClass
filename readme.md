## Technology Project
- Programming Language: JavaScript
## Function
1. *User*
- Login
- Register
- Get current user profile
- Get handle profile
- Create or edit user profile
- Add education to profile
- Delete education from profile
- Change Password
- Forgot password
2. *Class*
- CRUD post and comment
- Get members
3. *Admin*
- Get all users
- Get all profiles
- Create class
- Add students
- Add teacher
- Remove student

## API
1. *User*
- **/users/register**  `<POST>`
>gmail, name, password, passwordCfm, secretCode

- **/users/login**  `<POST>`
>name, password

- **/users/changepassword**  `<POST>`
>oldPassword, newPassword, passwordCfm

- **/users/forgot**  `<POST>` (cái này register và login bằng gmail thật, r post forgot để nhận mail)
>gmail

- **/users/reset/:token**  `<POST,GET>` (token được gửi trong mail)
>newPassword, passwordCfm
- **/users/current**  `<GET>`

2. *Profile*
- **/profile**  `<GET>`

- **/profile/handle** `<GET>`

- **/profile/user/:name**  `<GET>`
>params: user name

- **/profile**  `<POST>`
>fullname, maso, facebook, zalo, twitter, instagram

- **/profile/education**  `<POST>`
>school, degree, fieldofstudy, from, to, current, description

- **/profile/education/:id** (delete 1 education) `<POST>`

3. *Staff* (staff@gmail.com - staff1234)
- **/staff/class/create**  `<POST>`
>name, description, startTime, endTime, time

- **/staff/user/all**  `<GET>`

- **/staff/:clId/user/allteachers**  `<GET>` (lấy danh sách giáo viên chưa tham gia lớp)

- **/staff/:clId/user/allstudents**  `<GET>` (lấy danh sách sinh viên chưa tham gia lớp)

- **/staff/class/all**  `<GET>`

- **/staff/class/:clId**  `<GET>`
>params: id class

- **/staff/class/:classId/addteacher/:idTeacher**  `<POST>`
>params: id class, id user

- **/staff/class/:classId/addstudent/:idStudent**  `<POST>`
>params: id class, id user

- **/staff/class/:classId/addstudents**  `<POST>`
>params: id class
idUser (array id sinh viên)

- **/staff/class/:classId/members** `<POST>`
>params: id class

- **/staff/class/:clId/remove/:idUser** `<POST>`
>params: id class, id user (student)

- **/staff/class/:clId** `<DELETE>`
>params: id class

4. *Admin* (admin@gmail.com - admin1234)
- **/admin/user/all**  `<GET>`

- **/admin/profile/all**  `<GET>`

- **/admin/profile/:id**  `<GET>`
>params: id user

- **/admin/user/add** `<POST>`
>name, gmail, password, isTeacher, isStaff

- **/admin/user/remove/:id** `<DELETE>`
>params: id user

- **/admin/changerole/teacher/:idTeacher** `<POST>`
>params: id teacher

- **/admin/changerole/staff/:idStaff** `<POST>`
>params: id staff

- **/admin/changerole/staff/:idStudent** `<POST>`
>params: id student
5. *Class*  
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
- **/classes/:clId/:id** `<DELETE>`
>params: id class, id post

6. *Comment*
- **/comments** `<POST>`
>text, idPost
- **/comments** `<DELETE>` (Xóa comment)
>params: idPost