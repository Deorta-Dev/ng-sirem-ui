import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremCard,
  SiremConfirmDialog,
  SiremEmptyState,
  SiremInput,
  SiremList,
  SiremListItem,
  SiremModal,
  SiremPageHeader,
  SiremRadioGroup,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CUENTAS_TESORERIA, PRODUCTOS, type ErpProducto } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Línea del carrito de venta. */
type LineaCarrito = { producto: ErpProducto; cantidad: number; precio: number };

/**
 * Punto de Venta (POS): facturación ágil en mostrador con búsqueda por
 * código de barras, carrito, cobro con medio de pago y cierre de caja.
 */
@Component({
  selector: 'app-pos-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremCard,
    SiremConfirmDialog,
    SiremEmptyState,
    SiremInput,
    SiremList,
    SiremModal,
    SiremPageHeader,
    SiremRadioGroup,
    SiremSearchField,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Punto de Venta (POS)" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Punto de Venta (POS)"
            subtitle="Facturación ágil en mostrador con carrito, código de barras y caja"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="cerrarCajaAbierto.set(true)">
                Cerrar caja
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <sirem-stat-card label="Caja abierta" [value]="cop(caja())" color="success" />
            <sirem-stat-card label="Ventas del turno" [value]="ventas()" color="info" />
            <sirem-stat-card label="Ticket promedio" [value]="cop(ticketPromedio())" />
          </div>

          <div class="grid gap-5 lg:grid-cols-[1fr_22rem]">
            <div class="flex flex-col gap-4">
              <sirem-search-field
                label="Producto"
                placeholder="Escanea o busca el producto…"
                [(value)]="q"
              />

              <sirem-card title="Catálogo" [subtitle]="encontrados().length + ' producto(s)'">
                @if (resultados().length) {
                  <sirem-list
                    [items]="resultados()"
                    emptyText="Sin productos para esa búsqueda."
                    (itemPressed)="agregar($event)"
                  />
                } @else {
                  <sirem-empty-state
                    title="Sin resultados"
                    description="Ningún SKU o nombre coincide con lo escaneado."
                  />
                }
              </sirem-card>
            </div>

            <sirem-card title="Carrito" [subtitle]="unidades() + ' unidad(es)'">
              @if (lineas().length) {
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="text-xs uppercase text-slate-500 dark:text-slate-400">
                      <tr>
                        <th scope="col" class="py-1 text-left">Producto</th>
                        <th scope="col" class="py-1 text-right">Cantidad</th>
                        <th scope="col" class="py-1 text-right">Valor</th>
                        <th scope="col" class="py-1 text-right"><span class="sr-only">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      @for (linea of lineas(); track linea.producto.id) {
                        <tr>
                          <td class="py-2 pr-2">
                            <p class="font-medium text-slate-800 dark:text-slate-100">{{ linea.producto.nombre }}</p>
                            <p class="text-xs text-slate-500">{{ linea.producto.sku }} · {{ cop(linea.precio) }}</p>
                          </td>
                          <td class="py-2 text-right">
                            <div class="flex items-center justify-end gap-1">
                              <button type="button" (click)="menos(linea.producto.id)" [attr.aria-label]="'Quitar una unidad de ' + linea.producto.nombre"
                                class="h-7 w-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sirem-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">−</button>
                              <span class="w-6 text-center">{{ linea.cantidad }}</span>
                              <button type="button" (click)="mas(linea.producto.id)" [attr.aria-label]="'Agregar una unidad de ' + linea.producto.nombre"
                                class="h-7 w-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sirem-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">+</button>
                            </div>
                          </td>
                          <td class="py-2 text-right font-semibold">{{ cop(linea.cantidad * linea.precio) }}</td>
                          <td class="py-2 text-right">
                            <button type="button" (click)="quitar(linea.producto.id)" [attr.aria-label]="'Quitar ' + linea.producto.nombre + ' del carrito'"
                              class="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:text-rose-400 dark:hover:bg-rose-950">Quitar</button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <div class="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
                  <div class="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span><span>{{ cop(subtotal()) }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>IVA 19%</span><span>{{ cop(iva()) }}</span>
                  </div>
                  <div class="flex justify-between text-base font-semibold text-slate-900 dark:text-slate-100">
                    <span>TOTAL</span><span>{{ cop(total()) }}</span>
                  </div>
                </div>

                <div class="mt-3">
                  <sirem-button [disabled]="!lineas().length" (pressed)="pagoAbierto.set(true)">
                    Cobrar
                  </sirem-button>
                </div>
              } @else {
                <sirem-empty-state
                  title="Carrito vacío"
                  description="Escanea o busca un producto para empezar la venta."
                />
              }
            </sirem-card>
          </div>
        </div>

        <sirem-modal
          [(open)]="pagoAbierto"
          title="Cobrar venta"
          size="sm"
          [actions]="accionesPago"
          (actionPressed)="accionPago($event.label)"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500 dark:text-slate-400">Total a pagar</span>
              <span class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {{ cop(total()) }}
              </span>
            </div>

            <sirem-radio-group-field label="Medio de pago" [options]="medios" [(value)]="medio" />

            <sirem-input-field
              type="number"
              label="Recibido"
              placeholder="0"
              hint="Efectivo entregado en mostrador."
              [(value)]="recibido"
            />

            <p class="text-sm text-slate-600 dark:text-slate-300">Cambio: {{ cop(cambio()) }}</p>
          </div>
        </sirem-modal>

        <sirem-confirm-dialog
          [(open)]="cerrarCajaAbierto"
          title="Cerrar caja"
          message="¿Cerrar la caja del mostrador?"
          detail="Se envía el arqueo a tesorería y no se aceptan más ventas en el turno."
          confirmLabel="Cerrar caja"
          cancelLabel="Cancelar"
          (confirmed)="cerrarCaja()"
        />
      </main>
    </app-page-demo-shell>
  `,
})
export class PosDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Saldo inicial de la caja del mostrador (tesorería id 5). */
  readonly caja = signal(CUENTAS_TESORERIA.find((c) => c.id === 5)?.saldo ?? 0);
  readonly ventas = signal(0);
  readonly acumulado = signal(0);
  readonly numeroVenta = signal(10490);

  readonly q = signal('');
  readonly lineas = signal<LineaCarrito[]>([]);

  readonly pagoAbierto = signal(false);
  readonly cerrarCajaAbierto = signal(false);
  readonly medio = signal<string | number | null>('Efectivo');
  readonly recibido = signal<string | number | (string | number)[] | null>(null);

  readonly medios: SiremSelectOption[] = [
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Transferencia', label: 'Transferencia' },
  ];

  readonly accionesPago = [
    { label: 'Cancelar', variant: 'secondary' as const },
    { label: 'Confirmar venta' },
  ];

  readonly encontrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    if (!texto) return PRODUCTOS;
    return PRODUCTOS.filter((p) => (p.sku + ' ' + p.nombre).toLowerCase().includes(texto));
  });

  readonly resultados = computed<SiremListItem[]>(() =>
    this.encontrados().map((p) => ({
      title: p.nombre,
      subtitle: p.sku,
      meta: this.cop(p.precioDetal),
      badge: 'Agregar',
      badgeTone: 'success' as const,
    })),
  );

  readonly unidades = computed(() => this.lineas().reduce((acc, l) => acc + l.cantidad, 0));

  readonly subtotal = computed(() =>
    this.lineas().reduce((acc, l) => acc + l.cantidad * l.precio, 0),
  );

  readonly iva = computed(() => Math.round(this.subtotal() * 0.19));

  readonly total = computed(() => this.subtotal() + this.iva());

  readonly cambio = computed(() => Math.max(0, (Number(this.recibido()) || 0) - this.total()));

  readonly ticketPromedio = computed(() =>
    this.ventas() ? Math.round(this.acumulado() / this.ventas()) : 0,
  );

  /** Agrega una unidad de la fila del catálogo pulsada. */
  agregar(item: SiremListItem): void {
    const producto = PRODUCTOS.find((p) => p.nombre === item.title);
    if (!producto) return;

    this.lineas.update((lineas) => {
      const existente = lineas.find((l) => l.producto.id === producto.id);
      if (existente) {
        return lineas.map((l) =>
          l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l,
        );
      }
      return [...lineas, { producto, cantidad: 1, precio: producto.precioDetal }];
    });
  }

  mas(id: number): void {
    this.lineas.update((lineas) =>
      lineas.map((l) => (l.producto.id === id ? { ...l, cantidad: l.cantidad + 1 } : l)),
    );
  }

  menos(id: number): void {
    this.lineas.update((lineas) =>
      lineas.map((l) =>
        l.producto.id === id ? { ...l, cantidad: Math.max(1, l.cantidad - 1) } : l,
      ),
    );
  }

  quitar(id: number): void {
    this.lineas.update((lineas) => lineas.filter((l) => l.producto.id !== id));
  }

  accionPago(label: string): void {
    if (label !== 'Confirmar venta') {
      this.pagoAbierto.set(false);
      return;
    }
    this.vender();
  }

  /** Registra la venta, suma a la caja y limpia el carrito. */
  private vender(): void {
    const venta = this.total();
    if (!venta) return;

    this.caja.update((v) => v + venta);
    this.acumulado.update((v) => v + venta);
    this.ventas.update((v) => v + 1);
    this.toast.success({
      title: 'Venta FV-' + this.numeroVenta() + ' generada',
      description: 'Transmitida a la DIAN en modo local.',
      duration: 4_000,
    });
    this.numeroVenta.update((n) => n + 1);

    this.lineas.set([]);
    this.recibido.set(null);
    this.medio.set('Efectivo');
    this.pagoAbierto.set(false);
  }

  /** Cierre de turno: notifica el cuadre de la caja. */
  cerrarCaja(): void {
    this.toast.success({
      title: 'Caja cerrada',
      description: 'Cuadre: ' + this.cop(this.caja()) + ' · arqueo enviado a tesorería.',
      duration: 4_000,
    });
  }

  /** Formato COP con símbolo, sin depender del locale del navegador. */
  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'pos.html',
      language: 'html',
      code: `<sirem-page-header
  title="Punto de Venta (POS)"
  subtitle="Facturación ágil en mostrador con carrito, código de barras y caja">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="cerrarCajaAbierto.set(true)">Cerrar caja</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
  <sirem-stat-card label="Caja abierta" [value]="cop(caja())" color="success" />
  <sirem-stat-card label="Ventas del turno" [value]="ventas()" color="info" />
  <sirem-stat-card label="Ticket promedio" [value]="cop(ticketPromedio())" />
</div>

<div class="grid gap-5 lg:grid-cols-[1fr_22rem]">
  <div class="flex flex-col gap-4">
    <sirem-search-field label="Producto" placeholder="Escanea o busca el producto…" [(value)]="q" />

    <sirem-card title="Catálogo" [subtitle]="encontrados().length + ' producto(s)'">
      @if (resultados().length) {
        <sirem-list [items]="resultados()" emptyText="Sin productos para esa búsqueda."
          (itemPressed)="agregar($event)" />
      } @else {
        <sirem-empty-state title="Sin resultados" description="Ningún SKU o nombre coincide." />
      }
    </sirem-card>
  </div>

  <sirem-card title="Carrito" [subtitle]="unidades() + ' unidad(es)'">
    @for (linea of lineas(); track linea.producto.id) {
      <div class="flex items-center justify-between gap-2 py-1 text-sm">
        <span>{{ linea.producto.nombre }} × {{ linea.cantidad }}</span>
        <span class="flex items-center gap-1">
          <button type="button" (click)="menos(linea.producto.id)"
            [attr.aria-label]="'Quitar una unidad de ' + linea.producto.nombre">−</button>
          <button type="button" (click)="mas(linea.producto.id)"
            [attr.aria-label]="'Agregar una unidad de ' + linea.producto.nombre">+</button>
          <button type="button" (click)="quitar(linea.producto.id)"
            [attr.aria-label]="'Quitar ' + linea.producto.nombre + ' del carrito'">Quitar</button>
        </span>
      </div>
    }

    <p>Subtotal: {{ cop(subtotal()) }}</p>
    <p>IVA 19%: {{ cop(iva()) }}</p>
    <p>TOTAL: {{ cop(total()) }}</p>

    <sirem-button [disabled]="!lineas().length" (pressed)="pagoAbierto.set(true)">Cobrar</sirem-button>
  </sirem-card>
</div>

<sirem-modal [(open)]="pagoAbierto" title="Cobrar venta" size="sm"
  [actions]="accionesPago" (actionPressed)="accionPago($event.label)">
  <sirem-radio-group-field label="Medio de pago" [options]="medios" [(value)]="medio" />
  <sirem-input-field type="number" label="Recibido" placeholder="0" [(value)]="recibido" />
  <p>Cambio: {{ cop(cambio()) }}</p>
</sirem-modal>

<sirem-confirm-dialog [(open)]="cerrarCajaAbierto" title="Cerrar caja"
  message="¿Cerrar la caja del mostrador?" confirmLabel="Cerrar caja"
  (confirmed)="cerrarCaja()" />`,
    },
    {
      name: 'pos.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import { SiremList, SiremListItem, SiremModal, SiremSelectOption } from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CUENTAS_TESORERIA, PRODUCTOS, type ErpProducto } from '../../data/erp-mock';

type LineaCarrito = { producto: ErpProducto; cantidad: number; precio: number };

export class PosPage {
  private readonly toast = inject(DynamicToastService);

  readonly caja = signal(CUENTAS_TESORERIA.find(c => c.id === 5)?.saldo ?? 0);
  readonly ventas = signal(0);
  readonly acumulado = signal(0);
  readonly numeroVenta = signal(10490);

  readonly q = signal('');
  readonly lineas = signal<LineaCarrito[]>([]);
  readonly pagoAbierto = signal(false);
  readonly cerrarCajaAbierto = signal(false);
  readonly medio = signal<string | number | null>('Efectivo');
  readonly recibido = signal<string | number | (string | number)[] | null>(null);

  readonly medios: SiremSelectOption[] = [
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Transferencia', label: 'Transferencia' },
  ];

  readonly accionesPago = [
    { label: 'Cancelar', variant: 'secondary' as const },
    { label: 'Confirmar venta' },
  ];

  readonly encontrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    if (!texto) return PRODUCTOS;
    return PRODUCTOS.filter(p => (p.sku + ' ' + p.nombre).toLowerCase().includes(texto));
  });

  readonly resultados = computed(() =>
    this.encontrados().map(p => ({
      title: p.nombre,
      subtitle: p.sku,
      meta: this.cop(p.precioDetal),
      badge: 'Agregar',
      badgeTone: 'success',
    })),
  );

  readonly unidades = computed(() => this.lineas().reduce((acc, l) => acc + l.cantidad, 0));
  readonly subtotal = computed(() => this.lineas().reduce((acc, l) => acc + l.cantidad * l.precio, 0));
  readonly iva = computed(() => Math.round(this.subtotal() * 0.19));
  readonly total = computed(() => this.subtotal() + this.iva());
  readonly cambio = computed(() => Math.max(0, (Number(this.recibido()) || 0) - this.total()));
  readonly ticketPromedio = computed(() => (this.ventas() ? Math.round(this.acumulado() / this.ventas()) : 0));

  agregar(item: SiremListItem): void {
    const producto = PRODUCTOS.find(p => p.nombre === item.title);
    if (!producto) return;
    this.lineas.update(lineas => {
      const existe = lineas.find(l => l.producto.id === producto.id);
      if (existe) {
        return lineas.map(l => (l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l));
      }
      return [...lineas, { producto, cantidad: 1, precio: producto.precioDetal }];
    });
  }

  mas(id: number): void {
    this.lineas.update(lineas => lineas.map(l => (l.producto.id === id ? { ...l, cantidad: l.cantidad + 1 } : l)));
  }

  menos(id: number): void {
    this.lineas.update(lineas => lineas.map(l =>
      l.producto.id === id ? { ...l, cantidad: Math.max(1, l.cantidad - 1) } : l));
  }

  quitar(id: number): void {
    this.lineas.update(lineas => lineas.filter(l => l.producto.id !== id));
  }

  accionPago(label: string): void {
    if (label !== 'Confirmar venta') {
      this.pagoAbierto.set(false);
      return;
    }
    this.vender();
  }

  private vender(): void {
    const venta = this.total();
    if (!venta) return;
    this.caja.update(v => v + venta);
    this.acumulado.update(v => v + venta);
    this.ventas.update(v => v + 1);
    this.toast.success({
      title: 'Venta FV-' + this.numeroVenta() + ' generada',
      description: 'Transmitida a la DIAN en modo local.',
      duration: 4_000,
    });
    this.numeroVenta.update(n => n + 1);
    this.lineas.set([]);
    this.pagoAbierto.set(false);
  }

  cerrarCaja(): void {
    this.toast.success({
      title: 'Caja cerrada',
      description: 'Cuadre: ' + this.cop(this.caja()) + ' · arqueo enviado a tesorería.',
      duration: 4_000,
    });
  }

  cop(valor: number): string {
    const texto = String(Math.round(valor)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
    return '$' + texto;
  }
}`,
    },
  ];
}
