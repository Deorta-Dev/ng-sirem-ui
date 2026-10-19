import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SiremDateChip } from '../../data-display/date-chip/sirem-date-chip';
import {
  SiremViewToggle,
  type SiremViewToggleItem,
} from '../../data-display/view-toggle/sirem-view-toggle';

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
  date: Date;
  hour: number;
  minute: number;
}

const MINUTE_MS = 60_000;

/** Escucha en captura: recoge el scroll de cualquier ancestro desplazable. */
const PASSIVE: AddEventListenerOptions = { capture: true, passive: true };

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function addDays(date: Date, days: number): Date {
  const day = startOfDay(date);
  day.setDate(day.getDate() + days);
  return day;
}

function addMonths(date: Date, months: number): Date {
  const day = startOfDay(date);
  const target = new Date(day.getFullYear(), day.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day.getDate(), lastDay));
  return target;
}

function startOfWeek(date: Date, weekStartsOn: number): Date {
  const day = startOfDay(date);
  const diff = (day.getDay() - weekStartsOn + 7) % 7;
  return addDays(day, -diff);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function rangeDays(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

/** `blur(Npx)` o `null` cuando no hay desenfoque. */
function blurFilter(px: number | null): string | null {
  return px && px > 0 ? `blur(${px}px)` : null;
}

/**
 * Agenda multi-vista tipo Google Calendar (`sirem-agenda`).
 *
 * ## Vistas
 * - `week` (defecto): rejilla horaria de 7 días con cabecera de `sirem-date-chip`.
 * - `day`: una columna, con un riel de 7 chips para moverse entre días.
 * - `month`: rejilla mensual con chips de eventos y «+N más».
 * - `list`: agenda agrupada por días con eventos.
 *
 * El selector de vistas es `sirem-view-toggle`; la navegación temporal, flechas,
 * botón **Hoy** y los chips de día.
 *
 * ## Responsive
 * Con `responsive` (defecto) la agenda mide su ancho: por debajo de ~40rem
 * **oculta la vista de semana** (se pasa a `day`), compacta paddings y, en el
 * mes, deja solo puntos de color. `modes` permite limitar las vistas que se
 * ofrecen en cada caso.
 *
 * ## Rejilla horaria
 * - Cada hora mide `hourHeight` px (64 por defecto): filas amplias y cómodas.
 * - Eventos posicionados por hora real; los solapados se reparten en columnas.
 * - Franja «Todo el día» sobre la rejilla.
 * - Indicador de la hora actual en la columna de hoy.
 * - Clic en un hueco emite `slotPressed` (minuto redondeado a 15).
 *
 * ## Scroll y cabeceras fijas
 * La agenda **no tiene scroll interno**: crece lo que necesite y sigue el
 * scroll de la página (envuélvela tú si quieres un alto máximo). Con `sticky`
 * decides qué cabeceras se pegan mientras haces scroll —
 * `'none'` (defecto), `'toolbar'`, `'days'` o `'both'`— y con `stickyOffset`
 * (cualquier unidad CSS, p. ej. `'4rem'`) y `stickyGap` fijas a qué altura.
 *
 * Cada cabecera admite ajustes independientes para su estado **normal** y su
 * estado **pegado** (la agenda lo detecta al hacer scroll):
 * - `toolbarBackground` / `toolbarBackgroundStuck` y `daysBackground` /
 *   `daysBackgroundStuck`: color de fondo de cada estado.
 * - `toolbarBlur` / `toolbarBlurStuck` y `daysBlur` / `daysBlurStuck`: desenfoque
 *   del fondo en px (`null` = hereda el del estado normal).
 * - `toolbarStickyHeight` / `daysStickyHeight`: alto en px mientras la cabecera
 *   está pegada (`0` = alto natural).
 *
 * Uso:
 * ```html
 * <sirem-agenda
 *   [events]="citas"
 *   [(mode)]="vista"
 *   [(date)]="dia"
 *   sticky="both"
 *   stickyOffset="4rem"
 *   toolbarBackgroundStuck="color-mix(in srgb, var(--sirem-surface) 80%, transparent)"
 *   [toolbarBlurStuck]="12"
 *   [toolbarStickyHeight]="56"
 *   (eventPressed)="abrir($event)"
 *   (slotPressed)="nuevaCita($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-agenda',
  standalone: true,
  imports: [SiremDateChip, SiremViewToggle],
  styleUrl: './sirem-agenda.scss',
  template: `
    <div
      class="sirem-agenda"
      [class.sirem-agenda--compact]="compact()"
      [style.--sirem-agenda-hour]="hourHeight() + 'px'"
      [style.--sirem-agenda-cols]="visibleDays().length"
      [style.--sirem-agenda-top]="stickyOffset()"
      [style.--sirem-agenda-days-top]="daysTop()"
      [style.--sirem-agenda-bar-bg]="barSurface()"
      [style.--sirem-agenda-bar-filter]="barFilter()"
      [style.--sirem-agenda-bar-h]="barStuck() ? pxOrNull(toolbarStickyHeight()) : null"
      [style.--sirem-agenda-days-bg]="daysSurface()"
      [style.--sirem-agenda-days-filter]="daysFilter()"
      [style.--sirem-agenda-days-h]="daysStuck() ? pxOrNull(daysStickyHeight()) : null"
    >
      <header class="sirem-agenda__bar" #bar [class.sirem-agenda__bar--sticky]="stickyToolbar()">
        <div class="sirem-agenda__nav">
          <button
            type="button"
            class="sirem-agenda__navbtn"
            (click)="prev()"
            aria-label="Anterior"
          >
            <i class="fi fi-rr-angle-small-left" aria-hidden="true"></i>
          </button>
          <button type="button" class="sirem-agenda__today" (click)="goToday()">
            Hoy
          </button>
          <button
            type="button"
            class="sirem-agenda__navbtn"
            (click)="next()"
            aria-label="Siguiente"
          >
            <i class="fi fi-rr-angle-small-right" aria-hidden="true"></i>
          </button>
        </div>

        <div class="sirem-agenda__heading">
          <h2 class="sirem-agenda__title">{{ title() }}</h2>
          <span class="sirem-agenda__subtitle">{{ subtitle() }}</span>
        </div>

        <sirem-view-toggle
          [items]="modeItems()"
          [view]="mode()"
          (viewChange)="setMode($event)"
          [size]="compact() ? 'sm' : 'md'"
          ariaLabel="Vista de agenda"
        />
      </header>

      @switch (mode()) {
        @case ('month') {
          <div class="sirem-agenda__month">
            <div
              class="sirem-agenda__weekhead"
              #daysHead
              [class.sirem-agenda__weekhead--sticky]="stickyDays()"
              aria-hidden="true"
            >
              @for (label of weekdayLabels(); track $index) {
                <span>{{ label }}</span>
              }
            </div>
            <div class="sirem-agenda__monthgrid">
              @for (cell of monthCells(); track cell.key) {
                <div
                  class="sirem-agenda__mcell"
                  [class.sirem-agenda__mcell--out]="!cell.inMonth"
                  [class.sirem-agenda__mcell--today]="cell.today"
                  [class.sirem-agenda__mcell--selected]="cell.selected"
                >
                  <button
                    type="button"
                    class="sirem-agenda__mday"
                    [attr.aria-current]="cell.today ? 'date' : null"
                    [attr.aria-label]="longDate(cell.date)"
                    (click)="pickDay(cell.date)"
                  >
                    {{ cell.date.getDate() }}
                  </button>

                  <div class="sirem-agenda__mevents">
                    @for (item of cell.events.slice(0, maxPerDay()); track item.id) {
                      <button
                        type="button"
                        [class]="'sirem-agenda__mchip sirem-agenda__tone--' + item.tone"
                        [attr.aria-label]="item.title"
                        (click)="pressEvent(item, $event)"
                      >
                        <span class="sirem-agenda__dot" aria-hidden="true"></span>
                        <span class="sirem-agenda__mchip-text">{{ item.title }}</span>
                      </button>
                    }
                    @if (cell.events.length > maxPerDay()) {
                      <button
                        type="button"
                        class="sirem-agenda__mmore"
                        (click)="openDay(cell.date)"
                      >
                        +{{ cell.events.length - maxPerDay() }} más
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @case ('list') {
          <div class="sirem-agenda__list">
            @if (!listGroups().length) {
              <p class="sirem-agenda__empty">
                No hay eventos en los próximos {{ listDays() }} días.
              </p>
            }
            @for (group of listGroups(); track group.key) {
              <div class="sirem-agenda__group">
                <header
                  class="sirem-agenda__group-head"
                  #daysHead
                  [class.sirem-agenda__group-head--sticky]="stickyDays()"
                >
                  <span class="sirem-agenda__group-day">{{ group.day }}</span>
                  <span class="sirem-agenda__group-weekday">{{ group.weekday }}</span>
                  @if (group.today) {
                    <span class="sirem-agenda__badge">Hoy</span>
                  }
                </header>
                @for (item of group.events; track item.id) {
                  <button
                    type="button"
                    [class]="'sirem-agenda__row sirem-agenda__tone--' + item.tone"
                    (click)="pressEvent(item, $event)"
                  >
                    <span class="sirem-agenda__row-time">{{ timeRange(item) }}</span>
                    <span class="sirem-agenda__row-text">
                      <span class="sirem-agenda__row-title">{{ item.title }}</span>
                      @if (item.location) {
                        <span class="sirem-agenda__row-location">{{ item.location }}</span>
                      }
                    </span>
                    @if (item.meta) {
                      <span class="sirem-agenda__row-meta">{{ item.meta }}</span>
                    }
                  </button>
                }
              </div>
            }
          </div>
        }

        @default {
          <div class="sirem-agenda__timeview">
            @if (mode() === 'day') {
              <div
                class="sirem-agenda__rail"
                #daysHead
                role="group"
                aria-label="Días de la semana"
                [class.sirem-agenda__rail--sticky]="stickyDays()"
              >
                @for (day of weekDays(); track day.getTime()) {
                  <sirem-date-chip
                    [day]="day.getDate()"
                    [weekday]="weekdayNarrow(day)"
                    [active]="isSelected(day)"
                    [dot]="hasEvents(day)"
                    [ariaLabel]="longDate(day)"
                    (pressed)="pickDay(day)"
                  />
                }
              </div>
            }

            @if (allDayItems().length) {
              <div class="sirem-agenda__allday">
                <span class="sirem-agenda__allday-label">Todo el día</span>
                <div class="sirem-agenda__allday-list">
                  @for (item of allDayItems(); track item.id) {
                    <button
                      type="button"
                      [class]="'sirem-agenda__allday-chip sirem-agenda__tone--' + item.tone"
                      (click)="pressEvent(item, $event)"
                    >
                      <span class="sirem-agenda__dot" aria-hidden="true"></span>
                      {{ item.title }}
                    </button>
                  }
                </div>
              </div>
            }

            <div class="sirem-agenda__grid">
              @if (mode() === 'week') {
                <div
                  class="sirem-agenda__corner"
                  #daysHead
                  [class.sirem-agenda__corner--sticky]="stickyDays()"
                  aria-hidden="true"
                ></div>
                @for (day of visibleDays(); track day.getTime()) {
                  <div
                    class="sirem-agenda__head"
                    [class.sirem-agenda__head--sticky]="stickyDays()"
                  >
                    <sirem-date-chip
                      [day]="day.getDate()"
                      [weekday]="weekdayNarrow(day)"
                      [active]="isSelected(day)"
                      [dot]="hasEvents(day)"
                      [ariaLabel]="longDate(day)"
                      (pressed)="openDay(day)"
                    />
                  </div>
                }
              }

              <div class="sirem-agenda__hours" [style.height.px]="bodyHeight()" aria-hidden="true">
                @for (entry of hourLabels(); track entry.hour) {
                  <span class="sirem-agenda__hour" [style.height.px]="hourHeight()">
                    {{ entry.label }}
                  </span>
                }
              </div>

              @for (day of visibleDays(); track day.getTime()) {
                <div
                  class="sirem-agenda__col"
                  [class.sirem-agenda__col--today]="isToday(day)"
                  [class.sirem-agenda__col--selected]="isSelected(day)"
                  [class.sirem-agenda__col--weekend]="isWeekend(day)"
                  [style.height.px]="bodyHeight()"
                  (click)="onColumnClick($event, day)"
                >
                  @for (placed of placedFor(day); track placed.key) {
                    <button
                      type="button"
                      [class]="'sirem-agenda__event sirem-agenda__tone--' + placed.event.tone"
                      [class.sirem-agenda__event--slim]="placed.height < 46"
                      [style.top.px]="placed.top"
                      [style.height.px]="placed.height"
                      [style.left.%]="placed.left"
                      [style.width]="'calc(' + placed.width + '% - 3px)'"
                      (click)="pressEvent(placed.event, $event)"
                    >
                      <span class="sirem-agenda__event-title">
                        <span class="sirem-agenda__dot" aria-hidden="true"></span>
                        <span class="sirem-agenda__event-name">{{ placed.event.title }}</span>
                      </span>
                      <span class="sirem-agenda__event-time">
                        {{ timeRange(placed.event) }}
                      </span>
                      @if (placed.event.location) {
                        <span class="sirem-agenda__event-location">
                          {{ placed.event.location }}
                        </span>
                      }
                    </button>
                  }

                  @if (isToday(day) && nowTop() !== null) {
                    <span
                      class="sirem-agenda__now"
                      [style.top.px]="nowTop()"
                      aria-hidden="true"
                    ></span>
                  }
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class SiremAgenda {
  /** Eventos de la agenda. */
  readonly events = input<SiremAgendaEvent[]>([]);
  /** Vista activa (doble vía). */
  readonly mode = model<SiremAgendaMode>('week');
  /** Día enfocado (doble vía); gobierna la semana y el mes visibles. */
  readonly date = model<Date>(new Date());
  /** Vistas que se ofrecen; el orden es el del selector. */
  readonly modes = input<SiremAgendaMode[]>(['day', 'week', 'month', 'list']);
  /** Idioma de los rótulos. */
  readonly locale = input('es-ES');
  /** Primer día de la semana (`1` = lunes). */
  readonly weekStartsOn = input<0 | 1>(1);
  /** Primera hora visible de la rejilla. */
  readonly startHour = input(7);
  /** Hora final de la rejilla (exclusiva). */
  readonly endHour = input(21);
  /** Alto en px de cada celda de hora (1 h de rejilla). */
  readonly hourHeight = input(64);
  /** Eventos visibles por día en el mes antes de «+N más». */
  readonly maxPerDay = input(2);
  /** Días que abarca la vista de lista. */
  readonly listDays = input(30);
  /** Reloj fijo (pruebas y capturas); `null` usa la hora real. */
  readonly now = input<Date | null>(null);
  /** Adapta vistas y densidad al ancho del contenedor. */
  readonly responsive = input(true);
  /** Qué cabeceras se pegan al hacer scroll de la página. */
  readonly sticky = input<SiremAgendaSticky>('none');
  /** Separación al borde superior, en cualquier unidad CSS (`'4rem'`). */
  readonly stickyOffset = input('0px');
  /** Separación extra en px entre las dos cabeceras pegadas. */
  readonly stickyGap = input(0);
  /** Fondo de la barra en reposo (cualquier color CSS). */
  readonly toolbarBackground = input('');
  /** Fondo de la barra pegada; si falta, usa `toolbarBackground`. */
  readonly toolbarBackgroundStuck = input('');
  /** Desenfoque del fondo de la barra en reposo, en px (`null` = ninguno). */
  readonly toolbarBlur = input<number | null>(null);
  /** Desenfoque de la barra pegada; `null` hereda `toolbarBlur`. */
  readonly toolbarBlurStuck = input<number | null>(null);
  /** Alto de la barra mientras está pegada, en px (`0` = alto natural). */
  readonly toolbarStickyHeight = input(0);
  /** Fondo de la fila de días en reposo (cualquier color CSS). */
  readonly daysBackground = input('');
  /** Fondo de la fila de días pegada; si falta, usa `daysBackground`. */
  readonly daysBackgroundStuck = input('');
  /** Desenfoque del fondo de la fila de días en reposo, en px. */
  readonly daysBlur = input<number | null>(null);
  /** Desenfoque de la fila de días pegada; `null` hereda `daysBlur`. */
  readonly daysBlurStuck = input<number | null>(null);
  /** Alto de la fila de días mientras está pegada, en px (`0` = natural). */
  readonly daysStickyHeight = input(0);

  /** Evento pulsado (original, sin normalizar). */
  readonly eventPressed = output<SiremAgendaEvent>();
  /** Hueco de la rejilla pulsado. */
  readonly slotPressed = output<SiremAgendaSlot>();
  /** Día elegido por el usuario. */
  readonly dayPressed = output<Date>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly barRef = viewChild<ElementRef<HTMLElement>>('bar');
  private readonly daysRef = viewChild<ElementRef<HTMLElement>>('daysHead');
  private readonly barHeight = signal(0);
  private readonly barStuckState = signal(false);
  private readonly daysStuckState = signal(false);
  private readonly clock = signal(new Date());
  private readonly narrow = signal(false);
  private readonly formatters = new Map<string, Intl.DateTimeFormat>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private frame: number | null = null;

  /** La barra de navegación se pega al hacer scroll. */
  readonly stickyToolbar = computed(
    () => this.sticky() === 'toolbar' || this.sticky() === 'both',
  );
  /** La fila de días (o el grupo de la lista) se pega al hacer scroll. */
  readonly stickyDays = computed(() => this.sticky() === 'days' || this.sticky() === 'both');
  /** La barra está realmente pegada arriba ahora mismo. */
  readonly barStuck = computed(() => this.stickyToolbar() && this.barStuckState());
  /** La fila de días está realmente pegada ahora mismo. */
  readonly daysStuck = computed(() => this.stickyDays() && this.daysStuckState());
  /** Alto de la barra al apilarse: el configurado o el medido. */
  private readonly barStackHeight = computed(() =>
    this.toolbarStickyHeight() > 0 ? this.toolbarStickyHeight() : this.barHeight(),
  );
  /** Offset del segundo encabezado: bajo el primero si ambos se pegan. */
  readonly daysTop = computed(() => {
    const base = this.stickyOffset();
    if (!this.stickyToolbar()) return base;
    const extra = this.barStackHeight() + this.stickyGap();
    return extra > 0 ? `calc(${base} + ${extra}px)` : base;
  });
  /** Fondo de la barra según su estado (`null` deja el del tema). */
  readonly barSurface = computed(() =>
    this.pickSurface(this.toolbarBackground(), this.toolbarBackgroundStuck(), this.barStuck()),
  );
  /** Filtro de desenfoque de la barra según su estado. */
  readonly barFilter = computed(() =>
    blurFilter(this.pickBlur(this.toolbarBlur(), this.toolbarBlurStuck(), this.barStuck())),
  );
  /** Fondo de la fila de días según su estado (`null` deja el del tema). */
  readonly daysSurface = computed(() =>
    this.pickSurface(this.daysBackground(), this.daysBackgroundStuck(), this.daysStuck()),
  );
  /** Filtro de desenfoque de la fila de días según su estado. */
  readonly daysFilter = computed(() =>
    blurFilter(this.pickBlur(this.daysBlur(), this.daysBlurStuck(), this.daysStuck())),
  );

  /** El contenedor es estrecho. */
  readonly compact = computed(() => this.responsive() && this.narrow());
  /** Reloj efectivo: el fijo de `now` o el real. */
  private readonly nowValue = computed(() => this.now() ?? this.clock());
  readonly today = computed(() => startOfDay(this.nowValue()));
  readonly selected = computed(() => startOfDay(this.date()));
  readonly weekDays = computed(() =>
    rangeDays(startOfWeek(this.selected(), this.weekStartsOn()), 7),
  );
  readonly visibleDays = computed(() =>
    this.mode() === 'day' ? [this.selected()] : this.weekDays(),
  );
  readonly availableModes = computed<SiremAgendaMode[]>(() => {
    const modes = this.modes();
    const filtered = this.compact() ? modes.filter((mode) => mode !== 'week') : modes;
    return filtered.length ? filtered : ['day'];
  });
  readonly modeItems = computed<SiremViewToggleItem[]>(() => {
    const labels: Record<SiremAgendaMode, { label: string; icon: string }> = {
      day: { label: 'Día', icon: 'fi fi-rr-calendar-day' },
      week: { label: 'Semana', icon: 'fi fi-rr-calendar-days' },
      month: { label: 'Mes', icon: 'fi fi-rr-calendar-lines' },
      list: { label: 'Agenda', icon: 'fi fi-rr-list' },
    };
    return this.availableModes().map((mode) => ({ value: mode, ...labels[mode] }));
  });

  /** Eventos normalizados y ordenados por inicio. */
  readonly items = computed<SiremAgendaItem[]>(() => {
    const out: SiremAgendaItem[] = [];
    this.events().forEach((event, index) => {
      const item = this.normalize(event, index);
      if (item) out.push(item);
    });
    return out.sort(
      (a, b) => a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime(),
    );
  });

  /** Eventos por día (`yyyy-m-d`), incluyendo los que cruzan medianoche. */
  readonly byDay = computed<Map<string, SiremAgendaItem[]>>(() => {
    const map = new Map<string, SiremAgendaItem[]>();
    for (const item of this.items()) {
      const first = startOfDay(item.start);
      const last = startOfDay(new Date(item.end.getTime() - 1));
      for (let day = first; day <= last; day = addDays(day, 1)) {
        const key = dayKey(day);
        const list = map.get(key);
        if (list) list.push(item);
        else map.set(key, [item]);
      }
    }
    return map;
  });

  /** Ventana horaria visible, en minutos desde medianoche. */
  readonly window = computed(() => {
    const from = this.startHour() * 60;
    const hours = Math.max(1, this.endHour() - this.startHour());
    return { from, to: from + hours * 60 };
  });

  /** Alto total de la columna de un día. */
  readonly bodyHeight = computed(
    () => ((this.window().to - this.window().from) / 60) * this.hourHeight(),
  );

  /** Rótulos de hora de la columna izquierda. */
  readonly hourLabels = computed<{ hour: number; label: string }[]>(() => {
    const { from, to } = this.window();
    const format = this.dtf({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const labels: { hour: number; label: string }[] = [];
    for (let minute = from; minute < to; minute += 60) {
      labels.push({ hour: minute / 60, label: format.format(new Date(2000, 0, 1, 0, minute)) });
    }
    return labels;
  });

  /** Eventos por día y columna, ya colocados en la rejilla. */
  readonly layout = computed<Map<string, SiremAgendaPlaced[]>>(() => {
    const { from, to } = this.window();
    const height = this.hourHeight();
    const map = new Map<string, SiremAgendaPlaced[]>();
    for (const day of this.visibleDays()) {
      const key = dayKey(day);
      map.set(key, this.place(this.byDay().get(key) ?? [], day, from, to, height));
    }
    return map;
  });

  /** Eventos de todo el día en el rango visible (sin duplicados). */
  readonly allDayItems = computed<SiremAgendaItem[]>(() => {
    const seen = new Set<string | number>();
    const out: SiremAgendaItem[] = [];
    for (const day of this.visibleDays()) {
      for (const item of this.byDay().get(dayKey(day)) ?? []) {
        if (!item.allDay || seen.has(item.id)) continue;
        seen.add(item.id);
        out.push(item);
      }
    }
    return out;
  });

  /** Celdas del mes (con los días de los meses vecinos que rellenan). */
  readonly monthCells = computed<SiremAgendaMonthCell[]>(() => {
    const selected = this.selected();
    const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
    const last = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
    const gridStart = startOfWeek(first, this.weekStartsOn());
    const gridEnd = addDays(startOfWeek(last, this.weekStartsOn()), 6);
    const cells: SiremAgendaMonthCell[] = [];
    for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
      const key = dayKey(day);
      cells.push({
        key,
        date: day,
        inMonth: day.getMonth() === first.getMonth(),
        today: sameDay(day, this.today()),
        selected: sameDay(day, selected),
        events: this.byDay().get(key) ?? [],
      });
    }
    return cells;
  });

  /** Días con eventos en la vista de lista. */
  readonly listGroups = computed<SiremAgendaListGroup[]>(() => {
    const groups: SiremAgendaListGroup[] = [];
    const start = this.selected();
    for (let index = 0; index < this.listDays(); index += 1) {
      const day = addDays(start, index);
      const events = this.byDay().get(dayKey(day)) ?? [];
      if (!events.length) continue;
      groups.push({
        key: dayKey(day),
        date: day,
        day: this.dtf({ day: 'numeric', month: 'short' }).format(day),
        weekday: capitalize(this.dtf({ weekday: 'long' }).format(day)),
        today: sameDay(day, this.today()),
        events,
      });
    }
    return groups;
  });

  /** Cabecera de días de la semana (iniciales). */
  readonly weekdayLabels = computed(() =>
    rangeDays(startOfWeek(this.selected(), this.weekStartsOn()), 7).map((day) =>
      this.weekdayNarrow(day),
    ),
  );

  /** Título de la vista. */
  readonly title = computed(() => {
    switch (this.mode()) {
      case 'day':
        return capitalize(
          this.dtf({ weekday: 'long', day: 'numeric', month: 'long' }).format(this.selected()),
        );
      case 'week': {
        const days = this.weekDays();
        const first = days[0];
        const last = days[6];
        const start =
          first.getMonth() === last.getMonth()
            ? String(first.getDate())
            : capitalize(this.dtf({ day: 'numeric', month: 'short' }).format(first));
        const end = capitalize(
          this.dtf({ day: 'numeric', month: 'long', year: 'numeric' }).format(last),
        );
        return `${start} – ${end}`;
      }
      case 'month':
        return capitalize(
          this.dtf({ month: 'long', year: 'numeric' }).format(this.selected()),
        );
      default:
        return 'Agenda';
    }
  });

  /** Recuento de eventos de la vista. */
  readonly subtitle = computed(() => {
    const ids = new Set<string | number>();
    if (this.mode() === 'list') {
      for (const group of this.listGroups()) {
        for (const item of group.events) ids.add(item.id);
      }
    } else if (this.mode() === 'month') {
      for (const cell of this.monthCells()) {
        if (!cell.inMonth) continue;
        for (const item of cell.events) ids.add(item.id);
      }
    } else {
      for (const day of this.visibleDays()) {
        for (const item of this.byDay().get(dayKey(day)) ?? []) ids.add(item.id);
      }
    }
    const count = ids.size;
    if (count === 0) return 'Sin eventos';
    return count === 1 ? '1 evento' : `${count} eventos`;
  });

  /** Posición del indicador de ahora (solo si hoy está visible y en horario). */
  readonly nowTop = computed<number | null>(() => {
    if (!this.visibleDays().some((day) => sameDay(day, this.today()))) return null;
    const now = this.nowValue();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const { from, to } = this.window();
    if (minutes < from || minutes > to) return null;
    return ((minutes - from) / 60) * this.hourHeight();
  });

  constructor() {
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        this.narrow.set(width > 0 && width < 640);
      });
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    }

    // Alto real de la barra: así la segunda cabecera se apila justo debajo.
    effect((onCleanup) => {
      const bar = this.barRef()?.nativeElement;
      if (!bar || typeof ResizeObserver === 'undefined') return;
      const measure = () => {
        this.barHeight.set(bar.offsetHeight);
        this.detectStuck();
      };
      const observer = new ResizeObserver(measure);
      observer.observe(bar);
      measure();
      onCleanup(() => observer.disconnect());
    });

    // El estado «pegado» real depende del scroll de la página, no solo de la
    // configuración: se re-mide al hacer scroll, al redimensionar y cuando
    // cambia la configuración o los elementos con cabecera fija.
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onViewportChange, PASSIVE);
      window.addEventListener('resize', this.onViewportChange, PASSIVE);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', this.onViewportChange, PASSIVE);
        window.removeEventListener('resize', this.onViewportChange, PASSIVE);
        this.cancelFrame();
      });
    }

    effect(() => {
      this.sticky();
      this.stickyOffset();
      this.toolbarStickyHeight();
      this.daysStickyHeight();
      this.barRef();
      this.daysRef();
      this.onViewportChange();
    });

    this.destroyRef.onDestroy(() => this.stopClock());

    // El reloj solo corre si no hay hora fija; así las capturas y los tests
    // con `now` no dejan temporizadores vivos.
    effect(() => {
      if (this.now()) this.stopClock();
      else this.startClock();
    });

    // Si la vista activa deja de ofrecerse (responsive o `modes`), se cae a la
    // primera disponible para que el selector nunca quede sin estado.
    effect(() => {
      const modes = this.availableModes();
      if (!modes.includes(this.mode())) this.mode.set(modes[0]);
    });
  }

  private startClock(): void {
    if (this.timer || typeof window === 'undefined') return;
    this.timer = setInterval(() => this.clock.set(new Date()), MINUTE_MS);
  }

  private stopClock(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  // ------------------------------------------------------------ estado pegado

  /** `Npx` o `null` cuando no hay alto que aplicar. */
  pxOrNull(value: number): string | null {
    return value > 0 ? `${value}px` : null;
  }

  /** Resuelve el fondo del estado actual (pegado usa el suyo si lo hay). */
  private pickSurface(normal: string, stuck: string, isStuck: boolean): string | null {
    const value = isStuck ? stuck || normal : normal;
    return value || null;
  }

  /** Resuelve el desenfoque del estado actual (pegado hereda el normal). */
  private pickBlur(normal: number | null, stuck: number | null, isStuck: boolean): number | null {
    return isStuck ? (stuck ?? normal) : normal;
  }

  /** Re-mide el estado pegado, como mucho una vez por fotograma. */
  private readonly onViewportChange = (): void => {
    if (typeof requestAnimationFrame === 'undefined') {
      this.detectStuck();
      return;
    }
    if (this.frame !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.detectStuck();
    });
  };

  private cancelFrame(): void {
    if (this.frame === null) return;
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  /** Cabeceras pegadas ahora: su borde superior coincide con su `top`. */
  private detectStuck(): void {
    const bar = this.stickyToolbar() ? this.barRef()?.nativeElement : null;
    const days = this.stickyDays() ? this.daysRef()?.nativeElement : null;
    const barStuck = this.isStuck(bar);
    const daysStuck = this.isStuck(days);
    if (barStuck !== this.barStuckState()) this.barStuckState.set(barStuck);
    if (daysStuck !== this.daysStuckState()) this.daysStuckState.set(daysStuck);
  }

  private isStuck(element: HTMLElement | null | undefined): boolean {
    if (!element || typeof window === 'undefined') return false;
    const style = getComputedStyle(element);
    if (style.position !== 'sticky') return false;
    const top = Number.parseFloat(style.top);
    if (!Number.isFinite(top)) return false;
    return Math.abs(element.getBoundingClientRect().top - top) < 1.5;
  }

  // ------------------------------------------------------------- navegación

  prev(): void {
    this.shift(-1);
  }

  next(): void {
    this.shift(1);
  }

  goToday(): void {
    this.pickDay(this.today());
  }

  /** Cambia de vista desde el selector. */
  setMode(value: string): void {
    const mode = value as SiremAgendaMode;
    if (mode !== this.mode()) this.mode.set(mode);
  }

  /** Selecciona un día y avisa. */
  pickDay(day: Date): void {
    const next = startOfDay(day);
    this.date.set(next);
    this.dayPressed.emit(next);
  }

  /** Selecciona el día y salta a la vista de día (cabecera de semana y «+N»). */
  openDay(day: Date): void {
    this.pickDay(day);
    this.mode.set('day');
  }

  /** Clic en un hueco: emite el minuto redondeado a 15. */
  onColumnClick(event: MouseEvent, day: Date): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const offset = event.clientY - rect.top;
    const { from, to } = this.window();
    const raw = from + (offset / Math.max(1, this.hourHeight())) * 60;
    const snapped = Math.min(to, Math.max(from, Math.round(raw / 15) * 15));
    this.pickDay(day);
    this.slotPressed.emit({
      date: startOfDay(day),
      hour: Math.floor(snapped / 60),
      minute: snapped % 60,
    });
  }

  /** Emite el evento original. */
  pressEvent(item: SiremAgendaItem, event?: Event): void {
    event?.stopPropagation();
    this.eventPressed.emit(item.source);
  }

  // ---------------------------------------------------------------- consulta

  placedFor(day: Date): SiremAgendaPlaced[] {
    return this.layout().get(dayKey(day)) ?? [];
  }

  hasEvents(day: Date): boolean {
    return (this.byDay().get(dayKey(day)) ?? []).length > 0;
  }

  isToday(day: Date): boolean {
    return sameDay(day, this.today());
  }

  isSelected(day: Date): boolean {
    return sameDay(day, this.selected());
  }

  isWeekend(day: Date): boolean {
    return day.getDay() === 0 || day.getDay() === 6;
  }

  weekdayNarrow(day: Date): string {
    return this.dtf({ weekday: 'narrow' }).format(day);
  }

  longDate(day: Date): string {
    return capitalize(this.dtf({ weekday: 'long', day: 'numeric', month: 'long' }).format(day));
  }

  timeRange(item: SiremAgendaItem): string {
    if (item.allDay) return 'Todo el día';
    const format = this.dtf({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    return `${format.format(item.start)} – ${format.format(item.end)}`;
  }

  // ----------------------------------------------------------------- privado

  private shift(direction: number): void {
    switch (this.mode()) {
      case 'day':
        this.pickDay(addDays(this.selected(), direction));
        break;
      case 'week':
        this.pickDay(addDays(this.selected(), direction * 7));
        break;
      case 'month':
        this.pickDay(addMonths(this.selected(), direction));
        break;
      default:
        this.pickDay(addDays(this.selected(), direction * this.listDays()));
        break;
    }
  }

  private normalize(event: SiremAgendaEvent, index: number): SiremAgendaItem | null {
    const start = new Date(event.start);
    if (Number.isNaN(start.getTime())) return null;
    const rawEnd = event.end ? new Date(event.end) : null;
    const end =
      rawEnd && rawEnd.getTime() > start.getTime()
        ? rawEnd
        : new Date(start.getTime() + 30 * MINUTE_MS);
    return {
      id: event.id ?? `agenda-${index}`,
      source: event,
      title: event.title,
      start,
      end,
      allDay: event.allDay === true,
      tone: event.tone ?? 'brand',
      location: event.location ?? '',
      meta: event.meta ?? '',
    };
  }

  /**
   * Coloca los eventos de un día: recorta al horario visible y reparte en
   * columnas los solapados (los bloques que se tocan no cuentan como solape).
   */
  private place(
    items: SiremAgendaItem[],
    day: Date,
    from: number,
    to: number,
    hourHeight: number,
  ): SiremAgendaPlaced[] {
    const dayStart = startOfDay(day).getTime();
    const spans = items
      .filter((item) => !item.allDay)
      .map((item) => ({
        item,
        top: Math.max((item.start.getTime() - dayStart) / MINUTE_MS, from),
        bottom: Math.min((item.end.getTime() - dayStart) / MINUTE_MS, to),
      }))
      .filter((span) => span.bottom > from && span.top < to)
      .sort((a, b) => a.top - b.top || b.bottom - a.bottom);

    const placed: SiremAgendaPlaced[] = [];
    let cluster: typeof spans = [];
    let clusterEnd = -1;

    const flush = () => {
      if (!cluster.length) return;
      const columns: number[] = [];
      const assigned = cluster.map((span) => {
        let column = columns.findIndex((end) => end <= span.top);
        if (column === -1) {
          column = columns.length;
          columns.push(span.bottom);
        } else {
          columns[column] = span.bottom;
        }
        return { span, column };
      });
      const total = columns.length || 1;
      for (const { span, column } of assigned) {
        // Un mínimo de 20 min mantiene el bloque legible y pulsable.
        const bottom = Math.min(to, Math.max(span.bottom, span.top + 20));
        placed.push({
          key: `${span.item.id}-${dayKey(day)}`,
          event: span.item,
          top: ((span.top - from) / 60) * hourHeight,
          height: Math.max(18, ((bottom - span.top) / 60) * hourHeight - 2),
          left: (column / total) * 100,
          width: 100 / total,
        });
      }
      cluster = [];
    };

    for (const span of spans) {
      if (cluster.length && span.top >= clusterEnd) {
        flush();
        clusterEnd = -1;
      }
      cluster.push(span);
      clusterEnd = Math.max(clusterEnd, span.bottom);
    }
    flush();
    return placed;
  }

  /** Formateador de fecha cacheado por idioma y opciones. */
  private dtf(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${this.locale()}|${JSON.stringify(options)}`;
    const cached = this.formatters.get(key);
    if (cached) return cached;
    const format = new Intl.DateTimeFormat(this.locale(), options);
    this.formatters.set(key, format);
    return format;
  }
}
