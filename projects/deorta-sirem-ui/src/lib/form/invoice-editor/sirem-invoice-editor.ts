import { Component, computed, input, model, output, signal } from '@angular/core';
import { SiremButton } from '../../button/sirem-button';
import { SiremBadge, SiremBadgeTone } from '../../data-display/badge/sirem-badge';
import { SiremMoneyPipe } from '../../pipes/money/sirem-money.pipe';
import { SiremDate } from '../date/sirem-date';
import { SiremInput } from '../input/sirem-input';
import { SiremSelectOption } from '../select/sirem-select';
import { SiremTextarea } from '../textarea/sirem-textarea';

/** Estado fiscal del documento. */
export type SiremInvoiceStatus = 'draft' | 'issued' | 'void';

/** Cliente / tercero que se factura. `value` es el id de tu dominio. */
export interface SiremInvoiceCustomer {
  value: string | number;
  label: string;
  /** NIT / CC / razón social secundaria. */
  taxId?: string;
}

/** Concepto (línea) de la factura. */
export interface SiremInvoiceLine {
  /** Identificador de la línea. */
  id: string;
  /** Concepto facturado. */
  description: string;
  /** Cantidad. */
  quantity: number;
  /** Precio unitario antes de impuestos. */
  unitPrice: number;
  /** Descuento por línea en porcentaje (0–100). */
  discount: number;
  /** Tarifa de IVA en porcentaje (0, 5, 19…). */
  taxRate: number;
}

/** Cabecera + conceptos de la factura (lo que edita y emite el componente). */
export interface SiremInvoiceDraft {
  /** Número de la factura. */
  number: string;
  /** Cliente elegido (`value` de `customers`). */
  customerId: string | number | null;
  /** Fecha de emisión `yyyy-mm-dd`. */
  issueDate: string;
  /** Fecha de vencimiento `yyyy-mm-dd`. */
  dueDate: string;
  /** Notas libres del pie. */
  notes: string;
  /** Líneas de la factura. */
  lines: SiremInvoiceLine[];
}

/** Agregado de una línea. */
export interface SiremInvoiceLineTotals {
  base: number;
  discount: number;
  tax: number;
  total: number;
}

