export interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  nombre_completo?: string;
  rut: string;
  especialidad: {
    id: number;
    nombre: string;
  };
  valor_consulta: number;
  tiene_disponibilidad: boolean;
  dias_disponibles: string[];
  horarios: {
    [key: string]: HorarioBloque[];
  };
}

export interface HorarioBloque {
  inicio: string;
  fin: string;
  precio: number;
}

export interface HorarioDisponible {
  hora: string;
  horaFin: string;
  disponible: boolean;
  estado: 'habilitado' | 'bloqueado' | 'eliminado' | 'ocupado'; // Nuevos estados del endpoint
  reservada?: boolean;
  precio?: number;
}

export interface EspecialidadConMedicos {
  nombre: string;
  medicos: Doctor[];
}

export interface AppointmentSummary {
  doctor: string;
  specialtyName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  paymentMethod: string;
  reason: string;
}

export type PaymentMethod = 'tarjeta' | 'transferencia' | 'consulta';
