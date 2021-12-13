import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtService } from 'src/jwt/jwt.service';

const mockJwtService = () => ({
  sign: jest.fn(() => 'token'),
  verify: jest.fn(),
});

const mockRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockEmailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('UserService', () => {
  let service: UserService;
  let userRepo: MockRepository;
  let vRepo: MockRepository;
  let emailService: EmailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepo(),
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepo = module.get(getRepositoryToken(User));
    vRepo = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    const args = {
      email: '',
      password: '',
      role: 0,
    };

    it('should fail if user exists', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'mfklewfk@wqd.com',
      });
      const result = await service.registerUser(args);
      expect(result).toMatchObject({
        success: false,
        message: 'This email is already being used',
      });
    });

    it('should create a new user', async () => {
      // undefined means there was not a user in the DB
      userRepo.findOne.mockResolvedValue(undefined);
      // make sure to have mock returned values of these
      userRepo.create.mockReturnValue(args);
      userRepo.save.mockResolvedValue(args);
      vRepo.create.mockReturnValue(args);
      vRepo.save.mockResolvedValue({ code: 'code' });

      const res = await service.registerUser(args);
      expect(userRepo.create).toHaveBeenCalledTimes(1);
      expect(userRepo.create).toHaveBeenCalledWith(args);
      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledWith(args);

      expect(vRepo.create).toHaveBeenCalledTimes(1);
      expect(vRepo.create).toHaveBeenCalledWith({ user: args });
      expect(vRepo.save).toHaveBeenCalledTimes(1);
      expect(vRepo.save).toHaveBeenCalledWith(args);

      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(res).toEqual({ success: true });
    });

    it('should fail on exception', async () => {
      userRepo.findOne.mockRejectedValue(new Error('error'));
      const res = await service.registerUser(args);

      expect(res).toEqual({
        success: false,
        message: "Couldn't create the account",
      });
    });
  });

  describe('loginUser', () => {
    const args = {
      email: 'evvf',
      password: 'vffvf',
    };
    it('should fail if user doesnt exist', async () => {
      userRepo.findOne.mockResolvedValue(undefined);

      const res = await service.loginUser(args);

      expect(userRepo.findOne).toHaveBeenCalledTimes(1);
      expect(userRepo.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(res).toEqual({
        success: false,
        message: "That email doesn't exist",
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockUser = { checkPassword: jest.fn(() => Promise.resolve(false)) };

      userRepo.findOne.mockResolvedValue(mockUser);
      const res = await service.loginUser(args);
      expect(res).toEqual({
        success: false,
        message: 'Incorrect password',
      });
    });

    it('should return token if password is correct', async () => {
      const mockUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepo.findOne.mockResolvedValue(mockUser);
      const res = await service.loginUser(args);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(res).toEqual({
        success: true,
        token: 'token',
      });
    });

    it('should fail on exception', async () => {
      userRepo.findOne.mockRejectedValue(new Error('error'));
      const res = await service.loginUser(args);

      expect(res).toEqual({
        success: false,
        message: "Can't log user in",
      });
    });
  });

  describe('findById', () => {
    it('should find an existing user', async () => {
      const args = {
        id: 1,
      };
      userRepo.findOneOrFail.mockResolvedValue(args);
      const res = await service.findById(1);
      expect(res).toEqual({ success: true, user: args });
    });

    it('should fail if no user is found', async () => {
      userRepo.findOneOrFail.mockRejectedValue(new Error('err'));
      const res = await service.findById(1);
      expect(res).toEqual({
        message: 'User not found',
        success: false,
      });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'test@gmail.com',
        verified: true,
      };
      const args = {
        userId: 1,
        input: { email: 'testnew@gmail.com' },
      };

      const newVerification = {
        code: 'code',
      };

      const newUser = {
        verified: false,
        email: args.input.email,
      };

      userRepo.findOne.mockResolvedValue(oldUser);
      // create doesnt return promise > return
      vRepo.create.mockReturnValue(newVerification);
      // save does return promise > resoled
      vRepo.save.mockResolvedValue(newVerification);

      await service.editProfile(args.userId, args.input);

      expect(userRepo.findOne).toHaveBeenCalledTimes(1);
      expect(userRepo.findOne).toHaveBeenCalledWith({ id: args.userId });

      expect(vRepo.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(vRepo.save).toHaveBeenCalledWith(newVerification);

      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const args = {
        userId: 1,
        input: { password: 'newpassword1234' },
      };
      userRepo.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(args.userId, args.input);
      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledWith(args.input);

      expect(result).toEqual({
        success: true,
      });
    });

    it('should fail on exception', async () => {
      userRepo.findOne.mockRejectedValue(new Error('error'));
      const res = await service.editProfile(1, { email: '123' });

      expect(res).toEqual({
        success: false,
        message: 'Profile failed to update',
      });
    });
  });
  describe('verifyEmail', () => {
    it('should veify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      vRepo.findOne.mockResolvedValue(mockedVerification);
      const res = await service.verifyEmail('');

      expect(vRepo.findOne).toHaveBeenCalledTimes(1);
      expect(vRepo.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledWith({ verified: true });

      expect(vRepo.delete).toHaveBeenCalledTimes(1);
      expect(vRepo.delete).toHaveBeenCalledWith(mockedVerification.id);
      expect(res).toEqual({ success: true });
    });

    it('should fail on verification not found', async () => {
      vRepo.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({
        success: false,
        message: 'Verification not found',
      });
    });

    it('should fail on exception', async () => {
      vRepo.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({
        success: false,
        message: "Could'nt verify email",
      });
    });
  });
});
