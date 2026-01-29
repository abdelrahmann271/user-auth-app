import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { JwtPayload, AuthenticatedUser } from '../interfaces/jwt-payload.interface';

export const JWT_COOKIE_NAME = 'access_token';

const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.[JWT_COOKIE_NAME] || null;
};

/**
 * Get JWT secret with production safety check
 * Throws an error if JWT_SECRET is not set in production environment
 */
function getJwtSecret(configService: ConfigService): string {
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  if (!jwtSecret && isProduction) {
    const logger = new Logger('JwtStrategy');
    logger.error('CRITICAL: JWT_SECRET environment variable is not set in production!');
    throw new Error('JWT_SECRET must be configured in production environment');
  }

  if (!jwtSecret) {
    const logger = new Logger('JwtStrategy');
    logger.warn('JWT_SECRET not set - using default development secret. DO NOT use in production!');
  }

  return jwtSecret || 'dev-only-secret-do-not-use-in-production';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const tokenVersion = payload.tokenVersion ?? 0;
    const userTokenVersion = user.tokenVersion ?? 0;
    
    if (tokenVersion < userTokenVersion) {
      throw new UnauthorizedException('Token has been invalidated');
    }
    
    return { userId: payload.sub, email: payload.email };
  }
}
