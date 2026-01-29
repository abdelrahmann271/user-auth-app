import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

jest.mock('bcrypt');

describe('UsersService', () => {
  let usersService: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    tokenVersion: 0,
    save: jest.fn().mockResolvedValue({
      _id: 'user-id-123',
      email: 'test@example.com',
      name: 'Test User',
      tokenVersion: 0,
    }),
  };

  beforeEach(async () => {
    mockUserModel = jest.fn().mockImplementation(() => mockUser);
    mockUserModel.findOne = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.findByIdAndUpdate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await usersService.create({
        email: 'new@example.com',
        name: 'New User',
        password: 'Password123!',
      });

      expect(result.email).toBe('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(
        usersService.create({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await usersService.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await usersService.validatePassword('password', 'hashedPassword');

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await usersService.validatePassword('wrongPassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });

  describe('incrementTokenVersion', () => {
    it('should increment token version', async () => {
      const updatedUser = { ...mockUser, tokenVersion: 1 };
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await usersService.incrementTokenVersion('user-id-123');

      expect(result?.tokenVersion).toBe(1);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id-123',
        { $inc: { tokenVersion: 1 } },
        { new: true },
      );
    });
  });
});
