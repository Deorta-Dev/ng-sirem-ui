/** Vistas de la agenda. */
export type SiremAgendaMode = 'day' | 'week' | 'month' | 'list';

/**
 * Cabeceras que se quedan pegadas (`position: sticky`) al hacer scroll.
 * - `toolbar`: la barra de navegación (título + selector de vista).
 * - `days`: la fila de días/semana o el encabezado de grupo de la lista.
 * - `both`: las dos, apiladas (la segunda bajo la primera).
 */
export type SiremAgendaSticky = 'none' | 'toolbar' | 'days' | 'both';

/** Semántica de color de un evento. */
export type SiremAgendaTone =
  | 'brand'
  | 'sage'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted';

/** Evento de la agenda. */
export interface SiremAgendaEvent {
  /** Identificador estable; si falta se usa la posición en el array. */
  id?: string | number;
  /** Título visible. */
  title: string;
  /** Inicio (`Date` o texto ISO). */
  start: Date | string;
  /** Fin (`Date` o texto ISO). Sin fin dura 30 minutos. */
  end?: Date | string;
  /** Ocupa el día completo y va a la franja superior. */
  allDay?: boolean;
  /** Color semántico; por defecto `brand`. */
  tone?: SiremAgendaTone;
  /** Lugar o sala, en segunda línea. */
  location?: string;
  /** Etiqueta corta a la derecha (profesional, estado…). */
  meta?: string;
}

/** Evento ya normalizado (fechas reales y valores resueltos). */
export interface SiremAgendaItem {
  id: string | number;
  /** Evento original, tal y como lo emite `eventPressed`. */
  source: SiremAgendaEvent;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  tone: SiremAgendaTone;
  location: string;
  meta: string;
}

/** Evento colocado dentro de una columna de día. */
export interface SiremAgendaPlaced {
  /** Clave única para el `track` del template. */
  key: string;
  event: SiremAgendaItem;
  /** Desplazamiento vertical en px desde la hora inicial. */
  top: number;
  /** Alto en px (mínimo legible de 18 px). */
  height: number;
  /** Porcentaje de izquierda dentro de la columna (eventos solapados). */
  left: number;
  /** Porcentaje de ancho dentro de la columna. */
  width: number;
}

/** Celda del modo mes. */
export interface SiremAgendaMonthCell {
  key: string;
  date: Date;
  /** `false` para los días de los meses vecinos que rellenan la rejilla. */
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  events: SiremAgendaItem[];
}

/** Grupo de días con eventos del modo lista. */
export interface SiremAgendaListGroup {
  key: string;
  date: Date;
  /** Número del día. */
  day: string;
  /** Día de la semana en largo. */
  weekday: string;
  today: boolean;
  events: SiremAgendaItem[];
}

/** Hueco pulsado en la rejilla horaria. */
export interface SiremAgendaSlot {
  /** Día del hueco. */
  date: Date;
  /** Hora (0–23). */
  hour: number;
  /** Minuto (0–59). */
  minute: number;
}

/** Evento de carga perezosa de fechas / rango. */
export interface SiremAgendaLazyLoadEvent {
  direction: 'prev' | 'next';
  date: Date;
  count?: number;
}

/** Rango de fechas visible o cargado. */
export interface SiremAgendaDateRange {
  start: Date;
  end: Date;
}
