
export interface User {
    id: number;
    name: string;
    lastname: string;
    rut: string;
    phone: string;
    email: string;
    status: number;
}

export interface UserResponse {
    status:number;
    data:User[]
} 

export interface UserManage { 
  id: number;
  name: string;
  lastname: string;
  rut: string;
  phone: string;
  email: string;
  enabled: number; 
  editing?: boolean;
  backup?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface UserManageResponse {

    status: number;
    data: UserManage[];
}




