import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'User created successfully' })
  message: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Logout successful' })
  message: string;
}
