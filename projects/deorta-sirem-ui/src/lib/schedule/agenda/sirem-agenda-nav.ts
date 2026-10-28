import {
  Component,
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
import type {
  SiremAgendaDateRange,
  SiremAgendaEvent,
  SiremAgendaLazyLoadEvent,
  SiremAgendaMode,
} from './sirem-agenda-types';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Navegador de días y fechas para la agenda (`sirem-agenda-nav`).
 *
 * Incluye controles de navegación temporal (Anterior, Hoy, Siguiente), títulos
 * contextuales de fecha, y una franja desplazable de días con soporte de
 * **scroll infinito horizontal y carga perezosa (lazy loading)**.
 *
 * ## Scroll infinito y carga perezosa
 * Al desplazar la franja de días horizontalmente hacia los bordes, el componente
 * añade automáticamente más días en el pasado o futuro y emite:
 * - `reachStart`: el usuario llega al límite izquierdo del rango.
 * - `reachEnd`: el usuario llega al límite derecho del rango.
 * - `lazyLoad`: solicitud de carga perezosa en dirección `'prev'` o `'next'`.
 * - `rangeChange`: rango total de fechas cargado actualmente.
 *
 * Uso:
 * ```html
 * <sirem-agenda-nav
 *   [(date)]="fecha"
 *   [mode]="modo"
 *   (reachEnd)="cargarMasCitasFuturas($event)"
 *   (reachStart)="cargarMasCitasPasadas($event)"
 *   (dayPressed)="seleccionar($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-agenda-nav',
  standalone: true,
  imports: [SiremDateChip],
  styleUrl: './sirem-agenda-nav.scss',
  template: `
    <div class="sirem-agenda-nav">
      <div class="sirem-agenda-nav__top">
        <div class="sirem-agenda-nav__controls">
          <button
            type="button"
            class="sirem-agenda-nav__btn"
            (click)="prev()"
            aria-label="Anterior"
          >
            <i class="fi fi-rr-angle-small-left" aria-hidden="true"></i>
          </button>
          <button type="button" class="sirem-agenda-nav__today" (click)="goToday()">
            Hoy
          </button>
          <button
            type="button"
            class="sirem-agenda-nav__btn"
            (click)="next()"
            aria-label="Siguiente"
          >
            <i class="fi fi-rr-angle-small-right" aria-hidden="true"></i>
          </button>
        </div>

        <div class="sirem-agenda-nav__heading">
          <h2 class="sirem-agenda-nav__title">{{ displayTitle() }}</h2>
          @if (displaySubtitle()) {
            <span class="sirem-agenda-nav__subtitle">{{ displaySubtitle() }}</span>
          }
        </div>

        <ng-content select="[nav-actions]" />
      </div>

      @if (showChips()) {
        <div
          class="sirem-agenda-nav__rail"
          #rail
          role="group"
          aria-label="Días navegables"
          (scroll)="onRailScroll()"
        >
          @for (day of loadedDays(); track day.getTime()) {
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
    </div>
  `,
})
export class SiremAgendaNav {
  /** Día seleccionado en doble vía. */
  readonly date = model<Date>(new Date());
  /** Vista activa asociada (día, semana, mes, lista). */
  readonly mode = input<SiremAgendaMode>('week');
  /** Eventos para mostrar indicadores de puntos en los chips. */
  readonly events = input<SiremAgendaEvent[]>([]);
  /** Título personalizado (si se omite, se formatea automáticamente). */
  readonly title = input<string | null>(null);
  /** Subtítulo descriptivo opcional. */
  readonly subtitle = input<string | null>(null);
  /** Idioma de formateo de fechas. */
  readonly locale = input('es-ES');
  /** Primer día de la semana (`1` = lunes). */
  readonly weekStartsOn = input<0 | 1>(1);
  /** Muestra la fila desplazable de date-chips. */
  readonly showChips = input(true);
  /** Habilita la carga perezosa infinita al llegar a los extremos del scroll. */
  readonly infiniteScroll = input(true);
  /** Distancia en px desde el borde para activar la carga perezosa. */
  readonly threshold = input(80);
  /** Cantidad de días añadidos en cada carga perezosa. */
  readonly pageSize = input(14);

  /** Se emite al pulsar un día concreto. */
  readonly dayPressed = output<Date>();
  /** Se emite al pulsar el botón anterior. */
  readonly prevPressed = output<void>();
  /** Se emite al pulsar el botón siguiente. */
  readonly nextPressed = output<void>();
  /** Se emite al pulsar el botón hoy. */
  readonly todayPressed = output<void>();
  /** Se emite cuando el scroll llega cerca del límite izquierdo. */
  readonly reachStart = output<SiremAgendaDateRange>();
  /** Se emite cuando el scroll llega cerca del límite derecho. */
  readonly reachEnd = output<SiremAgendaDateRange>();
  /** Solicitud de carga perezosa hacia atrás o hacia adelante. */
  readonly lazyLoad = output<SiremAgendaLazyLoadEvent>();
  /** Se emite cuando cambia el rango visible o cargado. */
  readonly rangeChange = output<SiremAgendaDateRange>();

  private readonly railRef = viewChild<ElementRef<HTMLElement>>('rail');

  /** Días cargados en el buffer del navegador. */
  readonly loadedDays = signal<Date[]>([]);
  private readonly eventsDateSet = computed(() => {
    const set = new Set<string>();
    for (const ev of this.events()) {
      const d = startOfDay(new Date(ev.start));
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
    return set;
  });

  private isPrepopulating = false;

  constructor() {
    // Inicializar los días cargados alrededor de la fecha seleccionada
    effect(() => {
      const selected = startOfDay(this.date());
      if (this.loadedDays().length === 0) {
        this.resetWindowAround(selected);
      }
    });
  }

  readonly displayTitle = computed(() => {
    if (this.title() !== null && this.title() !== undefined) {
      return this.title()!;
    }
    const dtf = (opts: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(this.locale(), opts);

    const sel = startOfDay(this.date());
    switch (this.mode()) {
      case 'day':
        return capitalize(
          dtf({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(sel),
        );
      case 'month':
        return capitalize(dtf({ month: 'long', year: 'numeric' }).format(sel));
      case 'week': {
        const diff = (sel.getDay() - this.weekStartsOn() + 7) % 7;
        const first = addDays(sel, -diff);
        const last = addDays(first, 6);
        const startStr =
          first.getMonth() === last.getMonth()
            ? String(first.getDate())
            : capitalize(dtf({ day: 'numeric', month: 'short' }).format(first));
        const endStr = capitalize(
          dtf({ day: 'numeric', month: 'long', year: 'numeric' }).format(last),
        );
        return `${startStr} – ${endStr}`;
      }
      default:
        return 'Agenda';
    }
  });

  readonly displaySubtitle = computed(() => {
    if (this.subtitle() !== null && this.subtitle() !== undefined) {
      return this.subtitle()!;
    }
    return null;
  });

  resetWindowAround(centerDate: Date): void {
    const count = this.pageSize() * 2;
    const start = addDays(centerDate, -this.pageSize());
    const days: Date[] = [];
    for (let i = 0; i < count; i++) {
      days.push(addDays(start, i));
    }
    this.loadedDays.set(days);
    this.emitRange();
  }

  onRailScroll(): void {
    if (!this.infiniteScroll() || this.isPrepopulating) return;
    const rail = this.railRef()?.nativeElement;
    if (!rail) return;

    const { scrollLeft, scrollWidth, clientWidth } = rail;
    const threshold = this.threshold();

    // Límite izquierdo -> Prepend
    if (scrollLeft <= threshold) {
      this.prependDays();
    }
    // Límite derecho -> Append
    else if (scrollLeft + clientWidth >= scrollWidth - threshold) {
      this.appendDays();
    }
  }

  prependDays(): void {
    const current = this.loadedDays();
    if (!current.length) return;
    const first = current[0];
    const addedCount = this.pageSize();
    const newDays: Date[] = [];
    for (let i = addedCount; i >= 1; i--) {
      newDays.push(addDays(first, -i));
    }

    this.isPrepopulating = true;
    const rail = this.railRef()?.nativeElement;
    const prevScrollWidth = rail ? rail.scrollWidth : 0;
    const prevScrollLeft = rail ? rail.scrollLeft : 0;

    this.loadedDays.update((list) => [...newDays, ...list]);

    const range = {
      start: newDays[0],
      end: current[current.length - 1],
    };

    this.reachStart.emit(range);
    this.lazyLoad.emit({ direction: 'prev', date: newDays[0], count: addedCount });
    this.emitRange();

    // Mantener la posición del scroll tras añadir a la izquierda
    setTimeout(() => {
      if (rail) {
        const delta = rail.scrollWidth - prevScrollWidth;
        rail.scrollLeft = prevScrollLeft + delta;
      }
      this.isPrepopulating = false;
    }, 0);
  }

  appendDays(): void {
    const current = this.loadedDays();
    if (!current.length) return;
    const last = current[current.length - 1];
    const addedCount = this.pageSize();
    const newDays: Date[] = [];
    for (let i = 1; i <= addedCount; i++) {
      newDays.push(addDays(last, i));
    }

    this.loadedDays.update((list) => [...list, ...newDays]);

    const range = {
      start: current[0],
      end: newDays[newDays.length - 1],
    };

    this.reachEnd.emit(range);
    this.lazyLoad.emit({ direction: 'next', date: last, count: addedCount });
    this.emitRange();
  }

  private emitRange(): void {
    const list = this.loadedDays();
    if (list.length) {
      this.rangeChange.emit({
        start: list[0],
        end: list[list.length - 1],
      });
    }
  }

  pickDay(day: Date): void {
    const d = startOfDay(day);
    this.date.set(d);
    this.dayPressed.emit(d);
  }

  prev(): void {
    this.shift(-1);
    this.prevPressed.emit();
  }

  next(): void {
    this.shift(1);
    this.nextPressed.emit();
  }

  goToday(): void {
    const today = startOfDay(new Date());
    this.pickDay(today);
    this.todayPressed.emit();
  }

  private shift(delta: number): void {
    const cur = startOfDay(this.date());
    switch (this.mode()) {
      case 'day':
        this.pickDay(addDays(cur, delta));
        break;
      case 'week':
        this.pickDay(addDays(cur, delta * 7));
        break;
      case 'month': {
        const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + delta, 1);
        this.pickDay(nextMonth);
        break;
      }
      default:
        this.pickDay(addDays(cur, delta * 7));
        break;
    }
  }

  isSelected(day: Date): boolean {
    return sameDay(day, startOfDay(this.date()));
  }

  hasEvents(day: Date): boolean {
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return this.eventsDateSet().has(key);
  }

  weekdayNarrow(day: Date): string {
    return new Intl.DateTimeFormat(this.locale(), { weekday: 'narrow' }).format(day);
  }

  longDate(day: Date): string {
    return capitalize(
      new Intl.DateTimeFormat(this.locale(), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(day),
    );
  }
}
