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
import { SiremAgendaBody } from './sirem-agenda-body';
import { SiremAgendaModeSwitcher } from './sirem-agenda-mode-switcher';
import { SiremAgendaNav } from './sirem-agenda-nav';
import type {
  SiremAgendaDateRange,
  SiremAgendaEvent,
  SiremAgendaItem,
  SiremAgendaLazyLoadEvent,
  SiremAgendaListGroup,
  SiremAgendaMode,
  SiremAgendaMonthCell,
  SiremAgendaPlaced,
  SiremAgendaSlot,
  SiremAgendaSticky,
  SiremAgendaTone,
} from './sirem-agenda-types';

export type {
  SiremAgendaDateRange,
  SiremAgendaEvent,
  SiremAgendaItem,
  SiremAgendaLazyLoadEvent,
  SiremAgendaListGroup,
  SiremAgendaMode,
  SiremAgendaMonthCell,
  SiremAgendaPlaced,
  SiremAgendaSlot,
  SiremAgendaSticky,
  SiremAgendaTone,
};

const PASSIVE: AddEventListenerOptions = { capture: true, passive: true };

function blurFilter(px: number | null): string | null {
  return px && px > 0 ? `blur(${px}px)` : null;
}

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

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date, weekStartsOn: number): Date {
  const day = startOfDay(date);
  const diff = (day.getDay() - weekStartsOn + 7) % 7;
  return addDays(day, -diff);
}

