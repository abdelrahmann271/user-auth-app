import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MessageResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ValidatedUser } from './interfaces/validated-user.interface';
import { AuthResult } from './interfaces/auth-result.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<AuthResult> {
    const user = await this.usersService.create(createUserDto);
    
    try {
      const payload: JwtPayload = { 
        sub: user._id.toString(),
        email: user.email, 
        tokenVersion: user.tokenVersion ?? 0,
      };
      
      const token = this.jwtService.sign(payload);
      this.logger.log(`Signup successful: ${user.email}`);
      
      return {
        response: {
          message: 'User created successfully',
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          },
        },
        token,
      };
    } catch (error) {
      this.logger.error(`Token generation failed for signup: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to complete signup');
    }
  }

  async login(user: ValidatedUser): Promise<AuthResult> {
    try {
      const payload: JwtPayload = { 
        sub: user._id.toString(),
        email: user.email, 
        tokenVersion: user.tokenVersion ?? 0,
      };
      
      const token = this.jwtService.sign(payload);
      this.logger.log(`Login successful: ${user.email}`);
      
      return {
        response: {
          message: 'Login successful',
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          },
        },
        token,
      };
    } catch (error) {
      this.logger.error(`Token generation failed for login: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to complete login');
    }
  }

  async logout(userId: string): Promise<MessageResponseDto> {
    await this.usersService.incrementTokenVersion(userId);
    this.logger.log(`Logout successful: ${userId}`);
    return { message: 'Logout successful' };
  }

  async validateUser(email: string, password: string): Promise<ValidatedUser | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        this.logger.debug(`Login attempt for non-existent user: ${email}`);
        return null;
      }
      
      const isValid = await this.usersService.validatePassword(password, user.password);
      
      if (!isValid) {
        this.logger.debug(`Invalid password for: ${email}`);
        return null;
      }
      
      const { password: _, ...result } = user.toObject();
      return result as ValidatedUser;
    } catch (error) {
      this.logger.error(`User validation failed: ${error.message}`, error.stack);
      return null;
    }
  }
}
