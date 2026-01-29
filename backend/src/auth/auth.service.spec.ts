import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    tokenVersion: 0,
    toObject: () => ({
      _id: mockUser._id,
      email: mockUser.email,
      name: mockUser.name,
      tokenVersion: mockUser.tokenVersion,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
            incrementTokenVersion: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('signup', () => {
    it('should create user and return auth result with token and response', async () => {
      usersService.create.mockResolvedValue(mockUser as any);

      const result = await authService.signup({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      });

      expect(result.response.message).toBe('User created successfully');
      expect(result.response.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
      expect(usersService.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return auth result with token and response for valid user', async () => {
      const validatedUser = {
        _id: mockUser._id,
        email: mockUser.email,
        name: mockUser.name,
        tokenVersion: 0,
      };

      const result = await authService.login(validatedUser as any);

      expect(result.response.message).toBe('Login successful');
      expect(result.response.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });
  });

  describe('logout', () => {
    it('should increment token version and return success message', async () => {
      usersService.incrementTokenVersion.mockResolvedValue(mockUser as any);

      const result = await authService.logout(mockUser._id.toString());

      expect(result.message).toBe('Logout successful');
      expect(usersService.incrementTokenVersion).toHaveBeenCalledWith(mockUser._id.toString());
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      usersService.validatePassword.mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'correctPassword');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null for invalid password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      usersService.validatePassword.mockResolvedValue(false);

      const result = await authService.validateUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});
