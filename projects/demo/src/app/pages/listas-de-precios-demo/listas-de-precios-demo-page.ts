import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremInput, SiremModal,
  SiremModalAction, SiremMoneyPipe, SiremMultiSelect, SiremMultiSelectOption,
  SiremPageHeader, SiremSearchField, SiremSelectOption, SiremStatCard,
  SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { LISTAS_PRECIOS, PRODUCTOS, type ErpLista, type ErpProducto } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Valor crudo de un `sirem-input-field` (trae texto o número). */
type ValorCampo = string | number | (string | number)[] | null;

function numero(v: ValorCampo): number {
  if (Array.isArray(v)) return Number(v[0] ?? 0);
  return Number(v ?? 0);
}

/**
 * Listas de precios: tarifas mayorista y detal por SKU, margen sobre el
 * costo promedio ponderado y actualización masiva por porcentaje.
 */
@Component({
  selector: 'app-listas-de-precios-demo-page',
  standalone: true,
  imports: [PageDemoShell, SiremButton, SiremDataTable, SiremEmptyState, SiremInput,
    SiremModal, SiremMoneyPipe, SiremMultiSelect, SiremPageHeader, SiremSearchField,
    SiremStatCard],
  template: `
    <app-page-demo-shell label="Listas de precios" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Listas de precios" subtitle="Tarifas mayorista y detal con actualización masiva de precios">
            <div slot="actions" class="flex flex-wrap items-end gap-3">
              <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" class="w-full sm:w-48" label="Lista" [options]="listaOptions" [(value)]="listaSel" />
              <sirem-button size="sm" (pressed)="abrirMasiva()">
                <i slot="icon" class="fi fi-rr-magic-wand" aria-hidden="true"></i>
                Actualización masiva
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Referencias" [value]="referencias()" />
            <sirem-stat-card label="Precio promedio de la lista" [value]="precioPromedio() | siremMoney" color="info" />
            <sirem-stat-card label="Margen promedio %" [value]="margenPromedio()" color="success" />
            <sirem-stat-card label="Última actualización" [value]="ultimaActualizacion" color="warning" />
          </div>

          <sirem-search-field class="w-full md:w-80" placeholder="Buscar por SKU o nombre…" [(value)]="q" />

          @if (filas().length) {
            <sirem-data-table [columns]="cols()" [rows]="filas()" (rowClicked)="abrirProducto($event)" />
          } @else {
            <sirem-empty-state title="Sin referencias" description="Ningún producto coincide con la búsqueda actual." />
          }
        </div>

        <sirem-modal [(open)]="masivaAbierta" title="Actualización masiva de precios" size="md" [actions]="accionesMasiva()" (actionPressed)="accion($event.label)">
          <div class="grid gap-3 sm:grid-cols-2">
            <sirem-input-field label="Aumento %" type="number" hint="Se aplica sobre el precio de la lista objetivo." [error]="errorPct()" [(value)]="pct" />
            <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Lista objetivo" [options]="listaOptions" [(value)]="listaObjetivo" />
          </div>

          <sirem-multi-select class="mt-3 block" label="Referencias afectadas" [options]="referenciasOptions()" [(value)]="afectados" />

          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {{ afectados().length }} de {{ productos().length }} referencias · nuevo precio promedio
            <span class="font-semibold text-slate-900 dark:text-slate-100">{{ precioProyectado() | siremMoney }}</span>
          </p>
        </sirem-modal>

        <sirem-modal [(open)]="prodAbierto" [title]="prodTitulo()" size="sm">
          @if (prodSel(); as p) {
            <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt class="text-slate-500 dark:text-slate-400">Categoría</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.categoria }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Costo promedio</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.costo | siremMoney }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Precio mayorista</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.precioMayor | siremMoney }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Precio detal</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.precioDetal | siremMoney }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Margen en lista activa</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ margenDe(p) }} %</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Lista</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ nombreLista() }}</dd></div>
            </dl>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class ListasDePreciosDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia local: la actualización masiva recalcula precios sin tocar el mock. */
  readonly productos = signal<ErpProducto[]>(PRODUCTOS.map((p) => ({ ...p })));
  readonly q = signal('');
  readonly listaSel = signal<string | number | null>('mayor');
  readonly masivaAbierta = signal(false);
  readonly pct = signal<ValorCampo>(8);
  readonly listaObjetivo = signal<string | number | null>('mayor');
  readonly afectados = signal<(string | number)[]>(PRODUCTOS.map((p) => p.sku));

  readonly ultimaActualizacion = '30 sep 2026';
  readonly listaOptions: SiremSelectOption[] = LISTAS_PRECIOS.map((l) => ({
    value: l.value, label: l.label,
  }));

  readonly lista = computed<ErpLista>(() => (this.listaSel() === 'detal' ? 'detal' : 'mayor'));
  readonly nombreLista = computed(() => this.nombreDe(this.lista()));

  /** Filas filtradas por búsqueda con el precio de la lista activa y su margen. */
  readonly filas = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const lista = this.lista();
    return this.productos()
      .filter((p) => !texto || (p.sku + ' ' + p.nombre).toLowerCase().includes(texto))
      .map((p) => {
        const precio = lista === 'mayor' ? p.precioMayor : p.precioDetal;
        return {
          id: p.id, sku: p.sku, nombre: p.nombre, categoria: p.categoria, costo: p.costo,
          precio, precioMayor: p.precioMayor, precioDetal: p.precioDetal,
          margen: p.costo > 0 ? Math.round(((precio - p.costo) / p.costo) * 100) : 0,
        };
      });
  });

  /** La columna de la lista activa cambia de rótulo con el selector. */
  readonly cols = computed<SiremTableColumn[]>(() => [
    { key: 'sku', label: 'SKU' },
    { key: 'nombre', label: 'Producto', subKey: 'categoria' },
    { key: 'precio', label: 'Precio ' + this.nombreLista(), kind: 'currency', align: 'right' },
    { key: 'costo', label: 'Costo', kind: 'currency', align: 'right' },
    { key: 'precioMayor', label: 'Mayorista', kind: 'currency', align: 'right' },
    { key: 'precioDetal', label: 'Detal', kind: 'currency', align: 'right' },
    { key: 'margen', label: 'Margen %', kind: 'number', align: 'right' },
  ]);

  readonly referencias = computed(() => this.filas().length);
  readonly precioPromedio = computed(() => this.promedioDe('precio'));
  readonly margenPromedio = computed(() => this.promedioDe('margen'));

  readonly referenciasOptions = computed<SiremMultiSelectOption[]>(() =>
    this.productos().map((p) => ({ value: p.sku, label: p.sku + ' · ' + p.nombre, group: p.categoria })),
  );

  readonly errorPct = computed(() => {
    const raw = this.pct();
    if (raw === null || raw === '') return '';
    const n = numero(raw);
    return Number.isFinite(n) && n > -100 ? '' : 'Usa un porcentaje mayor a -100.';
  });
  readonly aplicarValido = computed(
    () => this.errorPct() === '' && numero(this.pct()) !== 0 && this.afectados().length > 0,
  );
  readonly accionesMasiva = computed<SiremModalAction[]>(() => [
    { label: 'Cancelar', variant: 'secondary' },
    { label: 'Aplicar', disabled: !this.aplicarValido() },
  ]);

  /** Precio promedio de la lista objetivo si se aplicara a lo seleccionado. */
  readonly precioProyectado = computed(() => {
    const lista: ErpLista = this.listaObjetivo() === 'detal' ? 'detal' : 'mayor';
    const factor = 1 + numero(this.pct()) / 100;
    const skus = this.afectados().map(String);
    const elegidos = this.productos().filter((p) => skus.includes(p.sku));
    if (!elegidos.length) return 0;
    const suma = elegidos.reduce(
      (acc, p) => acc + (lista === 'mayor' ? p.precioMayor : p.precioDetal) * factor, 0);
    return Math.round(suma / elegidos.length);
  });

  /** Detalle de precios de la referencia seleccionada en la tabla. */
  readonly prodAbierto = signal(false);
  readonly prodSel = signal<ErpProducto | null>(null);
  readonly prodTitulo = computed(() => {
    const p = this.prodSel();
    return p ? p.sku + ' · ' + p.nombre : 'Ficha de precios';
  });

  /** Abre la ficha de precios de la fila pulsada. */
  abrirProducto(fila: Record<string, unknown>): void {
    const producto = this.productos().find((p) => p.id === fila['id']);
    if (!producto) return;
    this.prodSel.set(producto);
    this.prodAbierto.set(true);
  }

  /** Margen del producto sobre el precio de la lista activa. */
  margenDe(p: ErpProducto): number {
    const precio = this.lista() === 'mayor' ? p.precioMayor : p.precioDetal;
    return p.costo > 0 ? Math.round(((precio - p.costo) / p.costo) * 100) : 0;
  }

  /** Abre el modal con la lista activa y todo el catálogo preseleccionado. */
  abrirMasiva(): void {
    this.pct.set(8);
    this.listaObjetivo.set(this.lista());
    this.afectados.set(this.productos().map((p) => p.sku));
    this.masivaAbierta.set(true);
  }

  accion(label: string): void {
    if (label === 'Aplicar') this.aplicar();
  }

  /** Recalcula el precio de la lista objetivo para las referencias elegidas. */
  aplicar(): void {
    if (!this.aplicarValido()) {
      this.toast.error({
        title: 'Revisa el aumento',
        description: 'Selecciona al menos una referencia y un porcentaje válido.',
        duration: 3_000,
      });
      return;
    }

    const pct = numero(this.pct());
    const objetivo: ErpLista = this.listaObjetivo() === 'detal' ? 'detal' : 'mayor';
    const skus = this.afectados().map(String);
    const factor = 1 + pct / 100;

    this.productos.update((lista) => lista.map((p) => skus.includes(p.sku)
      ? {
          ...p,
          precioMayor: objetivo === 'mayor' ? Math.round(p.precioMayor * factor) : p.precioMayor,
          precioDetal: objetivo === 'detal' ? Math.round(p.precioDetal * factor) : p.precioDetal,
        }
      : p));

    this.masivaAbierta.set(false);
    const signo = pct >= 0 ? '+' : '';
    this.toast.success({
      title: 'Precios actualizados',
      description: skus.length + ' referencias actualizadas ' + signo + pct +
        '% en lista ' + this.nombreDe(objetivo) + '.',
      duration: 4_000,
    });
  }

  private nombreDe(lista: ErpLista): string {
    return LISTAS_PRECIOS.find((l) => l.value === lista)?.label ?? '';
  }

  private promedioDe(campo: 'precio' | 'margen'): number {
    const filas = this.filas();
    if (!filas.length) return 0;
    return Math.round(filas.reduce((acc, f) => acc + Number(f[campo]), 0) / filas.length);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'listas-de-precios.html',
      language: 'html',
      code: `<sirem-page-header title="Listas de precios"
  subtitle="Tarifas mayorista y detal con actualización masiva de precios">
  <div slot="actions" class="flex flex-wrap items-end gap-3">
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" class="w-full sm:w-48" label="Lista"
      [options]="listaOptions" [(value)]="listaSel" />
    <sirem-button size="sm" (pressed)="abrirMasiva()">
      <i slot="icon" class="fi fi-rr-magic-wand" aria-hidden="true"></i>
      Actualización masiva
    </sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Referencias" [value]="referencias()" />
  <sirem-stat-card label="Precio promedio de la lista"
    [value]="precioPromedio() | siremMoney" color="info" />
  <sirem-stat-card label="Margen promedio %" [value]="margenPromedio()" color="success" />
  <sirem-stat-card label="Última actualización" [value]="ultimaActualizacion" color="warning" />
</div>

<sirem-search-field class="w-full md:w-80" placeholder="Buscar por SKU o nombre…" [(value)]="q" />

@if (filas().length) {
  <sirem-data-table [columns]="cols()" [rows]="filas()" (rowClicked)="abrirProducto($event)" />
} @else {
  <sirem-empty-state title="Sin referencias"
    description="Ningún producto coincide con la búsqueda actual." />
}

<sirem-modal [(open)]="masivaAbierta" title="Actualización masiva de precios"
  size="md" [actions]="accionesMasiva" (actionPressed)="accion($event.label)">
  <div class="grid gap-3 sm:grid-cols-2">
    <sirem-input-field label="Aumento %" type="number"
      hint="Se aplica sobre el precio de la lista objetivo."
      [error]="errorPct" [(value)]="pct" />
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Lista objetivo" [options]="listaOptions"
      [(value)]="listaObjetivo" />
  </div>
  <sirem-multi-select class="mt-3 block" label="Referencias afectadas"
    [options]="referenciasOptions" [(value)]="afectados" />
</sirem-modal>

<sirem-modal [(open)]="prodAbierto" [title]="prodTitulo()" size="sm">
  @if (prodSel(); as p) {
    <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      <div><dt class="text-slate-500 dark:text-slate-400">Categoría</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.categoria }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Costo promedio</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.costo | siremMoney }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Precio mayorista</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.precioMayor | siremMoney }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Precio detal</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.precioDetal | siremMoney }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Margen en lista activa</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ margenDe(p) }} %</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Lista</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ nombreLista() }}</dd></div>
    </dl>
  }
