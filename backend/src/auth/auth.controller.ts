import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, MessageResponseDto } from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ValidatedUser } from './interfaces/validated-user.interface';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { JWT_COOKIE_NAME } from './strategies/jwt.strategy';

interface RequestWithUser extends ExpressRequest {
  user: ValidatedUser;
}

interface RequestWithAuthUser extends ExpressRequest {
  user: AuthenticatedUser;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly isProduction: boolean;
  private readonly cookieMaxAge: number;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = configService.get<string>('NODE_ENV') === 'production';
    const jwtExpiresIn = parseInt(configService.get<string>('JWT_EXPIRES_IN') || '1800', 10);
    this.cookieMaxAge = jwtExpiresIn * 1000;
  }

  private setAuthCookie(res: ExpressResponse, token: string): void {
    res.cookie(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: this.cookieMaxAge,
      path: '/',
    });
  }

  private clearAuthCookie(res: ExpressResponse): void {
    res.clearCookie(JWT_COOKIE_NAME, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/',
    });
  }

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests - rate limit exceeded' })
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<AuthResponseDto> {
    const { response, token } = await this.authService.signup(createUserDto);
    this.setAuthCookie(res, token);
    return response;
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests - rate limit exceeded' })
  async signin(
    @Body() _loginDto: LoginDto,
    @Request() req: RequestWithUser,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<AuthResponseDto> {
    const { response, token } = await this.authService.login(req.user);
    this.setAuthCookie(res, token);
    return response;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out and invalidate all tokens' })
  @ApiResponse({ status: 200, description: 'User successfully logged out', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Request() req: RequestWithAuthUser,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<MessageResponseDto> {
    this.clearAuthCookie(res);
    return this.authService.logout(req.user.userId);
  }
}
