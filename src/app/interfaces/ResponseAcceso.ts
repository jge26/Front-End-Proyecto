export interface ResponseAcceso {
  status: string;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      lastname: string;
      role_id: number;
      rut: string;
      phone: string;
      email: string;
      email_verified_at: string | null;
      created_at: string;
      updated_at: string;
      enabled: number; // 0 = deshabilitado, 1 = habilitado
    };
    token: string;
  };
}