</sirem-modal>`,
    },
    {
      name: 'listas-de-precios.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremInput, SiremModal, SiremMoneyPipe,
  SiremMultiSelect, SiremPageHeader, SiremSearchField, SiremStatCard,
  type SiremModalAction, type SiremMultiSelectOption, type SiremSelectOption,
  type SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { LISTAS_PRECIOS, PRODUCTOS, type ErpLista, type ErpProducto } from '../../data/erp-mock';

type ValorCampo = string | number | (string | number)[] | null;

function numero(v: ValorCampo): number {
  if (Array.isArray(v)) return Number(v[0] ?? 0);
  return Number(v ?? 0);
}

@Component({
  selector: 'app-listas-de-precios-page',
  standalone: true,
  imports: [SiremPageHeader, SiremInput, SiremButton, SiremStatCard, SiremSearchField,
    SiremDataTable, SiremEmptyState, SiremModal, SiremMultiSelect,
    SiremMoneyPipe],
  templateUrl: './listas-de-precios.html',
})
export class ListasDePreciosPage {
  private readonly toast = inject(DynamicToastService);

  readonly productos = signal<ErpProducto[]>(PRODUCTOS.map(p => ({ ...p })));
  readonly q = signal('');
  readonly listaSel = signal<string | number | null>('mayor');
  readonly masivaAbierta = signal(false);
  readonly pct = signal<ValorCampo>(8);
  readonly listaObjetivo = signal<string | number | null>('mayor');
  readonly afectados = signal<(string | number)[]>(PRODUCTOS.map(p => p.sku));

  readonly ultimaActualizacion = '30 sep 2026';
  readonly listaOptions: SiremSelectOption[] = LISTAS_PRECIOS.map(l => ({
    value: l.value, label: l.label,
  }));

  readonly lista = computed<ErpLista>(() => (this.listaSel() === 'detal' ? 'detal' : 'mayor'));
  readonly nombreLista = computed(() => this.nombreDe(this.lista()));

  readonly filas = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const lista = this.lista();
    return this.productos()
      .filter(p => !texto || (p.sku + ' ' + p.nombre).toLowerCase().includes(texto))
      .map(p => {
        const precio = lista === 'mayor' ? p.precioMayor : p.precioDetal;
        return {
          id: p.id, sku: p.sku, nombre: p.nombre, categoria: p.categoria, costo: p.costo,
          precio, precioMayor: p.precioMayor, precioDetal: p.precioDetal,
          margen: p.costo > 0 ? Math.round(((precio - p.costo) / p.costo) * 100) : 0,
        };
      });
  });

  readonly cols = computed<SiremTableColumn[]>(() => [
    { key: 'sku', label: 'SKU' },
    { key: 'nombre', label: 'Producto', subKey: 'categoria' },
    { key: 'precio', label: 'Precio ' + this.nombreLista(), kind: 'currency', align: 'right' },
    { key: 'costo', label: 'Costo', kind: 'currency', align: 'right' },
    { key: 'precioMayor', label: 'Mayorista', kind: 'currency', align: 'right' },
    { key: 'precioDetal', label: 'Detal', kind: 'currency', align: 'right' },
    { key: 'margen', label: 'Margen %', kind: 'number', align: 'right' },
  ]);

  readonly referencias = computed(() => this.filas().length);
  readonly precioPromedio = computed(() => this.promedioDe('precio'));
  readonly margenPromedio = computed(() => this.promedioDe('margen'));

  readonly referenciasOptions = computed<SiremMultiSelectOption[]>(() =>
    this.productos().map(p => ({
      value: p.sku, label: p.sku + ' · ' + p.nombre, group: p.categoria,
    })));

  readonly errorPct = computed(() => {
    const raw = this.pct();
    if (raw === null || raw === '') return '';
    const n = numero(raw);
    return Number.isFinite(n) && n > -100 ? '' : 'Usa un porcentaje mayor a -100.';
  });
  readonly aplicarValido = computed(
    () => this.errorPct() === '' && numero(this.pct()) !== 0 && this.afectados().length > 0);
  readonly accionesMasiva = computed<SiremModalAction[]>(() => [
    { label: 'Cancelar', variant: 'secondary' },
    { label: 'Aplicar', disabled: !this.aplicarValido() },
  ]);

  readonly prodAbierto = signal(false);
  readonly prodSel = signal<ErpProducto | null>(null);
  readonly prodTitulo = computed(() => {
    const p = this.prodSel();
    return p ? p.sku + ' · ' + p.nombre : 'Ficha de precios';
  });

  abrirProducto(fila: Record<string, unknown>): void {
    const producto = this.productos().find(p => p.id === fila['id']);
    if (!producto) return;
    this.prodSel.set(producto);
    this.prodAbierto.set(true);
  }

  margenDe(p: ErpProducto): number {
    const precio = this.lista() === 'mayor' ? p.precioMayor : p.precioDetal;
    return p.costo > 0 ? Math.round(((precio - p.costo) / p.costo) * 100) : 0;
  }

  abrirMasiva(): void {
    this.pct.set(8);
    this.listaObjetivo.set(this.lista());
    this.afectados.set(this.productos().map(p => p.sku));
    this.masivaAbierta.set(true);
  }

  accion(label: string): void {
    if (label === 'Aplicar') this.aplicar();
  }

  aplicar(): void {
    if (!this.aplicarValido()) return;
    const pct = numero(this.pct());
    const objetivo: ErpLista = this.listaObjetivo() === 'detal' ? 'detal' : 'mayor';
    const skus = this.afectados().map(String);
    const factor = 1 + pct / 100;

    this.productos.update(lista => lista.map(p => skus.includes(p.sku)
      ? {
          ...p,
          precioMayor: objetivo === 'mayor' ? Math.round(p.precioMayor * factor) : p.precioMayor,
          precioDetal: objetivo === 'detal' ? Math.round(p.precioDetal * factor) : p.precioDetal,
        }
      : p));

    this.masivaAbierta.set(false);
    const signo = pct >= 0 ? '+' : '';
    this.toast.success({
      title: 'Precios actualizados',
      description: skus.length + ' referencias actualizadas ' + signo + pct +
        '% en lista ' + this.nombreDe(objetivo) + '.',
      duration: 4_000,
    });
  }

  private nombreDe(lista: ErpLista): string {
    return LISTAS_PRECIOS.find(l => l.value === lista)?.label ?? '';
  }

  private promedioDe(campo: 'precio' | 'margen'): number {
    const filas = this.filas();
    if (!filas.length) return 0;
    return Math.round(filas.reduce((acc, f) => acc + Number(f[campo]), 0) / filas.length);
  }
}`,
    },
  ];
}