function rangeDays(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Agenda multi-vista tipo Google Calendar (`sirem-agenda`).
 *
 * Compuesta por tres submódulos independientes y reutilizables:
 * - `sirem-agenda-nav`: Barra de navegación temporal y franja de días con scroll infinito.
 * - `sirem-agenda-mode-switcher`: Conmutador de vistas (`day`, `week`, `month`, `list`).
 * - `sirem-agenda-body`: Rejilla horaria, celdas de mes y listado con carga perezosa.
 *
 * ## Scroll infinito y carga perezosa
 * Tanto el navegador de días como el cuerpo de la agenda detectan desplazamientos
 * en sus límites para emitir eventos de carga (`lazyLoad`, `reachStart`, `reachEnd`).
 *
 * Uso:
 * ```html
 * <sirem-agenda
 *   [events]="citas"
 *   [(mode)]="vista"
 *   [(date)]="dia"
 *   sticky="both"
 *   (reachEnd)="cargarMasCitas()"
 *   (eventPressed)="abrir($event)"
 *   (slotPressed)="nuevaCita($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-agenda',
  standalone: true,
  imports: [SiremAgendaNav, SiremAgendaModeSwitcher, SiremAgendaBody],
  styleUrl: './sirem-agenda.scss',
  template: `
    <div
      class="sirem-agenda"
      [class.sirem-agenda--compact]="compact()"
      [style.--sirem-agenda-hour]="effectiveHourHeight() + 'px'"
      [style.--sirem-agenda-cell-h]="cellHeightCss()"
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
        <sirem-agenda-nav
          [date]="date()"
          (dateChange)="onDateChange($event)"
          [mode]="mode()"
          [events]="events()"
          [title]="title()"
          [subtitle]="subtitle()"
          [locale]="locale()"
          [weekStartsOn]="weekStartsOn()"
          [showChips]="false"
          [infiniteScroll]="infiniteScroll()"
          (dayPressed)="pickDay($event)"
          (reachStart)="onNavReachStart($event)"
          (reachEnd)="onNavReachEnd($event)"
          (lazyLoad)="onNavLazyLoad($event)"
        >
          <sirem-agenda-mode-switcher
            nav-actions
            [mode]="mode()"
            (modeChange)="setMode($event)"
            [modes]="availableModes()"
            [compact]="compact()"
          />
        </sirem-agenda-nav>
      </header>

      <sirem-agenda-body
        #daysHead
        [mode]="mode()"
        [date]="date()"
        [events]="events()"
        [locale]="locale()"
        [weekStartsOn]="weekStartsOn()"
        [startHour]="startHour()"
        [endHour]="endHour()"
        [hourHeight]="effectiveHourHeight()"
        [cellHeight]="cellHeight()"
        [maxPerDay]="maxPerDay()"
        [listDays]="listDays()"
        [now]="now()"
        [compact]="compact()"
        [showRail]="true"
        [stickyDays]="stickyDays()"
        [daysTop]="daysTop()"
        [daysSurface]="daysSurface()"
        [daysFilter]="daysFilter()"
        [daysStickyHeight]="daysStickyHeight()"
        [infiniteScroll]="infiniteScroll()"
        (eventPressed)="eventPressed.emit($event)"
        (slotPressed)="slotPressed.emit($event)"
        (dayPressed)="pickDay($event)"
        (modeChange)="setMode($event)"
        (reachStart)="onBodyReachStart($event)"
        (reachEnd)="onBodyReachEnd($event)"
        (lazyLoad)="onBodyLazyLoad($event)"
      />
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
  /** Altura de las celdas (en px o unidad CSS, ej. 96, '6rem', '120px'). Aplica al mes y a la rejilla horaria. */
  readonly cellHeight = input<number | string | null>(null);
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
  /** Activa la carga perezosa y scroll infinito. */
  readonly infiniteScroll = input(true);

  /** Evento pulsado (original, sin normalizar). */
  readonly eventPressed = output<SiremAgendaEvent>();
  /** Hueco de la rejilla pulsado. */
  readonly slotPressed = output<SiremAgendaSlot>();
  /** Día elegido por el usuario. */
  readonly dayPressed = output<Date>();
  /** Se emite cuando el scroll llega al límite final. */
  readonly reachEnd = output<{ date?: Date }>();
  /** Se emite cuando el scroll llega al límite inicial. */
  readonly reachStart = output<{ date?: Date }>();
  /** Solicitud de carga perezosa unificada. */
  readonly lazyLoad = output<SiremAgendaLazyLoadEvent>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly barRef = viewChild<ElementRef<HTMLElement>>('bar');
  private readonly daysRef = viewChild<ElementRef<HTMLElement>>('daysHead');
  private readonly barHeight = signal(0);
  private readonly barStuckState = signal(false);
  private readonly daysStuckState = signal(false);
  private readonly narrow = signal(false);
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

  private readonly barStackHeight = computed(() =>
    this.toolbarStickyHeight() > 0 ? this.toolbarStickyHeight() : this.barHeight(),
  );

  readonly daysTop = computed(() => {
    const base = this.stickyOffset();
    if (!this.stickyToolbar()) return base;
    const extra = this.barStackHeight() + this.stickyGap();
    return extra > 0 ? `calc(${base} + ${extra}px)` : base;
  });

  readonly barSurface = computed(() =>
    this.pickSurface(this.toolbarBackground(), this.toolbarBackgroundStuck(), this.barStuck()),
  );

  readonly barFilter = computed(() =>
    blurFilter(this.pickBlur(this.toolbarBlur(), this.toolbarBlurStuck(), this.barStuck())),
  );

  readonly daysSurface = computed(() =>
    this.pickSurface(this.daysBackground(), this.daysBackgroundStuck(), this.daysStuck()),
  );

  readonly daysFilter = computed(() =>
    blurFilter(this.pickBlur(this.daysBlur(), this.daysBlurStuck(), this.daysStuck())),
  );

  readonly compact = computed(() => this.responsive() && this.narrow());
  readonly selected = computed(() => startOfDay(this.date()));

  readonly effectiveHourHeight = computed(() => {
    const ch = this.cellHeight();
    if (typeof ch === 'number' && this.hourHeight() === 64) {
      return ch;
    }
    return this.hourHeight();
  });

  readonly cellHeightCss = computed<string | null>(() => {
    const ch = this.cellHeight();
    if (ch === null || ch === undefined) return null;
    return typeof ch === 'number' ? `${ch}px` : String(ch);
  });
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

  readonly title = computed(() => {
    const dtf = (opts: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(this.locale(), opts);
    switch (this.mode()) {
      case 'day':
        return capitalize(
          dtf({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
            this.selected(),
          ),
        );
      case 'week': {
        const diff = (this.selected().getDay() - this.weekStartsOn() + 7) % 7;
        const first = addDays(this.selected(), -diff);
        const last = addDays(first, 6);
        const start =
          first.getMonth() === last.getMonth()
            ? String(first.getDate())
            : capitalize(dtf({ day: 'numeric', month: 'short' }).format(first));
        const end = capitalize(
          dtf({ day: 'numeric', month: 'long', year: 'numeric' }).format(last),
        );
        return `${start} – ${end}`;
      }
      case 'month':
        return capitalize(dtf({ month: 'long', year: 'numeric' }).format(this.selected()));
      default:
        return 'Agenda';
    }
  });

  readonly subtitle = computed(() => {
    const count = this.events().length;
    if (count === 0) return 'Sin eventos';
    return count === 1 ? '1 evento' : `${count} eventos`;
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

    effect(() => {
      const modes = this.availableModes();
      if (!modes.includes(this.mode())) this.mode.set(modes[0]);
    });
  }

  pxOrNull(value: number): string | null {
    return value > 0 ? `${value}px` : null;
  }

  private pickSurface(normal: string, stuck: string, isStuck: boolean): string | null {
    const value = isStuck ? stuck || normal : normal;
    return value || null;
  }

  private pickBlur(normal: number | null, stuck: number | null, isStuck: boolean): number | null {
    return isStuck ? (stuck ?? normal) : normal;
  }

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

  setMode(value: string | null): void {
    if (!value) return;
    const mode = value as SiremAgendaMode;
    if (mode !== this.mode()) this.mode.set(mode);
  }

  pickDay(day: Date): void {
    const next = startOfDay(day);
    this.date.set(next);
    this.dayPressed.emit(next);
  }

  onDateChange(next: Date): void {
    this.date.set(next);
  }

  onNavReachStart(range: SiremAgendaDateRange): void {
    this.reachStart.emit({ date: range.start });
  }

  onNavReachEnd(range: SiremAgendaDateRange): void {
    this.reachEnd.emit({ date: range.end });
  }

  onNavLazyLoad(event: SiremAgendaLazyLoadEvent): void {
    this.lazyLoad.emit(event);
  }

  onBodyReachStart(event: { date: Date }): void {
    this.reachStart.emit(event);
  }

  onBodyReachEnd(event: { date: Date }): void {
    this.reachEnd.emit(event);
  }

  onBodyLazyLoad(event: SiremAgendaLazyLoadEvent): void {
    this.lazyLoad.emit(event);
  }
}
