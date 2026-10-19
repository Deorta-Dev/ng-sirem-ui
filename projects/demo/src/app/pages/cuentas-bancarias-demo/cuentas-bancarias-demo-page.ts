import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone,
  SiremButton,
  SiremCard,
  SiremCardList,
  SiremDataTable,
  SiremEmptyState,
  SiremInput,
  SiremModal,
  SiremPageHeader,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CUENTAS_TESORERIA, MOVIMIENTOS_BANCARIOS, type ErpCuenta } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/**
 * Reparto simulado de movimientos por cuenta: el mock central no vincula
 * cada movimiento con su cuenta, así que la demo reparte sus ids entre
 * las cuentas del catálogo.
 */
const MOVIMIENTOS_POR_CUENTA: Record<number, number[]> = {
  1: [1, 4, 5, 6],
  2: [2, 3],
  3: [5],
  4: [3, 6],
  5: [1, 4],
};

/** Bancos ofrecidos en el modal de creación de cuentas. */
const BANCOS = [
  'Banco de Bogotá',
  'Bancolombia',
  'BBVA Colombia',
  'Banco AV Villas',
  '—',
];

/**
 * Cuentas bancarias y cajas: gestiona cuentas en moneda local y
 * extranjera, consolida sus saldos y filtra los movimientos de la
 * cuenta seleccionada. "Nueva cuenta" agrega una cuenta en memoria
 * con toast de confirmación.
 */
