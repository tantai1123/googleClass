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
- **/users/register**  ~~POST~~
>gmail, name, password, passwordCfm, secretCode

- **/users/login**  ~~POST~~
>gmail, password

- **/users/current**  ~~GET~~

2. Profile
- **/profile**  ~~GET~~

- **/profile/user/:name**  ~~GET~~
>params: user name
- **/profile**  ~~POST~~
>fullname, maso, facebook, zalo, twitter, instagram

- **/profile/education**  ~~POST~~
>school, degree, fieldofstudy, from, to, current, description

- **/profile/education/:id** (delete 1 education) ~~POST~~

3. Admin (admin@gmail.com - admin1234)
- **/admin/class/create**  ~~POST~~
>name, description, startTime, endTime, time

- **/admin/user**  ~~GET~~

- **/admin/class**  ~~GET~~

- **/admin/class/:classid/addteacher/:idteacher**  ~~POST~~
>params: id class, id user

- **/admin/class/:classid/addstudent/:idstudent**  ~~POST~~
>params: id class, id user

- **/admin/class/:classid/members** ~~POST~~
>params: id class

4. Class  
- **/classes**  ~~GET~~

- **/classes/:id/members**  ~~GET~~
>params: id class