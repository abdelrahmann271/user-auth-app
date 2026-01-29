export interface JwtPayload {
  sub: string;
  email: string;
  tokenVersion: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
}