@Component({
  selector: 'app-cuentas-bancarias-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremCard,
    SiremCardList,
    SiremDataTable,
    SiremEmptyState,
    SiremInput,
    SiremModal,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Cuentas bancarias y cajas" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Cuentas bancarias y cajas"
            subtitle="Saldos en moneda local y extranjera de los bancos y cajas de la empresa"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" (pressed)="modalAbierto.set(true)">
                <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
                Nueva cuenta
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Saldo bancos (COP)" [value]="cop(saldoBancos())" variant="tint" color="brand" />
            <sirem-stat-card label="Saldo cajas (COP)" [value]="cop(saldoCajas())" variant="tint" color="info" />
            <sirem-stat-card label="Disponible en USD" [value]="usd(saldoUsd())" variant="tint" color="success" />
            <sirem-stat-card label="Cuentas activas" [value]="cuentas().length" variant="tint" color="warning" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field label="Buscar cuenta" placeholder="Nombre, banco o número…" [(value)]="q" />
            <sirem-input-field [strictOptions]="true" label="Tipo" placeholder="Todas" [options]="tipoOptions" [(value)]="tipo" />
          </div>

          <sirem-card-list
            [items]="cuentasFiltradas()"
            titleKey="nombre"
            subtitleKey="banco"
            badgeKey="moneda"
            [badgeTones]="monedaTones"
            avatarKey="tipo"
            [fields]="campos"
            emptyText="Sin cuentas con ese filtro."
            (itemPressed)="seleccionar($event)"
          />

          <sirem-card [title]="tituloMovimientos()" subtitle="Movimientos de la cuenta seleccionada">
            @if (!cuentaSel()) {
              <sirem-empty-state
                title="Selecciona una cuenta"
                description="Elige una tarjeta de tesorería para ver sus movimientos."
              />
            } @else if (!filasMov().length) {
              <sirem-empty-state
                title="Sin movimientos"
                description="Esta cuenta todavía no registra movimientos en el extracto."
              />
            } @else {
              <sirem-data-table [columns]="colsMov()" [rows]="filasMov()" />
            }
          </sirem-card>
        </div>

        <sirem-modal
          [(open)]="modalAbierto"
          title="Nueva cuenta de tesorería"
          size="md"
          [actions]="accionesModal()"
          (actionPressed)="accionModal($event.label)"
        >
          <div class="grid gap-3 sm:grid-cols-2">
            <sirem-input-field
              label="Nombre de la cuenta"
              placeholder="Ej. Bancolombia operativo"
              [(value)]="nombreCuenta"
            />
            <sirem-input-field label="Número" placeholder="0000000000" [(value)]="numeroCuenta" />
            <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Banco" [options]="bancoOptions" [(value)]="bancoCuenta" />
            <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Moneda" [options]="monedaOptions" [(value)]="monedaCuenta" />
          </div>
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            La cuenta queda disponible de inmediato en tesorería con saldo inicial cero.
          </p>
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class CuentasBancariasDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo agrega cuentas nuevas en memoria. */
  readonly cuentas = signal<ErpCuenta[]>(CUENTAS_TESORERIA.map((c) => ({ ...c })));

  readonly q = signal('');
  readonly tipo = signal<string | number | null>(null);
  readonly cuentaSel = signal<ErpCuenta | null>(null);
  readonly modalAbierto = signal(false);

  readonly nombreCuenta = signal<string | number | (string | number)[] | null>(null);
  readonly numeroCuenta = signal<string | number | (string | number)[] | null>(null);
  readonly bancoCuenta = signal<string | number | null>('Bancolombia');
  readonly monedaCuenta = signal<string | number | null>('COP');

  readonly tipoOptions: SiremSelectOption[] = [
    { value: 'Banco', label: 'Bancos' },
    { value: 'Caja', label: 'Cajas' },
  ];

  readonly bancoOptions: SiremSelectOption[] = BANCOS.map((b) => ({
    value: b,
    label: b === '—' ? 'Caja (sin banco)' : b,
  }));

  readonly monedaOptions: SiremSelectOption[] = [
    { value: 'COP', label: 'Peso colombiano (COP)' },
    { value: 'USD', label: 'Dólar (USD)' },
  ];

  readonly monedaTones: Record<string, SiremBadgeTone> = { USD: 'info', COP: 'success' };

  readonly campos = [
    { key: 'numero', label: 'Nº', icon: 'fi fi-rr-hashtag' },
    { key: 'saldo', label: 'Saldo', icon: 'fi fi-rr-wallet' },
  ];

  /** Cuentas visibles: búsqueda por texto + filtro por tipo, saldo formateado. */
  readonly cuentasFiltradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const tipoSel = this.tipo();
    return this.cuentas()
      .filter((c) => {
        const coincide =
          !texto || (c.nombre + ' ' + c.banco + ' ' + c.numero).toLowerCase().includes(texto);
        return coincide && (!tipoSel || c.tipo === tipoSel);
      })
      .map((c) => ({ ...c, saldo: this.cop(c.saldo) + (c.moneda === 'USD' ? ' USD' : '') }));
  });

  readonly tituloMovimientos = computed(() => {
    const cuenta = this.cuentaSel();
    return cuenta ? 'Movimientos · ' + cuenta.nombre : 'Movimientos de la cuenta seleccionada';
  });

  readonly saldoBancos = computed(() => this.saldoDe((c) => c.tipo === 'Banco' && c.moneda === 'COP'));
  readonly saldoCajas = computed(() => this.saldoDe((c) => c.tipo === 'Caja'));
  readonly saldoUsd = computed(() => this.saldoDe((c) => c.moneda === 'USD'));

  /** Movimientos repartidos según la cuenta elegida en la grilla. */
  readonly movimientosCuenta = computed(() => {
    const cuenta = this.cuentaSel();
    if (!cuenta) return [];
    const ids = MOVIMIENTOS_POR_CUENTA[cuenta.id] ?? [];
    return MOVIMIENTOS_BANCARIOS.filter((m) => ids.includes(m.id));
  });

  /** Filas con el comprobante convertido en etiqueta legible. */
  readonly filasMov = computed(() =>
    this.movimientosCuenta().map((m) => ({
      ...m,
      comprobante: m.conciliado ? (m.comprobante ?? 'Conciliado') : 'Pendiente',
    })),
  );

  readonly colsMov = computed<SiremTableColumn[]>(() => {
    const tonos: Record<string, SiremBadgeTone> = { Pendiente: 'warning', Conciliado: 'success' };
    for (const m of this.movimientosCuenta()) {
      if (m.conciliado && m.comprobante) tonos[m.comprobante] = 'success';
    }
    return [
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'descripcion', label: 'Descripción', subKey: 'referencia' },
      { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
      { key: 'comprobante', label: 'Comprobante', kind: 'badge', badgeTones: tonos },
    ];
  });

  readonly accionesModal = computed(() => [
    { label: 'Cancelar', variant: 'secondary' as const },
    { label: 'Guardar cuenta', disabled: !this.formValido() },
  ]);

  readonly formValido = computed(
    () =>
      String(this.nombreCuenta() ?? '').trim() !== '' &&
      String(this.numeroCuenta() ?? '').trim() !== '' &&
      this.bancoCuenta() !== null &&
      this.monedaCuenta() !== null,
  );

  /** Selecciona la cuenta pulsada y filtra los movimientos de abajo. */
  seleccionar(fila: Record<string, unknown>): void {
    this.cuentaSel.set(this.cuentas().find((c) => c.id === fila['id']) ?? null);
  }

  accionModal(label: string): void {
    if (label === 'Cancelar') this.modalAbierto.set(false);
    else this.crearCuenta();
  }

  /** Crea la cuenta, la selecciona y cierra con toast de éxito. */
  private crearCuenta(): void {
    if (!this.formValido()) return;

    const nombre = String(this.nombreCuenta()).trim();
    const numero = String(this.numeroCuenta()).trim();
    const banco = String(this.bancoCuenta());
    const moneda = this.monedaCuenta() === 'USD' ? 'USD' : 'COP';

    const nueva: ErpCuenta = {
      id: Math.max(...this.cuentas().map((c) => c.id)) + 1,
      codigo: moneda === 'USD' ? '1110-10' : '1110-05',
      nombre,
      banco,
      tipo: banco === '—' ? 'Caja' : 'Banco',
      moneda,
      numero,
      saldo: 0,
    };

    this.cuentas.update((cuentas) => [...cuentas, nueva]);
    this.cuentaSel.set(nueva);
    this.modalAbierto.set(false);
    this.limpiarForm();

    this.toast.success({
      title: 'Cuenta creada',
      description: nombre + ' quedó disponible en tesorería.',
      duration: 3_500,
    });
  }

  private limpiarForm(): void {
    this.nombreCuenta.set(null);
    this.numeroCuenta.set(null);
    this.bancoCuenta.set('Bancolombia');
    this.monedaCuenta.set('COP');
  }

  private saldoDe(pred: (c: ErpCuenta) => boolean): number {
    return this.cuentas().filter(pred).reduce((acc, c) => acc + c.saldo, 0);
  }

  /** Formato COP/USD con separador de miles. */
  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  usd(valor: number): string {
    return this.cop(valor) + ' USD';
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'cuentas-bancarias.html',
      language: 'html',
      code: `<sirem-page-header
  title="Cuentas bancarias y cajas"
  subtitle="Saldos en moneda local y extranjera de los bancos y cajas de la empresa">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" (pressed)="modalAbierto.set(true)">Nueva cuenta</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Saldo bancos (COP)" [value]="cop(saldoBancos())" variant="tint" color="brand" />
  <sirem-stat-card label="Saldo cajas (COP)" [value]="cop(saldoCajas())" variant="tint" color="info" />
  <sirem-stat-card label="Disponible en USD" [value]="usd(saldoUsd())" variant="tint" color="success" />
  <sirem-stat-card label="Cuentas activas" [value]="cuentas().length" variant="tint" color="warning" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field label="Buscar cuenta" placeholder="Nombre, banco o número…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Tipo" placeholder="Todas" [options]="tipoOptions" [(value)]="tipo" />
</div>

<sirem-card-list
  [items]="cuentasFiltradas()"
  titleKey="nombre"
  subtitleKey="banco"
  badgeKey="moneda"
  [badgeTones]="monedaTones"
  avatarKey="tipo"
  [fields]="campos"
  (itemPressed)="seleccionar($event)" />

<sirem-card [title]="tituloMovimientos()" subtitle="Movimientos de la cuenta seleccionada">
  @if (!cuentaSel()) {
    <sirem-empty-state title="Selecciona una cuenta"
      description="Elige una tarjeta de tesorería para ver sus movimientos." />
  } @else if (!filasMov().length) {
    <sirem-empty-state title="Sin movimientos"
      description="Esta cuenta todavía no registra movimientos en el extracto." />
  } @else {
    <sirem-data-table [columns]="colsMov()" [rows]="filasMov()" />
  }
</sirem-card>

<sirem-modal [(open)]="modalAbierto" title="Nueva cuenta de tesorería" size="md"
  [actions]="accionesModal()" (actionPressed)="accionModal($event.label)">
  <div class="grid gap-3 sm:grid-cols-2">
    <sirem-input-field label="Nombre de la cuenta" placeholder="Ej. Bancolombia operativo"
      [(value)]="nombreCuenta" />
    <sirem-input-field label="Número" placeholder="0000000000" [(value)]="numeroCuenta" />
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Banco" [options]="bancoOptions" [(value)]="bancoCuenta" />
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Moneda" [options]="monedaOptions" [(value)]="monedaCuenta" />
  </div>
</sirem-modal>`,
    },
    {
      name: 'cuentas-bancarias.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone, SiremCard, SiremCardList, SiremDataTable, SiremInput,
  SiremModal, SiremSearchField, SiremSelectOption,
  SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CUENTAS_TESORERIA, MOVIMIENTOS_BANCARIOS, type ErpCuenta } from '../../data/erp-mock';

