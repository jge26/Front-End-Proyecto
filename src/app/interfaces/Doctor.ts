export interface Doctor {
  id?: number;
  name: string;
  lastname: string;
  profession: string;
  rut: string;
  phone: string;
  email: string;
  enabled?: boolean;
}

export interface DoctorResponse {
  status: string;
  message: string;
  data?: Doctor;
  errors?: any;
}
