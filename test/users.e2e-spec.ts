import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';
const EMAIL = 'ffewfew1@gmail.com';
const PASS = 'enfrejkngjkreg';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>
  let jwtToken: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepo = module.get(getRepositoryToken(User))
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation register($input: RegisterInput!) {
          register(input: $input) {
            success
            message
          }
          }`,
          variables: `{
            "input": {
              "role": "Client",
              "email": "${EMAIL}",
              "password": "${PASS}"
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.register.success).toBe(true);
          expect(res.body.data.register.message).toBe(null);
        });
    });
    it('should fail if user already exists', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation register($input: RegisterInput!) {
        register(input: $input) {
          success
          message
        }
        }`,
          variables: `{
          "input": {
            "role": "Client",
            "email": "${EMAIL}",
            "password": "${PASS}"
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.register.success).toBe(false);
          expect(res.body.data.register.message).toEqual(expect.any(String));
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation login($input: LoginInput!) {
        login(input: $input) {
          token
          success
          message
        }
        }`,
          variables: `{
          "input": {
            "email": "${EMAIL}",
            "password": "${PASS}"
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.success).toBe(true);
          expect(res.body.data.login.message).toEqual(null);
          expect(res.body.data.login.token).toEqual(expect.any(String));
          jwtToken = res.body.data.login.token;
        });
    });

    it('should not be able to login with incorrect credentials', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation login($input: LoginInput!) {
        login(input: $input) {
          token
          success
          message
        }
        }`,
          variables: `{
          "input": {
            "email": "${EMAIL}",
            "password": "xxx"
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.success).toBe(false);
          expect(res.body.data.login.message).toEqual(expect.any(String));
          expect(res.body.data.login.token).toEqual(null);
        });
    });
  });

  describe('userProfile', () =>  {
    let userId: number
    beforeAll(async () => {
      const [user] = await userRepo.find();
      userId = user.id;
      console.log(user)
    })
    it('should see a user profile', async () => {
      return request(app.getHttpServer())

      .post(GRAPHQL_ENDPOINT)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `userProfile($input: UserProfileInput!) {
          userProfile(input:$input) {
            user {
              email
            }
          
            success
            message
          }
        }`,
        variables: `{
          "input": {
            "userId": ${userId}
          }
        }`
      }) .expect(200)
      .expect((res) => {
        expect(res.body.data.userProfile.success).toBe(true);
        expect(res.body.data.userProfile.message).toEqual(null);
        expect(res.body.data.userProfile.user.id).toEqual(userId);
      });
    })

    it('should not find a user', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `userProfile($input: UserProfileInput!) {
          userProfile(input:$input) {
            user {
              email
            }
          
            success
            message
          }
        }`,
        variables: `{
          "input": {
            "userId":123
          }
        }`
      }) .expect(200)
      .expect((res) => {
        expect(res.body.data.userProfile.success).toBe(false);
        expect(res.body.data.userProfile.message).toEqual(expect.any(String));
        expect(res.body.data.userProfile.user).toEqual(null);
      });
    })
  }); 

  describe('me', () => {
    it('should find my profile', async () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `me {
          email
          role
          verified
        }`
      }) .expect(200)
      .expect((res) => {
        expect(res.body.data.me.success).toBe(true);
        expect(res.body.data.me.email).toEqual(EMAIL);
  
      });
    })
    it('should not allow an unauthorized person to use', async () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)

      .send({
        query: `me {
          email
          role
          verified
        }`
      }) .expect(400)
  
    })
    
  });
  describe('editProfile',  () => {
    it('should change email', async () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `editProfile($input: EditProfileInput!) {
          editProfile(input: $input) {
            message
            success
          
          }
        }`,
        variables: `{
          "input": {
           "email": "232323@gmail.com",
            "password": "${PASS}"
          }
        }`
      }) .expect(200)
      .expect(res => {
        expect(res.body.data.editProfile.success).toBe(true);
        expect(res.body.data.userProfile.message).toEqual(null);
      })
    })
  }); 
});
