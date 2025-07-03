export interface User {
  name: string;
  lastname: string;
  rut: string; // Cambiado de number a string
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id?: number; // Agregado como opcional
}
