export interface SubServiceSimple {
  id: number;
  name: string;
  serviceName: string;
}

export interface User {
  id: number;
  roleId: number;
  roleName: string;
  subServiceId?: number;
  subServiceName?: string;
  managedSubServices: SubServiceSimple[];
  firstName: string;
  lastName: string;
  email: string;
  hireDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  roleId: number;
  subServiceId?: number;
  managedSubServiceIds: number[];
  firstName: string;
   hireDate: string;
  lastName: string;
  
  email: string;
}

export interface UpdateUserDto {
  roleId: number;
  subServiceId?: number;
  managedSubServiceIds: number[];
  firstName: string;
  lastName: string;
   hireDate: string;
  email: string;
  isActive: boolean;
}