import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

/** Opción del control segmentado. */
export interface SiremSegmentedItem {
  value: string;
  label: string;
  /** Clase CSS de icono opcional (p. ej. `fi fi-rr-grid`). */
  icon?: string;
  /** Texto pequeño bajo la etiqueta (p. ej. la fecha en un selector de día). */
  hint?: string;
}

export type SiremSegmentedSize = 'sm' | 'md' | 'lg';

/** Vistas rápidas del preset Tabla ⇄ Tarjetas. */
export type SiremViewMode = 'table' | 'cards';

/** Preset por defecto: el switch Tabla ⇄ Tarjetas (cuando no hay `items`). */
const VIEW_PRESET: SiremSegmentedItem[] = [
  { value: 'table', label: 'Tabla', icon: 'fi fi-rr-table-list' },
  { value: 'cards', label: 'Tarjetas', icon: 'fi fi-rr-grid' },
];

/** Caja de la ficha activa, relativa al grupo (border box). */
interface SiremSegmentedThumb {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Control segmentado de pastillas (referencia Bento): un grupo de opciones
 * excluyentes donde la activa se resalta con una ficha que **se desliza**
 * hasta la opción elegida.
 *
 * - **Sin `items`** es el switch fijo **Tabla ⇄ Tarjetas** (`SiremViewMode`),
 *   el que acompaña a `sirem-data-table` / `sirem-card-list`.
 * - Con `items` sirve para cualquier conjunto de opciones excluyentes
 *   (divisas, días, vistas de agenda…), con `icon` y `hint` opcionales.
 * - `tone="accent"` pinta la ficha con el acento lima.
 * - `size` (`sm` / `md` / `lg`) ajusta alto y tipografía.
 * - `stretch` reparte las opciones a lo ancho del contenedor.
 * - Doble vía con `[(value)]`; la primera opción queda activa si `value` es
 *   `null` o no está entre las opciones (el grupo nunca queda sin estado).
 *
 * Sustituye a `sirem-view-toggle` (eliminado): su switch Tabla/Tarjetas es
 * ahora el preset por defecto de este componente.
 *
 * Uso:
 * ```html
 * <sirem-segmented [(value)]="vista" ariaLabel="Cambiar vista" />
 * <sirem-segmented [items]="divisas" [(value)]="divisa" ariaLabel="Divisa" />
 * <sirem-segmented size="lg" tone="accent" [items]="dias" [(value)]="dia" />
 * ```
 */
@Component({
  selector: 'sirem-segmented',
  standalone: true,
  styleUrl: './sirem-segmented.scss',
  template: `
    <div
      #group
      class="sirem-seg"
      [class.sirem-seg--accent]="tone() === 'accent'"
      [class.sirem-seg--sm]="size() === 'sm'"
      [class.sirem-seg--lg]="size() === 'lg'"
      [class.sirem-seg--stretch]="stretch()"
      role="group"
      [attr.aria-label]="resolvedLabel()"
    >
      @if (thumb(); as box) {
        <span
          class="sirem-seg__thumb"
          aria-hidden="true"
          [class.sirem-seg__thumb--accent]="tone() === 'accent'"
          [style.transform]="'translate(' + box.x + 'px, ' + box.y + 'px)'"
          [style.width.px]="box.width"
          [style.height.px]="box.height"
        ></span>
      }
      @for (item of entries(); track item.value) {
        <button
          #segBtn
          type="button"
          class="sirem-seg__item"
          [class.sirem-seg__item--active]="isActive(item.value)"
          [attr.aria-pressed]="isActive(item.value)"
          (click)="select(item.value)"
        >
          @if (item.icon) {
            <i [class]="item.icon" aria-hidden="true"></i>
          }
          <span class="sirem-seg__text">
            <span class="sirem-seg__label">{{ item.label }}</span>
            @if (item.hint) {
              <span class="sirem-seg__hint">{{ item.hint }}</span>
            }
          </span>
        </button>
      }
    </div>
  `,
})
export class SiremSegmented implements AfterViewInit {
  /**
   * Opciones a mostrar. Con `null` (defecto) el control es el switch fijo
   * **Tabla ⇄ Tarjetas** (`table` / `cards`).
   */
  readonly items = input<SiremSegmentedItem[] | null>(null);
  /** Valor activo (doble vía). */
  readonly value = model<string | null>(null);
  /** Alto del control: `sm`, `md` (defecto) o `lg`. */
  readonly size = input<SiremSegmentedSize>('md');
  /** `accent` pinta la ficha activa con el acento lima. */
  readonly tone = input<'default' | 'accent'>('default');
  /** Ocupa el 100 % del ancho, repartiendo las opciones. */
  readonly stretch = input(false);
  /** Nombre accesible del grupo de botones. */
  readonly ariaLabel = input<string | null>(null);

  /** Opciones efectivas: las de `items` o el preset Tabla ⇄ Tarjetas. */
  readonly entries = computed(() => this.items() ?? VIEW_PRESET);

  /** Nombre accesible: el indicado o el del preset (solo hay uno por defecto). */
  readonly resolvedLabel = computed(
    () => this.ariaLabel() ?? (this.items() ? null : 'Cambiar vista'),
  );

  private readonly group = viewChild<ElementRef<HTMLElement>>('group');
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('segBtn');

  /** Posición y tamaño de la ficha; `null` hasta la primera medición. */
  private readonly box = signal<SiremSegmentedThumb | null>(null);
  protected readonly thumb = this.box.asReadonly();

  private frame = 0;
  private observer: ResizeObserver | null = null;

  constructor() {
    // Recoloca la ficha cuando cambia el valor, las opciones, el tamaño o el
    // reparto. Se hace en el siguiente frame: el DOM ya tiene las medidas.
    effect(() => {
      this.value();
      this.entries();
      this.size();
      this.stretch();
      this.schedule();
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this.frame);
      this.observer?.disconnect();
      this.observer = null;
    });
  }

  ngAfterViewInit(): void {
    // Medición síncrona (antes del primer pintado) para que la ficha no
    // aparezca deslizándose desde la esquina.
    this.sync();
    const group = this.group()?.nativeElement;
    if (group && typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => this.schedule());
      this.observer.observe(group);
    }
  }

  /** La primera opción hace de activa por defecto (o si el valor no existe). */
  isActive(value: string): boolean {
    const entries = this.entries();
    const current = this.value();
    if (current === null || !entries.some((entry) => entry.value === current)) {
      return entries[0]?.value === value;
    }
    return current === value;
  }

  select(value: string): void {
    this.value.set(value);
    this.schedule();
  }

  private schedule(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.sync();
    });
  }

  /** Mide la opción activa y mueve la ficha hasta ella. */
  private sync(): void {
    const group = this.group()?.nativeElement;
    if (!group) return;
    const entries = this.entries();
    const index = entries.findIndex((entry) => this.isActive(entry.value));
    const host = this.buttons()[index]?.nativeElement;
    if (!host) return;

    const groupRect = group.getBoundingClientRect();
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const next: SiremSegmentedThumb = {
      x: rect.left - groupRect.left,
      y: rect.top - groupRect.top,
      width: rect.width,
      height: rect.height,
    };
    const current = this.box();
    if (
      current &&
      current.x === next.x &&
      current.y === next.y &&
      current.width === next.width &&
      current.height === next.height
    ) {
      return;
    }
    this.box.set(next);
  }
}
