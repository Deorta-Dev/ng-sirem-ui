import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremCard,
  SiremConfirmDialog,
  SiremDataTable,
  SiremEmptyState,
  SiremInput,
  SiremModal,
  SiremPageHeader,
  SiremSearchField,
  SiremSelect,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
  SiremTextarea,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  CUENTAS_TESORERIA,
  TRANSFERENCIAS,
  type ErpCuenta,
  type ErpTransferencia,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Transferencia del historial con la nota capturada en el formulario. */
type TransferenciaLocal = ErpTransferencia & { nota: string };

/**
 * Transferencias de fondos: movimientos internos entre cajas y bancos
 * de la misma empresa. Valida en vivo origen ≠ destino, moneda y saldo,
 * y solo tras confirmar mueve los saldos y registra la transferencia.
 */
@Component({
  selector: 'app-transferencias-fondos-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremCard,
    SiremConfirmDialog,
    SiremDataTable,
    SiremEmptyState,
    SiremInput,
    SiremModal,
    SiremPageHeader,
    SiremSearchField,
    SiremSelect,
    SiremStatCard,
    SiremTextarea,
  ],
  template: `
    <app-page-demo-shell label="Transferencias de fondos" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Transferencias de fondos"
            subtitle="Movimientos internos entre las cajas y los bancos de la misma empresa"
          ></sirem-page-header>

          <div class="grid lg:grid-cols-[22rem_1fr] gap-5">
            <sirem-card title="Nueva transferencia" subtitle="Entre cuentas de tesorería">
              <div class="flex flex-col gap-4">
                <sirem-select-field
                  label="Cuenta origen"
                  [options]="cuentaOptions()"
                  [(value)]="origen"
                  [error]="errorOrigen()"
                />
                <sirem-select-field
                  label="Cuenta destino"
                  [options]="cuentaOptions()"
                  [(value)]="destino"
                  [error]="errorDestino()"
                />
                <sirem-input-field
                  type="number"
                  label="Monto"
                  placeholder="0"
                  hint="Sin decimales, en la moneda de la cuenta."
                  [(value)]="monto"
                  [error]="errorMonto()"
                />
                <sirem-textarea-field
                  label="Nota"
                  [rows]="3"
                  placeholder="Motivo de la transferencia…"
                  [(value)]="nota"
                />
                <sirem-stat-card
                  label="Saldo cuenta origen"
                  [value]="saldoOrigen()"
                  variant="tint"
                  color="info"
                />
                <sirem-button [disabled]="!valido()" (pressed)="confirmAbierto.set(true)">
                  <i slot="icon" class="fi fi-rr-right-arrow" aria-hidden="true"></i>
                  Transferir
                </sirem-button>
              </div>
            </sirem-card>

            <sirem-card title="Historial" subtitle="Transferencias registradas en tesorería">
              <div class="flex flex-col gap-4">
                <sirem-search-field
                  label="Buscar"
                  placeholder="Cuenta origen o destino…"
                  [(value)]="q"
                />
                @if (historial().length) {
                  <sirem-data-table
                    [columns]="cols"
                    [rows]="historial()"
                    (rowClicked)="abrirDetalle($event)"
                  />
                } @else {
                  <sirem-empty-state
                    title="Sin transferencias"
                    description="Ninguna transferencia coincide con la búsqueda."
                  />
                }
              </div>
            </sirem-card>
          </div>
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="'Transferencia · ' + (detalle()?.origen ?? '')"
          size="md"
        >
          @if (detalle(); as t) {
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Recorrido</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ t.origen }} → {{ t.destino }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Fecha {{ t.fecha }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Valor</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ cop(t.valor) }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Estado {{ t.estado }}</p>
              </div>
              @if (t.nota) {
                <div class="sm:col-span-2">
                  <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Nota</p>
                  <p class="text-sm text-slate-700 dark:text-slate-300">{{ t.nota }}</p>
                </div>
              }
            </div>
          }
        </sirem-modal>

        <sirem-confirm-dialog
          [(open)]="confirmAbierto"
          variant="primary"
          title="Confirmar transferencia"
          [message]="mensajeConfirmacion()"
          detail="El saldo de ambas cuentas se actualizará de inmediato."
          confirmLabel="Confirmar"
          cancelLabel="Cancelar"
          (confirmed)="ejecutar()"
        />
      </main>
    </app-page-demo-shell>
  `,
})
export class TransferenciasFondosDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copias locales: la transferencia muta saldos y agrega historial. */
  readonly cuentas = signal<ErpCuenta[]>(CUENTAS_TESORERIA.map((c) => ({ ...c })));
  readonly transferencias = signal<TransferenciaLocal[]>(
    TRANSFERENCIAS.map((t) => ({ ...t, nota: '' })),
  );

  readonly q = signal('');
  readonly origen = signal<string | number | null>(2);
  readonly destino = signal<string | number | null>(4);
  readonly monto = signal<string | number | (string | number)[] | null>(null);
  readonly nota = signal<string | null>(null);
  readonly confirmAbierto = signal(false);
  readonly detalleAbierto = signal(false);
  readonly detalle = signal<TransferenciaLocal | null>(null);

  readonly cuentaOptions = computed<SiremSelectOption[]>(() =>
    this.cuentas().map((c) => ({ value: c.id, label: c.nombre + ' · ' + this.cop(c.saldo) })),
  );

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date' },
    { key: 'origen', label: 'Origen' },
    { key: 'destino', label: 'Destino' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    {
      key: 'estado',
      label: 'Estado',
      kind: 'badge',
      badgeTones: { Completada: 'success', Pendiente: 'warning' },
    },
  ];

  readonly cuentaOrigen = computed(() => this.cuentaPorId(this.origen()));
  readonly cuentaDestino = computed(() => this.cuentaPorId(this.destino()));
  readonly montoValor = computed(() => Number(this.monto()) || 0);

  readonly errorOrigen = computed(() =>
    this.cuentaOrigen() ? '' : 'Selecciona la cuenta de origen.',
  );

  readonly errorDestino = computed(() => {
    const origen = this.cuentaOrigen();
    const destino = this.cuentaDestino();
    if (!destino) return 'Selecciona la cuenta destino.';
    if (origen && destino.id === origen.id) return 'El destino debe ser distinto al origen.';
    if (origen && destino.moneda !== origen.moneda) {
      return 'Ambas cuentas deben estar en la misma moneda.';
    }
    return '';
  });

  readonly errorMonto = computed(() => {
    const valor = this.montoValor();
    if (valor <= 0) return 'Ingresa un monto mayor que cero.';
    const origen = this.cuentaOrigen();
    if (origen && valor > origen.saldo) {
      return 'Supera el saldo disponible (' + this.cop(origen.saldo) + ').';
    }
    return '';
  });

  readonly valido = computed(
    () => !this.errorOrigen() && !this.errorDestino() && !this.errorMonto(),
  );

  readonly saldoOrigen = computed(() => {
    const origen = this.cuentaOrigen();
    return origen ? this.cop(origen.saldo) + ' ' + origen.moneda : '—';
  });

  readonly mensajeConfirmacion = computed(() => {
    const origen = this.cuentaOrigen();
    const destino = this.cuentaDestino();
    if (!origen || !destino) return 'Revisa las cuentas seleccionadas.';
    return (
      'Mover ' +
      this.cop(this.montoValor()) +
      ' ' +
      origen.moneda +
      ' de ' +
      origen.nombre +
      ' a ' +
      destino.nombre +
      '.'
    );
  });

  /** Historial filtrado por cuenta de origen o destino. */
  readonly historial = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    return this.transferencias()
      .filter((t) => !texto || (t.origen + ' ' + t.destino).toLowerCase().includes(texto))
      .map((t) => ({ ...t }));
  });

  /** Confirma la operación: mueve saldos, registra y limpia el formulario. */
  ejecutar(): void {
    const origen = this.cuentaOrigen();
    const destino = this.cuentaDestino();
    const valor = this.montoValor();
    if (!origen || !destino || !this.valido()) return;

    this.cuentas.update((cuentas) =>
      cuentas.map((c) => {
        if (c.id === origen.id) return { ...c, saldo: c.saldo - valor };
        if (c.id === destino.id) return { ...c, saldo: c.saldo + valor };
        return c;
      }),
    );

    const nueva: TransferenciaLocal = {
      id: Math.max(...this.transferencias().map((t) => t.id)) + 1,
      fecha: '2026-10-01',
      origen: origen.nombre,
      destino: destino.nombre,
      valor,
      estado: 'Completada',
      nota: String(this.nota() ?? '').trim(),
    };

    this.transferencias.update((ts) => [nueva, ...ts]);
    this.monto.set(null);
    this.nota.set(null);

    this.toast.success({
      title: 'Transferencia completada',
      description: this.cop(valor) + ' movidos a ' + destino.nombre + '.',
      duration: 4_000,
    });
  }

  abrirDetalle(fila: Record<string, unknown>): void {
    const transferencia = this.transferencias().find((t) => t.id === fila['id']);
    if (!transferencia) return;
    this.detalle.set(transferencia);
    this.detalleAbierto.set(true);
  }

  private cuentaPorId(id: string | number | null): ErpCuenta | null {
    if (id === null) return null;
    return this.cuentas().find((c) => c.id === Number(id)) ?? null;
  }

  /** Formato COP con separador de miles. */
  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'transferencias-fondos.html',
      language: 'html',
      code: `<div class="grid lg:grid-cols-[22rem_1fr] gap-5">
  <sirem-card title="Nueva transferencia" subtitle="Entre cuentas de tesorería">
    <div class="flex flex-col gap-4">
      <sirem-select-field label="Cuenta origen" [options]="cuentaOptions()"
        [(value)]="origen" [error]="errorOrigen()" />
      <sirem-select-field label="Cuenta destino" [options]="cuentaOptions()"
        [(value)]="destino" [error]="errorDestino()" />
      <sirem-input-field type="number" label="Monto" placeholder="0"
        hint="Sin decimales, en la moneda de la cuenta."
        [(value)]="monto" [error]="errorMonto()" />
      <sirem-textarea-field label="Nota" rows="3" placeholder="Motivo de la transferencia…"
        [(value)]="nota" />
      <sirem-stat-card label="Saldo cuenta origen" [value]="saldoOrigen()" variant="tint" color="info" />
      <sirem-button [disabled]="!valido()" (pressed)="confirmAbierto.set(true)">Transferir</sirem-button>
    </div>
  </sirem-card>

  <sirem-card title="Historial" subtitle="Transferencias registradas en tesorería">
    <sirem-search-field label="Buscar" placeholder="Cuenta origen o destino…" [(value)]="q" />
    @if (historial().length) {
      <sirem-data-table [columns]="cols" [rows]="historial()" (rowClicked)="abrirDetalle($event)" />
    } @else {
      <sirem-empty-state title="Sin transferencias"
        description="Ninguna transferencia coincide con la búsqueda." />
    }
  </sirem-card>
</div>

<sirem-modal [(open)]="detalleAbierto" [title]="'Transferencia · ' + (detalle()?.origen ?? '')" size="md">
  @if (detalle(); as t) {
    <p class="text-sm font-semibold">{{ t.origen }} → {{ t.destino }}</p>
    <p class="text-sm text-slate-500">{{ t.fecha }} · {{ cop(t.valor) }} · {{ t.estado }}</p>
    @if (t.nota) {
      <p class="text-sm text-slate-700">{{ t.nota }}</p>
    }
  }
</sirem-modal>

<sirem-confirm-dialog [(open)]="confirmAbierto" variant="primary"
  title="Confirmar transferencia" [message]="mensajeConfirmacion()"
  detail="El saldo de ambas cuentas se actualizará de inmediato."
  confirmLabel="Confirmar" cancelLabel="Cancelar" (confirmed)="ejecutar()" />`,
    },
    {
      name: 'transferencias-fondos.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremConfirmDialog, SiremDataTable, SiremInput, SiremModal, SiremSearchField,
  SiremSelect, SiremSelectOption, SiremTableColumn, SiremTextarea,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  CUENTAS_TESORERIA, TRANSFERENCIAS, type ErpCuenta, type ErpTransferencia,
} from '../../data/erp-mock';

