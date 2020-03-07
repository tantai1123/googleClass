## Technology Project
- Programming Language: JavaScript
## Function
1. User
- Login
- Register
- Get current user profile
- Create or edit user profile
- Add education to profile
- Delete education from profile
2. Class
- CRUD post and comment
- Get members
3. Admin
- Get all users
- Get all profiles
- Create class
- Add students

## api
1. User
- /users/register
gmail, name, password, passwordCfm, secretCode

- /users/login
gmail, password

- /users/current

2. Profile
- /profile

- /profile/user/:name

- /profile
fullname, maso, facebook, zalo, twitter, instagram

- /profile/education
school, degree, fieldofstudy, from, to, current, description

- /profile/education/:id (delete 1 education)

3. Admin (admin@gmail.com - admin1234)
- /admin/class/create
name, description, startTime, endTime, time

- /admin/user

- /admin/class

- /admin/class/:classid/addteacher/:idteacher
params: id class, id user

- /admin/class/:classid/addstudent/:idstudent
params: id class, id user

- /admin/class/:classid/members
params: id class

4. Class
- /classes

- /classes/:id/members
params: id class