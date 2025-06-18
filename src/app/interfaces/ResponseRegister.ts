export interface ResponseRegister {
  status: string;
  message: string;
  data: {
    id: number;
    name: string;
    lastname: string;
    rut: string;
    phone: string;
    email: string;
    role_id: number;
    enable: boolean;
    updated_at: string;
    created_at: string;
  };
}
