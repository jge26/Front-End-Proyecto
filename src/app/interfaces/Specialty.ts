export interface Specialty {
  id: number;
  name: string;
}

export interface DoctorRegistration {
  name: string;
  lastname: string;
  rut: string;
  phone: string;
  email: string;
  specialty_id: number;
}
