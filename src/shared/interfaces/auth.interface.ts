import { AUTH_PERMISSIONS } from '../enums/auth.permission.enum';

export interface IUserInfo {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly authorities?: AUTH_PERMISSIONS[];
}
