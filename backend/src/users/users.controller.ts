import { Controller, Get, UseGuards, Request, NotFoundException, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

interface RequestWithAuthUser extends ExpressRequest {
  user: AuthenticatedUser;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: RequestWithAuthUser): Promise<ProfileResponseDto> {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      this.logger.warn(`Profile not found for userId: ${req.user.userId}`);
      throw new NotFoundException('User not found');
    }
    
    this.logger.log(`Profile retrieved: ${user.email}`);
    
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt!,
    };
  }
}
