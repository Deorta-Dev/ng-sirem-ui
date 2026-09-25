import { Component, input, model, output } from '@angular/core';
import { SiremAvatar } from '../avatar/sirem-avatar';
import { SiremBadge, SiremBadgeTone } from '../badge/sirem-badge';

/** Campo extra de la tarjeta (filas clave → valor). */
export interface SiremCardListField {
  key: string;
  label?: string;
  /** Clase CSS del icono (p. ej. `fi fi-rr-phone`). */
  icon?: string;
}

export type SiremCardListAvatar = string | { name: string; src?: string | null };

/**
 * Lista de tarjetas: alternativa visual a la tabla para
 * registros con varios datos (pacientes, facturas, equipos…).
 *
 * Uso:
 * ```html
 * <sirem-card-list
 *   [items]="pacientes"
 *   titleKey="nombre"
 *   subtitleKey="doc"
 *   badgeKey="estado"
 *   [fields]="[{ key: 'tel', label: 'Teléfono', icon: 'fi fi-rr-phone' }]"
 *   (itemPressed)="ver($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-card-list',
  standalone: true,
  imports: [SiremAvatar, SiremBadge],
  styleUrl: './sirem-card-list.scss',
  template: `
    <div class="sirem-cards" [style.--sirem-cards-min]="minWidth()">
      @for (item of items(); track trackBy(item, $index)) {
        <article
          class="sirem-cards__card"
          [class.sirem-cards__card--clickable]="rowClickable()"
          [class.sirem-cards__card--selected]="isSelected(item)"
          (click)="onCard(item)"
          (keydown.enter)="onCard(item)"
          [attr.tabindex]="rowClickable() ? 0 : null"
          role="article"
        >
          <div class="sirem-cards__head">
            @if (avatarOf(item); as av) {
              <sirem-avatar [name]="av.name" [src]="av.src ?? null" size="sm" />
            }
            <div class="sirem-cards__titles">
              <h3 class="sirem-cards__title">{{ item[titleKey()] }}</h3>
              @if (subtitleOf(item) !== null) {
                <p class="sirem-cards__subtitle">{{ subtitleOf(item) }}</p>
              }
            </div>
            @if (badgeOf(item) !== null) {
              <sirem-badge [tone]="badgeTone(badgeOf(item))">
                {{ badgeOf(item) }}
              </sirem-badge>
            }
          </div>
          @if (fields().length) {
            <dl class="sirem-cards__fields">
              @for (f of fields(); track f.key) {
                <div class="sirem-cards__field">
                  @if (f.icon) {
                    <i [class]="f.icon + ' sirem-cards__field-icon'" aria-hidden="true"></i>
                  }
                  @if (f.label) {
                    <dt class="sirem-cards__field-label">{{ f.label }}</dt>
                  }
                  <dd class="sirem-cards__field-value">{{ item[f.key] ?? '—' }}</dd>
                </div>
              }
            </dl>
          }
          <ng-content />
        </article>
      } @empty {
        <p class="sirem-cards__empty">{{ emptyText() }}</p>
      }
    </div>
  `,
})
export class SiremCardList {
  readonly items = input.required<Record<string, unknown>[]>();
  /** Clave del título de cada tarjeta. */
  readonly titleKey = input('title');
  readonly subtitleKey = input<string | null>(null);
  readonly badgeKey = input<string | null>(null);
  readonly badgeTones = input<Record<string, SiremBadgeTone>>({});
  /** Clave con el nombre (o `{ name, src }`) para el avatar. */
  readonly avatarKey = input<string | null>(null);
  /** Filas extra clave → valor. */
  readonly fields = input<SiremCardListField[]>([]);
  /** Ancho mínimo de cada tarjeta (define las columnas). */
  readonly minWidth = input('17rem');
  readonly rowClickable = input(true);
  readonly selectable = input(false);
  /** Índices seleccionados. */
  readonly selection = model<number[]>([]);
  readonly emptyText = input('Sin registros.');

  readonly itemPressed = output<Record<string, unknown>>();

  trackBy(item: Record<string, unknown>, index: number): unknown {
    return (item['id'] as unknown) ?? index;
  }

  avatarOf(item: Record<string, unknown>): { name: string; src?: string | null } | null {
    const key = this.avatarKey();
    if (!key) return null;
    const v = item[key] as SiremCardListAvatar | null | undefined;
    if (!v) return null;
    if (typeof v === 'string') return { name: v };
    return { name: v.name, src: v.src ?? null };
  }

  badgeTone(value: unknown): SiremBadgeTone {
    return this.badgeTones()[String(value)] ?? 'neutral';
  }

  subtitleOf(item: Record<string, unknown>): unknown {
    const key = this.subtitleKey();
    if (!key) return null;
    const v = item[key];
    return v === null || v === undefined || v === '' ? null : v;
  }

  badgeOf(item: Record<string, unknown>): unknown {
    const key = this.badgeKey();
    if (!key) return null;
    const v = item[key];
    return v === null || v === undefined || v === '' ? null : v;
  }

  isSelected(item: Record<string, unknown>): boolean {
    return this.selection().includes(this.items().indexOf(item));
  }

  onCard(item: Record<string, unknown>): void {
    if (this.selectable()) {
      const i = this.items().indexOf(item);
      this.selection.update((sel) =>
        sel.includes(i) ? sel.filter((s) => s !== i) : [...sel, i],
      );
    }
    if (this.rowClickable()) this.itemPressed.emit(item);
  }
}
