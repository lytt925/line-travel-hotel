# LINE Travel Hotel Assignment
Slide: https://docs.google.com/presentation/d/1EKCk1ftGjdvLh7Fq7_1O8BQgpnX-XrR7q0IQ3URR0Fw/edit?usp=sharing  
API docs: https://demo.ytli.tw/docs

## App Feature

#### Hotels
- Get hotel by id
- Get all hotel
- Create hotel
- Update hotel
- Batch insert hotel with csv file
  - allow partial success imports
  - check missing field 
  - check wrong types
  - allow empty rows in csv


#### Users
- Login
  - Issue JWT for authorization
  - Refresh JWT access token by Cookie
- Sign Up (Create User)
- Get user by ID
- Update user data (required authentication)


## Technologies
- Nest.js framework
- MySQL with TypeORM
- Jest for unit testing
- supertest for e2e testing
- Containerization with Docker
- Github and Github actions
- Nginx for reverse proxy and add TLS certs
- Swagger for API Docs

## Architecture 
![line drawio](https://github.com/user-attachments/assets/56dc3d76-c1ba-4fae-aba4-62508be20b4b)