/** Agregado de la factura completa. */
export interface SiremInvoiceTotals {
  items: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

let lineSeq = 0;

/** Crea una línea con valores por defecto (id único para `@for track`). */
export function siremInvoiceLine(partial: Partial<SiremInvoiceLine> = {}): SiremInvoiceLine {
  return {
    id: `line-${++lineSeq}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 19,
    ...partial,
  };
}

/** Factura vacía lista para crear (una línea en blanco). */
export function siremEmptyInvoice(number = ''): SiremInvoiceDraft {
  return {
    number,
    customerId: null,
    issueDate: '',
    dueDate: '',
    notes: '',
    lines: [siremInvoiceLine()],
  };
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Importes de una línea: base → descuento → IVA → total. */
export function siremLineTotals(line: SiremInvoiceLine): SiremInvoiceLineTotals {
  const base = round2(Math.max(0, num(line.quantity)) * Math.max(0, num(line.unitPrice)));
  const discount = round2(base * (Math.min(100, Math.max(0, num(line.discount))) / 100));
  const net = round2(base - discount);
  const tax = round2(net * (Math.max(0, num(line.taxRate)) / 100));
  return { base, discount, tax, total: round2(net + tax) };
}

const STATUS_LABELS: Record<SiremInvoiceStatus, string> = {
  draft: 'Borrador',
  issued: 'Transmitida',
  void: 'Anulada',
};

const STATUS_TONES: Record<SiremInvoiceStatus, SiremBadgeTone> = {
  draft: 'warning',
  issued: 'success',
  void: 'danger',
};

/**
 * Editor de factura de venta: cabecera (cliente, N°, fechas, notas),
 * conceptos editables con IVA y descuento por línea y resumen de totales.
 *
 * Selector: `sirem-invoice-editor`.
 *
 * - `[(draft)]`: estado completo (doble vía). Sin binding, gestiona su estado.
 * - `customers`: clientes para el select de la cabecera.
 * - `nextNumber`: correlativo sugerido al crear.
 * - `taxRates`: tarifas de IVA disponibles en cada línea (defecto 0/5/19).
 * - `currency`: código ISO para `siremMoney` (defecto `COP`).
 * - `status`: `draft` | `issued` | `void` (pastilla de estado).
 * - `loading`: bloquea el botón Guardar durante el guardado remoto.
 * - Salidas: `saved` (factura válida) y `cancelled` (se descartan cambios).
 *
 * Uso:
 * ```html
 * <sirem-invoice-editor
 *   [(draft)]="invoice"
 *   [customers]="clientes"
 *   nextNumber="FV-1043"
 *   (saved)="guardar($event)"
 *   (cancelled)="volver()"
 * />
 * ```
 */
@Component({
  selector: 'sirem-invoice-editor',
  standalone: true,
  imports: [
    SiremBadge,
    SiremButton,
    SiremDate,
    SiremInput,
    SiremMoneyPipe,
    SiremTextarea,
  ],
  styleUrl: './sirem-invoice-editor.scss',
  template: `
    <form class="sirem-invoice-editor" (submit)="onSubmit($event)" novalidate>
      <header class="sirem-invoice-editor__head">
        <div>
          <p class="sirem-invoice-editor__eyebrow">Factura de venta</p>
          <div class="sirem-invoice-editor__ident">
            <span class="sirem-invoice-editor__number">{{ draft().number || 'Sin número' }}</span>
            <sirem-badge [tone]="statusTone()" [label]="statusLabel()">
              {{ statusLabel() }}
            </sirem-badge>
          </div>
        </div>

        @if (selectedCustomer(); as customer) {
          <div class="sirem-invoice-editor__party">
            <span class="sirem-invoice-editor__party-name">{{ customer.label }}</span>
            @if (customer.taxId) {
              <span class="sirem-invoice-editor__party-doc">{{ customer.taxId }}</span>
            }
          </div>
        } @else {
          <p class="sirem-invoice-editor__party-empty">Cliente sin seleccionar.</p>
        }
      </header>

      <section class="sirem-invoice-editor__grid" aria-label="Cabecera de la factura">
        <div class="sirem-invoice-editor__field sirem-invoice-editor__field--6">
          <sirem-input-field
            label="Cliente"
            [required]="true"
            placeholder="Selecciona el cliente."
            [options]="customerOptions()"
            [strictOptions]="true"
            [value]="draft().customerId"
            (valueChange)="setCustomer($event)"
            [error]="err('customerId')"
          />
        </div>

        <div class="sirem-invoice-editor__field sirem-invoice-editor__field--3">
          <sirem-input-field
            label="N° documento"
            [required]="true"
            placeholder="FV-1043"
            [value]="draft().number"
            (valueChange)="setDocumentNumber($event)"
            [error]="err('number')"
          />
        </div>

        <div class="sirem-invoice-editor__field sirem-invoice-editor__field--3">
          <sirem-date-field
            label="Emisión"
            [required]="true"
            [value]="draft().issueDate"
            (valueChange)="setIssueDate($event)"
            [error]="err('issueDate')"
          />
        </div>

        <div class="sirem-invoice-editor__field sirem-invoice-editor__field--3">
          <sirem-date-field
            label="Vencimiento"
            [required]="true"
            [value]="draft().dueDate"
            (valueChange)="setDueDate($event)"
            [error]="err('dueDate')"
          />
        </div>

        <div class="sirem-invoice-editor__field sirem-invoice-editor__field--9">
          <sirem-textarea-field
            label="Notas"
            [rows]="2"
            placeholder="Condiciones de pago, referencia del pedido…"
            [value]="draft().notes"
            (valueChange)="setNotes($event)"
          />
        </div>
      </section>

      <section class="sirem-invoice-editor__lines" aria-label="Conceptos de la factura">
        <div class="sirem-invoice-editor__lines-head">
          <div>
            <h3 class="sirem-invoice-editor__subtitle">Conceptos</h3>
            <p class="sirem-invoice-editor__hint">
              {{ draft().lines.length }}
              @if (draft().lines.length === 1) { línea } @else { líneas } · IVA y descuento por
              concepto
            </p>
          </div>

          <sirem-button variant="secondary" size="sm" (pressed)="addLine()">
            <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
            Agregar concepto
          </sirem-button>
        </div>

        <div class="sirem-invoice-editor__table-wrap">
          <table class="sirem-invoice-editor__table">
            <thead>
              <tr>
                <th scope="col">Descripción</th>
                <th scope="col" class="sirem-invoice-editor__cell--num">Cantidad</th>
                <th scope="col" class="sirem-invoice-editor__cell--num">P. unitario</th>
                <th scope="col" class="sirem-invoice-editor__cell--num">Dto %</th>
                <th scope="col" class="sirem-invoice-editor__cell--num">IVA %</th>
                <th scope="col" class="sirem-invoice-editor__cell--num">Importe</th>
                <th scope="col" class="sirem-invoice-editor__cell--action">
                  <span class="sirem-visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>

            <tbody>
              @for (line of draft().lines; track line.id; let i = $index) {
                <tr>
                  <td>
                    <input
                      type="text"
                      class="sirem-field__box sirem-invoice-editor__input sirem-invoice-editor__input--desc"
                      [class.sirem-field__box--error]="!!err(line.id + ':description')"
                      [value]="line.description"
                      (input)="setDescription(line.id, $any($event.target).value)"
                      [attr.aria-label]="'Descripción del concepto ' + (i + 1)"
                      [attr.aria-invalid]="!!err(line.id + ':description') || null"
                      placeholder="Producto o servicio"
                    />
                    @if (err(line.id + ':description')) {
                      <span role="alert" class="sirem-invoice-editor__cell-error">
                        {{ err(line.id + ':description') }}
                      </span>
                    }
                  </td>

                  <td class="sirem-invoice-editor__cell--num">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputmode="numeric"
                      class="sirem-field__box sirem-invoice-editor__input sirem-invoice-editor__input--num"
                      [class.sirem-field__box--error]="!!err(line.id + ':quantity')"
                      [value]="line.quantity || ''"
                      (input)="setLineValue(line.id, 'quantity', $any($event.target).value)"
                      [attr.aria-label]="'Cantidad del concepto ' + (i + 1)"
                      [attr.aria-invalid]="!!err(line.id + ':quantity') || null"
                    />
                    @if (err(line.id + ':quantity')) {
                      <span role="alert" class="sirem-invoice-editor__cell-error">
                        {{ err(line.id + ':quantity') }}
                      </span>
                    }
                  </td>

                  <td class="sirem-invoice-editor__cell--num">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputmode="decimal"
                      class="sirem-field__box sirem-invoice-editor__input sirem-invoice-editor__input--num"
                      [class.sirem-field__box--error]="!!err(line.id + ':unitPrice')"
                      [value]="line.unitPrice || ''"
                      (input)="setLineValue(line.id, 'unitPrice', $any($event.target).value)"
                      [attr.aria-label]="'Precio unitario del concepto ' + (i + 1)"
                      [attr.aria-invalid]="!!err(line.id + ':unitPrice') || null"
                    />
                    @if (err(line.id + ':unitPrice')) {
                      <span role="alert" class="sirem-invoice-editor__cell-error">
                        {{ err(line.id + ':unitPrice') }}
                      </span>
                    }
                  </td>

                  <td class="sirem-invoice-editor__cell--num">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      inputmode="numeric"
                      class="sirem-field__box sirem-invoice-editor__input sirem-invoice-editor__input--num"
                      [class.sirem-field__box--error]="!!err(line.id + ':discount')"
                      [value]="line.discount || ''"
                      (input)="setLineValue(line.id, 'discount', $any($event.target).value)"
                      [attr.aria-label]="'Descuento porcentual del concepto ' + (i + 1)"
                      [attr.aria-invalid]="!!err(line.id + ':discount') || null"
                    />
                    @if (err(line.id + ':discount')) {
                      <span role="alert" class="sirem-invoice-editor__cell-error">
                        {{ err(line.id + ':discount') }}
                      </span>
                    }
                  </td>

                  <td class="sirem-invoice-editor__cell--num">
                    <select
                      class="sirem-field__box sirem-invoice-editor__input sirem-invoice-editor__input--num"
                      [value]="line.taxRate"
                      (change)="setLineTaxRate(line.id, $any($event.target).value)"
                      [attr.aria-label]="'IVA del concepto ' + (i + 1)"
                    >
                      @for (rate of taxRateOptions(); track rate.value) {
                        <option [value]="rate.value" [selected]="line.taxRate === rate.value">
                          {{ rate.label }}
                        </option>
                      }
                    </select>
                  </td>

                  <td class="sirem-invoice-editor__cell--num">
                    <span class="sirem-invoice-editor__money">
                      {{ lineTotal(line) | siremMoney : currency() }}
                    </span>
                  </td>

                  <td class="sirem-invoice-editor__cell--action">
                    <button
                      type="button"
                      class="sirem-invoice-editor__remove"
                      (click)="removeLine(line.id)"
                      [attr.aria-label]="'Eliminar el concepto ' + (i + 1)"
                      [disabled]="draft().lines.length === 1"
                    >
                      <i class="fi fi-rr-trash" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="sirem-invoice-editor__empty">
                    Sin conceptos todavía. Agrega el primero para facturar.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (err('lines')) {
          <p role="alert" class="sirem-invoice-editor__lines-error">{{ err('lines') }}</p>
        }
      </section>

      <footer class="sirem-invoice-editor__foot">
        <dl class="sirem-invoice-editor__totals">
          <div class="sirem-invoice-editor__total-row">
            <dt>Subtotal</dt>
            <dd>{{ totals().subtotal | siremMoney : currency() }}</dd>
          </div>
          <div class="sirem-invoice-editor__total-row">
            <dt>Descuentos</dt>
            <dd>-{{ totals().discount | siremMoney : currency() }}</dd>
          </div>
          <div class="sirem-invoice-editor__total-row">
            <dt>IVA</dt>
            <dd>{{ totals().tax | siremMoney : currency() }}</dd>
          </div>
          <div class="sirem-invoice-editor__total-row sirem-invoice-editor__total-row--grand">
            <dt>Total</dt>
            <dd>{{ totals().total | siremMoney : currency() }}</dd>
          </div>
        </dl>

        <div class="sirem-invoice-editor__actions">
          @if (touched() && !canSave()) {
            <p role="alert" class="sirem-invoice-editor__alert">
              {{ errorList()[0] }}
              @if (errorList().length > 1) { (+{{ errorList().length - 1 }} más) }
            </p>
          }
          <sirem-button variant="secondary" (pressed)="cancel()">Cancelar</sirem-button>
          <sirem-button [loading]="loading()" (pressed)="save()">Guardar factura</sirem-button>
        </div>
      </footer>
    </form>
  `,
})
export class SiremInvoiceEditor {
  /** Estado editable de la factura (doble vía con `[(draft)]`). */
  readonly draft = model<SiremInvoiceDraft>(siremEmptyInvoice());
  /** Clientes disponibles en el select de cabecera. */
  readonly customers = input<SiremInvoiceCustomer[]>([]);
  /** Correlativo sugerido cuando no hay número. */
  readonly nextNumber = input('');
  /** Tarifas de IVA ofrecidas por línea. */
  readonly taxRates = input<number[]>([0, 5, 19]);
  /** Código ISO del formato monetario (`siremMoney`). */
  readonly currency = input('COP');
  /** Estado fiscal mostrado en la pastilla. */
  readonly status = input<SiremInvoiceStatus>('draft');
  /** Bloquea el botón Guardar mientras persiste. */
  readonly loading = input(false);

  /** Factura válida lista para persistir. */
  readonly saved = output<SiremInvoiceDraft>();
  /** Se descartan los cambios (el draft vuelve a vacío). */
  readonly cancelled = output<void>();

  /** Activa la validación visible tras el primer intento de guardado. */
  readonly touched = signal(false);

  readonly customerOptions = computed<SiremSelectOption[]>(() =>
    this.customers().map((c) => ({ value: c.value, label: c.label })),
  );

  readonly taxRateOptions = computed<SiremSelectOption[]>(() =>
    this.taxRates().map((rate) => ({ value: rate, label: `${rate} %` })),
  );

  readonly selectedCustomer = computed(() => {
    const id = this.draft().customerId;
    if (id === null || id === undefined || id === '') return null;
    return this.customers().find((c) => String(c.value) === String(id)) ?? null;
  });

  readonly statusLabel = computed(() => STATUS_LABELS[this.status()]);
  readonly statusTone = computed(() => STATUS_TONES[this.status()]);

  readonly totals = computed<SiremInvoiceTotals>(() => {
    const lines = this.draft().lines;
    const acc = lines.reduce<SiremInvoiceTotals>(
      (sum, line) => {
        const t = siremLineTotals(line);
        sum.subtotal += t.base;
        sum.discount += t.discount;
        sum.tax += t.tax;
        sum.total += t.total;
        return sum;
      },
      { items: 0, subtotal: 0, discount: 0, tax: 0, total: 0 },
    );
    return { ...acc, items: lines.length };
  });

  readonly errors = computed<Record<string, string>>(() => {
    const draft = this.draft();
    const map: Record<string, string> = {};

    if (draft.customerId === null || draft.customerId === undefined || draft.customerId === '') {
      map['customerId'] = 'Selecciona el cliente.';
    }
    if (!draft.number.trim()) {
      map['number'] = 'Indica el N° del documento.';
    }
    if (!draft.issueDate) {
      map['issueDate'] = 'Indica la fecha de emisión.';
    }
    if (!draft.dueDate) {
      map['dueDate'] = 'Indica la fecha de vencimiento.';
    } else if (draft.issueDate && draft.dueDate < draft.issueDate) {
      map['dueDate'] = 'El vencimiento no puede ser anterior a la emisión.';
    }
    if (!draft.lines.length) {
      map['lines'] = 'Agrega al menos un concepto.';
    }

    for (const line of draft.lines) {
      if (!line.description.trim()) {
        map[`${line.id}:description`] = 'Escribe una descripción.';
      }
      if (!(line.quantity > 0)) {
        map[`${line.id}:quantity`] = 'La cantidad debe ser mayor que 0.';
      }
      if (!(line.unitPrice >= 0)) {
        map[`${line.id}:unitPrice`] = 'Precio no válido.';
      }
      if (line.discount < 0 || line.discount > 100) {
        map[`${line.id}:discount`] = 'Usa un descuento entre 0 y 100.';
      }
    }

    return map;
  });

  readonly errorList = computed(() => Object.values(this.errors()));
  readonly canSave = computed(() => this.errorList().length === 0);

  /** Mensaje de un campo, visible solo tras el primer guardado fallido. */
  err(key: string): string {
    return this.touched() ? (this.errors()[key] ?? '') : '';
  }

  lineTotal(line: SiremInvoiceLine): number {
    return siremLineTotals(line).total;
  }

  setCustomer(value: string | number | (string | number)[] | null): void {
    this.draft.update((draft) => ({ ...draft, customerId: Array.isArray(value) ? null : value }));
  }

  setDocumentNumber(value: string | number | (string | number)[] | null): void {
    const text = Array.isArray(value) ? '' : String(value ?? '');
    this.draft.update((draft) => ({ ...draft, number: text }));
  }

  setIssueDate(value: string | null): void {
    this.draft.update((draft) => ({ ...draft, issueDate: value ?? '' }));
  }

  setDueDate(value: string | null): void {
    this.draft.update((draft) => ({ ...draft, dueDate: value ?? '' }));
  }

  setNotes(value: string | null): void {
    this.draft.update((draft) => ({ ...draft, notes: value ?? '' }));
  }

  addLine(): void {
    this.draft.update((draft) => ({ ...draft, lines: [...draft.lines, siremInvoiceLine()] }));
  }

  removeLine(id: string): void {
    this.draft.update((draft) => {
      const lines = draft.lines.filter((line) => line.id !== id);
      return { ...draft, lines: lines.length ? lines : [siremInvoiceLine()] };
    });
  }

  setDescription(id: string, description: string): void {
    this.patchLine(id, { description });
  }

  /** Cantidad, precio unitario y descuento se leen del input como texto. */
  setLineValue(id: string, field: 'quantity' | 'unitPrice' | 'discount', raw: string): void {
    const value = num(raw);
    const clamped =
      field === 'discount' ? Math.min(100, Math.max(0, value)) : Math.max(0, value);
    this.patchLine(id, { [field]: clamped } as Partial<SiremInvoiceLine>);
  }

  setLineTaxRate(id: string, raw: string | number): void {
    this.patchLine(id, { taxRate: Math.max(0, num(raw)) });
  }

  /** Guarda solo si no hay errores; en caso contrario marca el formulario. */
  save(): void {
    this.touched.set(true);
    if (!this.canSave()) return;
    const number = this.draft().number.trim() || this.nextNumber();
    const draft = { ...this.draft(), number };
    this.draft.set(draft);
    this.saved.emit(draft);
  }

  cancel(): void {
    this.touched.set(false);
    this.draft.set(siremEmptyInvoice(this.nextNumber()));
    this.cancelled.emit();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.save();
  }

  private patchLine(id: string, patch: Partial<SiremInvoiceLine>): void {
    this.draft.update((draft) => ({
      ...draft,
      lines: draft.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    }));
  }
}
