import { Component, computed, input, model, output, signal } from '@angular/core';

/** Evento de agenda. `color` acepta cualquier color CSS (p. ej. `#1d64f1`). */
export interface SiremCalendarEvent {
  /** Día en ISO `yyyy-MM-dd`. */
  date: string;
  label: string;
  color?: string;
}

export type SiremCalendarSize = 'small' | 'medium' | 'large';

interface DayCell {
  iso: string | null;
  day: number | null;
  today: boolean;
  selected: boolean;
  dots: string[];
  events: SiremCalendarEvent[];
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

/**
 * Calendario mensual único de agenda (`ScheduleListComponent`) con tres tamaños:
 * - `small`: compacto para popups (p. ej. `sirem-date-field`) y vistas densas.
 * - `medium`: vista normal con puntos de estado por día.
 * - `large`: tipo Google Calendar, celdas amplias con etiquetas de eventos.
 *
 * Los tres navegan fácil entre meses y años: flechas ‹ ›, botón Hoy y
 * selector de mes/año (toca el título). Día seleccionado en doble vía.
 *
 * Uso:
 * ```html
 * <sirem-calendar size="small" [events]="citas" [(selected)]="dia" (dayPressed)="ver($event)" />
 * ```
 */
@Component({
  selector: 'sirem-calendar',
  standalone: true,
  styleUrl: './sirem-calendar.scss',
  template: `
    <div
      class="sirem-cal"
      [class.sirem-cal--small]="size() === 'small'"
      [class.sirem-cal--medium]="size() === 'medium'"
      [class.sirem-cal--large]="size() === 'large'"
    >
      <div class="sirem-cal__head">
        <button
          type="button"
          (click)="titlePressed()"
          [attr.aria-expanded]="pickerOpen()"
          aria-haspopup="dialog"
          aria-label="Elegir mes y año"
          class="sirem-cal__title"
        >
          {{ titleShort() }}
        </button>
        <button
          type="button"
          (click)="go(-1)"
          aria-label="Mes anterior"
          class="sirem-cal__nav"
        >
          ‹
        </button>
        <button
          type="button"
          (click)="go(1)"
          aria-label="Mes siguiente"
          class="sirem-cal__nav"
        >
          ›
        </button>

        @if (pickerOpen()) {
          <div
            role="dialog"
            aria-label="Selector de mes y año"
            class="sirem-cal__picker"
          >
            <div class="sirem-cal__year">
              <button
                type="button"
                (click)="goYear(-1)"
                aria-label="Año anterior"
                class="sirem-cal__year-btn"
              >
                ‹
              </button>
              <span class="sirem-cal__year-label">{{ year() }}</span>
              <button
                type="button"
                (click)="goYear(1)"
                aria-label="Año siguiente"
                class="sirem-cal__year-btn"
              >
                ›
              </button>
            </div>
            <div class="sirem-cal__months">
              @for (m of monthNames; track m; let i = $index) {
                <button
                  type="button"
                  (click)="pickMonth(i)"
                  [attr.aria-pressed]="i === month()"
                  class="sirem-cal__month"
                  [class.sirem-cal__month--current]="i === month()"
                >
                  {{ m.slice(0, 3) }}
                </button>
              }
            </div>
          </div>
        }
      </div>

      <div
        class="sirem-cal__week"
        aria-hidden="true"
      >
        @for (d of weekDays; track d) {
          <span>{{ size() === 'large' ? d.long : d.short }}</span>
        }
      </div>

      <div class="sirem-cal__grid" role="grid" aria-label="Calendario">
        @for (cell of cells(); track cell.iso ?? 'blank-' + $index) {
          @if (cell.iso) {
            @if (size() === 'large') {
              <button
                type="button"
                role="gridcell"
                (click)="pick(cell.iso)"
                [attr.aria-label]="cell.iso"
                [attr.aria-pressed]="cell.selected"
                class="sirem-cal__cell"
                [class.sirem-cal__cell--selected]="cell.selected"
              >
                <span
                  class="sirem-cal__cell-day"
                  [class.sirem-cal__cell-day--today]="cell.today"
                >
                  {{ cell.day }}
                </span>
                @for (ev of cell.events.slice(0, 2); track ev.label + ev.date) {
                  <span
                    class="sirem-cal__event"
                    [style.background]="ev.color ?? '#1d64f1'"
                  >
                    {{ ev.label }}
                  </span>
                }
                @if (cell.events.length > 2) {
                  <span class="sirem-cal__more">
                    +{{ cell.events.length - 2 }} más
                  </span>
                }
              </button>
            } @else {
              <button
                type="button"
                role="gridcell"
                (click)="pick(cell.iso)"
                [attr.aria-label]="cell.iso"
                [attr.aria-pressed]="cell.selected"
                class="sirem-cal__day"
                [class.sirem-cal__day--selected]="cell.selected"
                [class.sirem-cal__day--today]="cell.today && !cell.selected"
              >
                {{ cell.day }}
                @if (size() !== 'small') {
                  <span class="sirem-cal__dots" aria-hidden="true">
                    @for (dot of cell.dots; track dot + $index) {
                      <span class="sirem-cal__dot" [style.background]="dot"></span>
                    }
                  </span>
                }
              </button>
            }
          } @else {
            <span aria-hidden="true"></span>
          }
        }
      </div>

      @if (legend().length && size() !== 'small') {
        <div class="sirem-cal__legend">
          @for (entry of legend(); track entry.label) {
            <span class="sirem-cal__legend-item">
              <span
                class="sirem-cal__legend-dot"
                [style.background]="entry.color"
                aria-hidden="true"
              ></span>
              {{ entry.label }}
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class SiremCalendar {
  readonly events = input<SiremCalendarEvent[]>([]);
  /** Leyenda estado → color (p. ej. Confirmada, Pendiente, Cancelada). */
  readonly legend = input<{ label: string; color: string }[]>([]);
  /** Tamaño: small (popups), medium (normal), large (tipo Google Calendar). */
  readonly size = input<SiremCalendarSize>('medium');
  /** Día seleccionado en ISO. */
  readonly selected = model<string | null>(null);

  readonly dayPressed = output<string>();

  readonly weekDays = [
    { short: 'L', long: 'Lun' },
    { short: 'M', long: 'Mar' },
    { short: 'M', long: 'Mié' },
    { short: 'J', long: 'Jue' },
    { short: 'V', long: 'Vie' },
    { short: 'S', long: 'Sáb' },
    { short: 'D', long: 'Dom' },
  ];
  readonly monthNames = MONTHS;

  private readonly cursor = signal(startOfMonth(new Date()));
  readonly pickerOpen = signal(false);

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(this.cursor()),
  );
  /** Título corto estilo "Abr 2022". */
  readonly titleShort = computed(() => {
    const c = this.cursor();
    return `${MONTHS_SHORT[c.getMonth()]} ${c.getFullYear()}`;
  });
  readonly month = computed(() => this.cursor().getMonth());
  readonly year = computed(() => this.cursor().getFullYear());

  private readonly eventsByDay = computed(() => {
    const map = new Map<string, SiremCalendarEvent[]>();
    for (const e of this.events()) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  });

  readonly cells = computed<DayCell[]>(() => {
    const base = this.cursor();
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    // Lunes = 0
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const todayIso = toIso(new Date());
    const selected = this.selected();
    const byDay = this.eventsByDay();
    const cells: DayCell[] = [];
    for (let i = 0; i < lead; i++) {
      cells.push({ iso: null, day: null, today: false, selected: false, dots: [], events: [] });
    }
    for (let d = 1; d <= days; d++) {
      const iso = toIso(new Date(year, month, d));
      const events = byDay.get(iso) ?? [];
      cells.push({
        iso,
        day: d,
        today: iso === todayIso,
        selected: iso === selected,
        dots: events.slice(0, 3).map((e) => e.color ?? '#1d64f1'),
        events,
      });
    }
    return cells;
  });

  go(delta: number): void {
    const c = this.cursor();
    this.cursor.set(startOfMonth(new Date(c.getFullYear(), c.getMonth() + delta, 1)));
  }

  goYear(delta: number): void {
    const c = this.cursor();
    this.cursor.set(startOfMonth(new Date(c.getFullYear() + delta, c.getMonth(), 1)));
  }

  pickMonth(month: number): void {
    const c = this.cursor();
    this.cursor.set(startOfMonth(new Date(c.getFullYear(), month, 1)));
    this.pickerOpen.set(false);
  }

  titlePressed(): void {
    this.pickerOpen.update((v) => !v);
  }

  today(): void {
    this.cursor.set(startOfMonth(new Date()));
    this.pickerOpen.set(false);
  }

  pick(iso: string): void {
    this.selected.set(iso);
    this.dayPressed.emit(iso);
  }
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function toIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
