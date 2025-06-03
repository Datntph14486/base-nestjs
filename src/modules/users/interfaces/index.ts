import { UserRole } from '../enums';

export interface IUserPagination {
  items: IUserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
