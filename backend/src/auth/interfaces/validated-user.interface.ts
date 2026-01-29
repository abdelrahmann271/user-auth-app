import { Types } from 'mongoose';

export interface ValidatedUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  tokenVersion: number;
  createdAt?: Date;
  updatedAt?: Date;
}
