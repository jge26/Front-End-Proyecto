export interface UserListResponse {
  status: string;
  message: string | null;
  data: UserListItem[];
}

export interface UserListItem {
  id: number;
  name: string;
  lastname: string;
  email: string;
  rut: string;
  phone: string;
  enabled: number;
  role_id?: number; // Añadimos role_id como opcional con ?
  // Otros campos que pueda tener
}
