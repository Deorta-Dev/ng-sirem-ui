import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SiremDateChip } from '../../data-display/date-chip/sirem-date-chip';
import type {
  SiremAgendaEvent,
  SiremAgendaItem,
  SiremAgendaLazyLoadEvent,
  SiremAgendaListGroup,
  SiremAgendaMode,
  SiremAgendaMonthCell,
  SiremAgendaPlaced,
  SiremAgendaSlot,
} from './sirem-agenda-types';

const MINUTE_MS = 60_000;

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

/**
 * Cuerpo principal multi-vista de la agenda (`sirem-agenda-body`).
 *
 * Renderiza la vista activa (`day`, `week`, `month`, `list`) con posicionamiento
 * automático de eventos por hora, solapes en columnas e indicador de la hora actual.
 *
 * ## Scroll infinito y carga perezosa
 * En modos con desplazamiento (como `list` o cuando se activa `scrollable`),
 * detecta la proximidad a los extremos superior e inferior para cargar más datos
 * perezosamente emitiendo:
 * - `reachEnd`: el usuario ha hecho scroll cerca del final.
 * - `reachStart`: el usuario ha hecho scroll cerca del principio.
 * - `lazyLoad`: evento estructurado con dirección `'prev'` o `'next'`.
 * - `scrollNearBottom` / `scrollNearTop`: avisos complementarios de posición.
 *
 * Uso:
 * ```html
 * <sirem-agenda-body
 *   [mode]="vista"
 *   [date]="dia"
 *   [events]="citas"
 *   (reachEnd)="cargarMasCitas()"
 *   (eventPressed)="abrirDetalle($event)"
 *   (slotPressed)="crearCita($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-agenda-body',
  standalone: true,
  imports: [SiremDateChip],
  styleUrl: './sirem-agenda-body.scss',
  template: `
    <div
      class="sirem-agenda-body"
      #bodyContainer
      [class.sirem-agenda-body--compact]="compact()"
      [class.sirem-agenda-body--scrollable]="scrollable()"
      [style.max-height]="maxHeight()"
      [style.--sirem-agenda-hour]="effectiveHourHeight() + 'px'"
      [style.--sirem-agenda-cell-h]="cellHeightCss()"
      [style.--sirem-agenda-cols]="visibleDays().length"
      [style.--sirem-agenda-days-top]="daysTop()"
      [style.--sirem-agenda-days-bg]="daysSurface()"
      [style.--sirem-agenda-days-filter]="daysFilter()"
      [style.--sirem-agenda-days-h]="daysStickyHeight() > 0 ? daysStickyHeight() + 'px' : null"
      (scroll)="onContainerScroll($event)"
    >
      @switch (mode()) {
        @case ('month') {
          <div class="sirem-agenda__month">
            <div
              class="sirem-agenda__weekhead"
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
                No hay eventos en los próximos {{ effectiveListDays() }} días.
              </p>
            }
            @for (group of listGroups(); track group.key) {
              <div class="sirem-agenda__group">
                <header
                  class="sirem-agenda__group-head"
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
            @if (mode() === 'day' && showRail()) {
              <div
                class="sirem-agenda__rail"
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
export class SiremAgendaBody {
  /** Vista activa (`day`, `week`, `month`, `list`). */
  readonly mode = input<SiremAgendaMode>('week');
  /** Fecha central enfocada. */
  readonly date = input<Date>(new Date());
  /** Eventos a posicionar en la agenda. */
  readonly events = input<SiremAgendaEvent[]>([]);
  /** Idioma de rótulos. */
  readonly locale = input('es-ES');
  /** Primer día de la semana (`1` = lunes). */
  readonly weekStartsOn = input<0 | 1>(1);
  /** Primera hora visible de la rejilla horaria. */
  readonly startHour = input(7);
  /** Hora final de la rejilla (exclusiva). */
  readonly endHour = input(21);
  /** Alto en px de cada hora en la rejilla. */
  readonly hourHeight = input(64);
  /** Altura de las celdas (en px o unidad CSS, ej. 96, '6rem', '120px'). Aplica a las celdas del mes y a la rejilla horaria. */
  readonly cellHeight = input<number | string | null>(null);
  /** Máximo de eventos visibles por día en el mes. */
  readonly maxPerDay = input(2);
  /** Días iniciales para la vista de lista. */
  readonly listDays = input(30);
  /** Reloj fijo opcional (para tests). */
  readonly now = input<Date | null>(null);
  /** Modo compacto para anchos estrechos. */
  readonly compact = input(false);
  /** Muestra el riel de chips en la vista de día cuando no se use un nav externo. */
  readonly showRail = input(false);
  /** Envoltura desplazable con scroll interno. */
  readonly scrollable = input(false);
  /** Alto máximo cuando `scrollable` es true. */
  readonly maxHeight = input<string | null>(null);
  /** Habilita la detección de scroll infinito para carga perezosa. */
  readonly infiniteScroll = input(true);
  /** Umbral en px para disparar la carga perezosa. */
  readonly threshold = input(100);
  /** Auto-amplía los días visibles de la lista al llegar al final. */
  readonly autoExtendList = input(true);

  // Propiedades sticky heredables
  readonly stickyDays = input(false);
  readonly daysTop = input('0px');
  readonly daysSurface = input<string | null>(null);
  readonly daysFilter = input<string | null>(null);
  readonly daysStickyHeight = input(0);

  /** Evento pulsado. */
  readonly eventPressed = output<SiremAgendaEvent>();
  /** Hueco horario pulsado. */
  readonly slotPressed = output<SiremAgendaSlot>();
  /** Día seleccionado al pulsar una celda o chip. */
  readonly dayPressed = output<Date>();
  /** Se emite cuando se necesita cambiar de modo (ej. al abrir un día desde el mes). */
  readonly modeChange = output<SiremAgendaMode>();
  /** Se emite al llegar cerca del final del scroll. */
  readonly reachEnd = output<{ date: Date }>();
  /** Se emite al llegar cerca del inicio del scroll. */
  readonly reachStart = output<{ date: Date }>();
  /** Solicitud de carga perezosa de datos. */
  readonly lazyLoad = output<SiremAgendaLazyLoadEvent>();
  /** Notificación de scroll próximo al fondo. */
  readonly scrollNearBottom = output<void>();
  /** Notificación de scroll próximo al tope. */
  readonly scrollNearTop = output<void>();

  private readonly bodyRef = viewChild<ElementRef<HTMLElement>>('bodyContainer');
  private readonly formatters = new Map<string, Intl.DateTimeFormat>();
  private readonly clock = signal(new Date());

  /** Días dinámicos que abarca la lista (crece con lazy loading). */
  readonly extendedDays = signal(0);
  readonly effectiveListDays = computed(() => this.listDays() + this.extendedDays());

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

  private readonly nowValue = computed(() => this.now() ?? this.clock());
  readonly today = computed(() => startOfDay(this.nowValue()));
  readonly selected = computed(() => startOfDay(this.date()));
  readonly weekDays = computed(() =>
    rangeDays(startOfWeek(this.selected(), this.weekStartsOn()), 7),
  );
  readonly visibleDays = computed(() =>
    this.mode() === 'day' ? [this.selected()] : this.weekDays(),
  );

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

  readonly window = computed(() => {
    const from = this.startHour() * 60;
    const hours = Math.max(1, this.endHour() - this.startHour());
    return { from, to: from + hours * 60 };
  });

  readonly bodyHeight = computed(
    () => ((this.window().to - this.window().from) / 60) * this.effectiveHourHeight(),
  );

  readonly hourLabels = computed<{ hour: number; label: string }[]>(() => {
    const { from, to } = this.window();
    const format = this.dtf({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const labels: { hour: number; label: string }[] = [];
    for (let minute = from; minute < to; minute += 60) {
      labels.push({ hour: minute / 60, label: format.format(new Date(2000, 0, 1, 0, minute)) });
    }
    return labels;
  });

  readonly layout = computed<Map<string, SiremAgendaPlaced[]>>(() => {
    const { from, to } = this.window();
    const height = this.effectiveHourHeight();
    const map = new Map<string, SiremAgendaPlaced[]>();
    for (const day of this.visibleDays()) {
      const key = dayKey(day);
      map.set(key, this.place(this.byDay().get(key) ?? [], day, from, to, height));
    }
    return map;
  });

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

  readonly listGroups = computed<SiremAgendaListGroup[]>(() => {
    const groups: SiremAgendaListGroup[] = [];
    const start = this.selected();
    const totalDays = this.effectiveListDays();
    for (let index = 0; index < totalDays; index += 1) {
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

  readonly weekdayLabels = computed(() =>
    rangeDays(startOfWeek(this.selected(), this.weekStartsOn()), 7).map((day) =>
      this.weekdayNarrow(day),
    ),
  );

  readonly nowTop = computed<number | null>(() => {
    if (!this.visibleDays().some((day) => sameDay(day, this.today()))) return null;
    const now = this.nowValue();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const { from, to } = this.window();
    if (minutes < from || minutes > to) return null;
    return ((minutes - from) / 60) * this.effectiveHourHeight();
  });

  onContainerScroll(event: Event): void {
    if (!this.infiniteScroll()) return;
    const el = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const threshold = this.threshold();

    if (scrollTop <= threshold) {
      this.scrollNearTop.emit();
      this.reachStart.emit({ date: this.selected() });
      this.lazyLoad.emit({ direction: 'prev', date: this.selected() });
    } else if (scrollTop + clientHeight >= scrollHeight - threshold) {
      this.scrollNearBottom.emit();
      const lastDate = addDays(this.selected(), this.effectiveListDays());
      this.reachEnd.emit({ date: lastDate });
      this.lazyLoad.emit({ direction: 'next', date: lastDate });

      if (this.mode() === 'list' && this.autoExtendList()) {
        this.extendedDays.update((n) => n + 15);
      }
    }
  }

  pickDay(day: Date): void {
    const next = startOfDay(day);
    this.dayPressed.emit(next);
  }

  openDay(day: Date): void {
    this.pickDay(day);
    this.modeChange.emit('day');
  }

  onColumnClick(event: MouseEvent, day: Date): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const offset = event.clientY - rect.top;
    const { from, to } = this.window();
    const raw = from + (offset / Math.max(1, this.effectiveHourHeight())) * 60;
    const snapped = Math.min(to, Math.max(from, Math.round(raw / 15) * 15));
    this.pickDay(day);
    this.slotPressed.emit({
      date: startOfDay(day),
      hour: Math.floor(snapped / 60),
      minute: snapped % 60,
    });
  }

  pressEvent(item: SiremAgendaItem, event?: Event): void {
    event?.stopPropagation();
    this.eventPressed.emit(item.source);
  }

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

  private dtf(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${this.locale()}|${JSON.stringify(options)}`;
    const cached = this.formatters.get(key);
    if (cached) return cached;
    const format = new Intl.DateTimeFormat(this.locale(), options);
    this.formatters.set(key, format);
    return format;
  }
}