const MOVIMIENTOS_POR_CUENTA: Record<number, number[]> = {
  1: [1, 4, 5, 6], 2: [2, 3], 3: [5], 4: [3, 6], 5: [1, 4],
};

export class CuentasBancariasPage {
  private readonly toast = inject(DynamicToastService);

  readonly cuentas = signal<ErpCuenta[]>(CUENTAS_TESORERIA.map(c => ({ ...c })));
  readonly q = signal('');
  readonly tipo = signal<string | number | null>(null);
  readonly cuentaSel = signal<ErpCuenta | null>(null);
  readonly modalAbierto = signal(false);
  readonly nombreCuenta = signal<string | number | (string | number)[] | null>(null);
  readonly numeroCuenta = signal<string | number | (string | number)[] | null>(null);
  readonly bancoCuenta = signal<string | number | null>('Bancolombia');
  readonly monedaCuenta = signal<string | number | null>('COP');

  readonly monedaTones: Record<string, SiremBadgeTone> = { USD: 'info', COP: 'success' };
  readonly campos = [
    { key: 'numero', label: 'Nº', icon: 'fi fi-rr-hashtag' },
    { key: 'saldo', label: 'Saldo', icon: 'fi fi-rr-wallet' },
  ];

  readonly cuentasFiltradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const tipoSel = this.tipo();
    return this.cuentas()
      .filter(c => {
        const coincide = !texto || (c.nombre + ' ' + c.banco + ' ' + c.numero).toLowerCase().includes(texto);
        return coincide && (!tipoSel || c.tipo === tipoSel);
      })
      .map(c => ({ ...c, saldo: this.cop(c.saldo) + (c.moneda === 'USD' ? ' USD' : '') }));
  });

  readonly saldoBancos = computed(() => this.saldoDe(c => c.tipo === 'Banco' && c.moneda === 'COP'));
  readonly saldoCajas = computed(() => this.saldoDe(c => c.tipo === 'Caja'));
  readonly saldoUsd = computed(() => this.saldoDe(c => c.moneda === 'USD'));

  readonly movimientosCuenta = computed(() => {
    const cuenta = this.cuentaSel();
    if (!cuenta) return [];
    const ids = MOVIMIENTOS_POR_CUENTA[cuenta.id] ?? [];
    return MOVIMIENTOS_BANCARIOS.filter(m => ids.includes(m.id));
  });

  readonly filasMov = computed(() =>
    this.movimientosCuenta().map(m => ({
      ...m,
      comprobante: m.conciliado ? (m.comprobante ?? 'Conciliado') : 'Pendiente',
    })),
  );

  readonly colsMov = computed<SiremTableColumn[]>(() => {
    const tonos: Record<string, SiremBadgeTone> = { Pendiente: 'warning', Conciliado: 'success' };
    for (const m of this.movimientosCuenta()) {
      if (m.conciliado && m.comprobante) tonos[m.comprobante] = 'success';
    }
    return [
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'descripcion', label: 'Descripción', subKey: 'referencia' },
      { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
      { key: 'comprobante', label: 'Comprobante', kind: 'badge', badgeTones: tonos },
    ];
  });

  readonly formValido = computed(() =>
    String(this.nombreCuenta() ?? '').trim() !== '' &&
    String(this.numeroCuenta() ?? '').trim() !== '' &&
    this.bancoCuenta() !== null && this.monedaCuenta() !== null);

  seleccionar(fila: Record<string, unknown>): void {
    this.cuentaSel.set(this.cuentas().find(c => c.id === fila['id']) ?? null);
  }

  /** Crea la cuenta en memoria y avisa con toast. */
  crearCuenta(): void {
    if (!this.formValido()) return;
    const nombre = String(this.nombreCuenta()).trim();
    const banco = String(this.bancoCuenta());
    const moneda = this.monedaCuenta() === 'USD' ? 'USD' : 'COP';
    const nueva: ErpCuenta = {
      id: Math.max(...this.cuentas().map(c => c.id)) + 1,
      codigo: moneda === 'USD' ? '1110-10' : '1110-05',
      nombre, banco, tipo: banco === '—' ? 'Caja' : 'Banco',
      moneda, numero: String(this.numeroCuenta()).trim(), saldo: 0,
    };
    this.cuentas.update(cuentas => [...cuentas, nueva]);
    this.cuentaSel.set(nueva);
    this.modalAbierto.set(false);
    this.toast.success({
      title: 'Cuenta creada',
      description: nombre + ' quedó disponible en tesorería.',
      duration: 3_500,
    });
  }

  private saldoDe(pred: (c: ErpCuenta) => boolean): number {
    return this.cuentas().filter(pred).reduce((acc, c) => acc + c.saldo, 0);
  }

  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
  }
}`,
    },
  ];
}
