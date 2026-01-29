import { AuthResponseDto } from '../dto/auth-response.dto';

export interface AuthResult {
  response: AuthResponseDto;
  token: string;
}