type TransferenciaLocal = ErpTransferencia & { nota: string };

export class TransferenciasFondosPage {
  private readonly toast = inject(DynamicToastService);

  readonly cuentas = signal<ErpCuenta[]>(CUENTAS_TESORERIA.map(c => ({ ...c })));
  readonly transferencias = signal<TransferenciaLocal[]>(
    TRANSFERENCIAS.map(t => ({ ...t, nota: '' })),
  );

  readonly q = signal('');
  readonly origen = signal<string | number | null>(2);
  readonly destino = signal<string | number | null>(4);
  readonly monto = signal<string | number | (string | number)[] | null>(null);
  readonly nota = signal<string | null>(null);
  readonly confirmAbierto = signal(false);
  readonly detalleAbierto = signal(false);
  readonly detalle = signal<TransferenciaLocal | null>(null);

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date' },
    { key: 'origen', label: 'Origen' },
    { key: 'destino', label: 'Destino' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Completada: 'success', Pendiente: 'warning' } },
  ];

  readonly cuentaOptions = computed<SiremSelectOption[]>(() =>
    this.cuentas().map(c => ({ value: c.id, label: c.nombre + ' · ' + this.cop(c.saldo) })),
  );

  readonly cuentaOrigen = computed(() => this.cuentaPorId(this.origen()));
  readonly cuentaDestino = computed(() => this.cuentaPorId(this.destino()));
  readonly montoValor = computed(() => Number(this.monto()) || 0);

  readonly errorOrigen = computed(() =>
    this.cuentaOrigen() ? '' : 'Selecciona la cuenta de origen.');

  readonly errorDestino = computed(() => {
    const origen = this.cuentaOrigen();
    const destino = this.cuentaDestino();
    if (!destino) return 'Selecciona la cuenta destino.';
    if (origen && destino.id === origen.id) return 'El destino debe ser distinto al origen.';
    if (origen && destino.moneda !== origen.moneda) {
      return 'Ambas cuentas deben estar en la misma moneda.';
    }
    return '';
  });

  readonly errorMonto = computed(() => {
    const valor = this.montoValor();
    if (valor <= 0) return 'Ingresa un monto mayor que cero.';
    const origen = this.cuentaOrigen();
    if (origen && valor > origen.saldo) {
      return 'Supera el saldo disponible (' + this.cop(origen.saldo) + ').';
    }
    return '';
  });

  readonly valido = computed(() =>
    !this.errorOrigen() && !this.errorDestino() && !this.errorMonto());

  readonly mensajeConfirmacion = computed(() => {
    const origen = this.cuentaOrigen();
    const destino = this.cuentaDestino();
    if (!origen || !destino) return 'Revisa las cuentas seleccionadas.';
    return 'Mover ' + this.cop(this.montoValor()) + ' ' + origen.moneda +
      ' de ' + origen.nombre + ' a ' + destino.nombre + '.';
  });

  readonly historial = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    return this.transferencias()
      .filter(t => !texto || (t.origen + ' ' + t.destino).toLowerCase().includes(texto))
      .map(t => ({ ...t }));
  });

  /** Mueve los saldos, registra la transferencia y limpia el formulario. */
  ejecutar(): void {
    const origen = this.cuentaOrigen();
    const destino = this.cuentaDestino();
    const valor = this.montoValor();
    if (!origen || !destino || !this.valido()) return;

    this.cuentas.update(cuentas => cuentas.map(c => {
      if (c.id === origen.id) return { ...c, saldo: c.saldo - valor };
      if (c.id === destino.id) return { ...c, saldo: c.saldo + valor };
      return c;
    }));

    this.transferencias.update(ts => [{
      id: Math.max(...ts.map(t => t.id)) + 1,
      fecha: '2026-10-01',
      origen: origen.nombre,
      destino: destino.nombre,
      valor,
      estado: 'Completada',
      nota: String(this.nota() ?? '').trim(),
    }, ...ts]);

    this.monto.set(null);
    this.nota.set(null);
    this.toast.success({
      title: 'Transferencia completada',
      description: this.cop(valor) + ' movidos a ' + destino.nombre + '.',
      duration: 4_000,
    });
  }

  abrirDetalle(fila: Record<string, unknown>): void {
    const transferencia = this.transferencias().find(t => t.id === fila['id']);
    if (!transferencia) return;
    this.detalle.set(transferencia);
    this.detalleAbierto.set(true);
  }

  private cuentaPorId(id: string | number | null): ErpCuenta | null {
    if (id === null) return null;
    return this.cuentas().find(c => c.id === Number(id)) ?? null;
  }

  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
  }
}`,
    },
  ];
}
