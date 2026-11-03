export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  isActive?: boolean;
  phoneNumber?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

