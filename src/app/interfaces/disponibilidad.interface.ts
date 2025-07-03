export interface Disponibilidad {
  id?: number;
  user_id?: number;
  dia_semana: number; // 1 (Lunes) a 7 (Domingo)
  hora_inicio: string; // Formato HH:MM
  hora_fin: string;    // Formato HH:MM
  precio: number;      // Precio en pesos chilenos
  activo: boolean;
  tiene_citas?: boolean; // Para indicar si ya hay citas programadas
  created_at?: string;
  updated_at?: string;
}

export interface BloquePredefinido {
  id: number;
  nombre: string;
  horaInicio: string; // Formato HH:MM
  horaFin: string;    // Formato HH:MM
  precio: number;     // Precio predeterminado
}

export const DiasSemanaNombres = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo'
};
