import { Component, input, linkedSignal, model, signal } from '@angular/core';
import { SiremCalendar } from '../../schedule/calendar/sirem-calendar';
import {
  SiremMaskDirective,
  type SiremMaskPattern,
} from '../../directives/mask/sirem-mask.directive';

/**
 * Campo de fecha con calendario emergente (valor ISO `yyyy-MM-dd`).
 * Muestra la fecha en formato local, admite escritura manual con máscara
 * (`dd/mm/aaaa` o personalizada) y sitúa automáticamente el calendario en la fecha válida.
 *
 * Uso:
 * ```html
 * <sirem-date-field label="Nacimiento" [(value)]="nace" />
 * ```
 */
@Component({
  selector: 'sirem-date-field',
  standalone: true,
  imports: [SiremCalendar, SiremMaskDirective],
  styleUrl: './sirem-date.scss',
  template: `
    <div class="sirem-field">
      @if (label()) {
        <span class="sirem-field__label">
          {{ label() }}
          @if (required()) {
            <span class="sirem-field__required" aria-hidden="true">*</span>
          }
        </span>
      }
      <div class="sirem-date__wrap" (focusout)="onBoxBlur()" (keydown.enter)="commitBox(); close()">
        <input
          [siremMask]="mask()"
          [value]="box()"
          (input)="onBoxInput($event)"
          (maskedChange)="onMaskedChange($event)"
          (focus)="toggle(true)"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.min]="min() ?? null"
          [attr.max]="max() ?? null"
          [attr.aria-label]="label() || placeholder()"
          [attr.aria-invalid]="invalid()"
          [attr.aria-expanded]="open()"
          inputmode="numeric"
          [class]="boxClass()"
        />
        <button
          type="button"
          (mousedown)="$event.preventDefault()"
          (click)="toggle()"
          [disabled]="disabled()"
          aria-label="Abrir calendario"
          [attr.aria-expanded]="open()"
          title="Abrir calendario"
          class="sirem-date__toggle"
        >
          <i class="fi fi-rr-calendar" aria-hidden="true"></i>
        </button>

        @if (open()) {
          <div class="sirem-date__backdrop" (click)="close()" aria-hidden="true"></div>
          <div class="sirem-date__popup">
            <sirem-calendar
              size="small"
              [selected]="value()"
              (dayPressed)="chooseDay($event)"
            />
          </div>
        }
      </div>
      @if (hint() && !error() && !dateError()) {
        <span class="sirem-field__hint">{{ hint() }}</span>
      }
    </div>
  `,
})
export class SiremDate {
  /** Fecha en ISO `yyyy-MM-dd`. */
  readonly value = model<string | null>(null);
  /** Etiqueta visible sobre el control. */
  readonly label = input('');
  /** Máscara de entrada para la fecha manual (por defecto '00/00/0000'). */
  readonly mask = input<SiremMaskPattern | null>('00/00/0000');
  /** Texto de ayuda cuando no hay fecha (`dd/mm/aaaa`). */
  readonly placeholder = input('dd/mm/aaaa');
  /** Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay. */
  readonly hint = input('');
  /** Mensaje de error. Con texto, el campo se marca en rojo y se anuncia. */
  readonly error = input('');
  /** Fecha mínima seleccionable, en ISO `yyyy-MM-dd`. */
  readonly min = input<string | null>(null);
  /** Fecha máxima seleccionable, en ISO `yyyy-MM-dd`. */
  readonly max = input<string | null>(null);
  /** Marca el campo como obligatorio (`aria-required` e indicador visual). */
  readonly required = input(false);
  /** Deshabilita el control: no se puede enfocar ni editar. */
  readonly disabled = input(false);

  readonly open = signal(false);
  readonly dateError = signal('');
  /** Texto de la caja; se resincroniza solo cuando cambia `value`. */
  readonly box = linkedSignal(() => formatIso(this.value()));

  toggle(force?: boolean): void {
    if (this.disabled()) return;
    this.open.update((v) => (force === undefined ? !v : force));
  }

  close(): void {
    this.open.set(false);
  }

  boxClass(): string {
    return `sirem-field__box sirem-date${this.invalid() ? ' sirem-field__box--error' : ''}`;
  }

  invalid(): boolean {
    return !!this.error() || !!this.dateError();
  }

  onMaskedChange(v: string): void {
    this.onBox(v);
  }

  onBox(v: string): void {
    this.box.set(v);
    const raw = v.trim();
    if (!raw) {
      this.value.set(null);
      this.dateError.set('');
      return;
    }
    const iso = parseDate(raw);
    if (iso && this.inRange(iso)) {
      this.dateError.set('');
      this.value.set(iso);
    }
  }

  onBoxInput(event: Event): void {
    this.onBox((event.target as HTMLInputElement).value);
  }

  onBoxBlur(): void {
    this.commitBox();
  }

  commitBox(): void {
    const raw = this.box().trim();
    if (!raw) {
      this.value.set(null);
      this.dateError.set('');
      return;
    }
    const iso = parseDate(raw);
    if (!iso) {
      this.dateError.set('Fecha inválida. Usa dd/mm/aaaa.');
      return;
    }
    if (!this.inRange(iso)) {
      this.dateError.set('Fecha fuera del rango permitido.');
      return;
    }
    this.dateError.set('');
    this.value.set(iso);
  }

  chooseDay(iso: string): void {
    if (!this.inRange(iso)) {
      this.dateError.set('Fecha fuera del rango permitido.');
      return;
    }
    this.dateError.set('');
    this.value.set(iso);
    this.close();
  }

  private inRange(iso: string): boolean {
    if (this.min() && iso < this.min()!) return false;
    if (this.max() && iso > this.max()!) return false;
    return true;
  }
}

function formatIso(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function parseDate(raw: string): string | null {
  let y: number, m: number, d: number;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  const lat = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (iso) {
    y = Number(iso[1]);
    m = Number(iso[2]);
    d = Number(iso[3]);
  } else if (lat) {
    d = Number(lat[1]);
    m = Number(lat[2]);
    y = Number(lat[3]);
  } else {
    return null;
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
