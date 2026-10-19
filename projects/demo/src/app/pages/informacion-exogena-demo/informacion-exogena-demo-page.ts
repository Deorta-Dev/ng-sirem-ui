import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremCardList, SiremCardListField, SiremInput, SiremModal, SiremModalAction,
  SiremPageHeader, SiremSearchField, SiremSelectOption, SiremStatCard,
  SiremTimeline, SiremTimelineItem,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { FORMATOS_TRIBUTARIOS, type ErpFormatoTributario } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados del ciclo de vida de un formato tributario. */
const ESTADOS: ErpFormatoTributario['estado'][] = ['Pendiente', 'Generado', 'Presentado'];

/** Información exógena: archivos base para impuestos y medios magnéticos. */
@Component({
  selector: 'app-informacion-exogena-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremCardList, SiremInput, SiremModal, SiremPageHeader,
    SiremSearchField, SiremStatCard, SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Información exógena" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Información exógena / reportes tributarios" subtitle="Generación de archivos base para impuestos y medios magnéticos">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" (pressed)="generarSeleccionados()">Generar seleccionado</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-3">
            <sirem-stat-card label="Pendientes" [value]="pendientes()" color="warning" />
            <sirem-stat-card label="Generados" [value]="generados()" color="info" />
            <sirem-stat-card label="Presentados" [value]="presentados()" color="success" />
          </div>

          <div class="grid gap-3 md:grid-cols-[13rem_1fr]">
            <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
            <sirem-search-field placeholder="Buscar por código o nombre…" [(value)]="q" />
          </div>

          <sirem-card-list
            [items]="filas()"
            titleKey="nombre"
            subtitleKey="codigo"
            badgeKey="estado"
            [badgeTones]="tonos"
            [fields]="campos"
            [selectable]="true"
            [(selection)]="seleccion"
            (itemPressed)="abrir($event)"
          />
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" [actions]="acciones()" (actionPressed)="accion($event.label)">
          @if (detalle(); as formato) {
            <dl class="grid gap-3 sm:grid-cols-2">
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Código DIAN</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ formato.codigo }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Periodo</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ formato.periodo }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Registros</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ formato.registros }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ formato.estado }}</dd></div>
            </dl>
            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Proceso del formato</p>
            <sirem-timeline [items]="proceso()" />
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class InformacionExogenaDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable de los formatos (generar cambia el estado local). */
  readonly formatos = signal<ErpFormatoTributario[]>(FORMATOS_TRIBUTARIOS.map((f) => ({ ...f })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly seleccion = signal<number[]>([]);
  readonly detalleAbierto = signal(false);
  readonly seleccionado = signal<ErpFormatoTributario | null>(null);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map((e) => ({ value: e, label: e }));

  readonly tonos: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
    Pendiente: 'warning',
    Generado: 'info',
    Presentado: 'success',
  };

  readonly campos: SiremCardListField[] = [
    { key: 'periodo', label: 'Periodo', icon: 'fi fi-rr-calendar' },
    { key: 'registros', label: 'Registros', icon: 'fi fi-rr-list' },
  ];

  readonly filas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.formatos()
      .filter((f) => {
        const coincide = !texto || (f.codigo + ' ' + f.nombre).toLowerCase().includes(texto);
        return coincide && (!estado || f.estado === estado);
      })
      .map((f) => ({
        id: f.id, codigo: f.codigo, nombre: f.nombre,
        periodo: f.periodo, estado: f.estado, registros: f.registros,
      }));
  });

  readonly pendientes = computed(() => this.formatos().filter((f) => f.estado === 'Pendiente').length);
  readonly generados = computed(() => this.formatos().filter((f) => f.estado === 'Generado').length);
  readonly presentados = computed(() => this.formatos().filter((f) => f.estado === 'Presentado').length);

  readonly detalle = computed(() => this.seleccionado());
  readonly detalleTitulo = computed(() => {
    const f = this.seleccionado();
    return f ? 'Formato ' + f.codigo : 'Formato tributario';
  });
  readonly acciones = computed<SiremModalAction[]>(() => [
    { label: 'Cerrar', variant: 'secondary' },
    { label: 'Generar archivo', disabled: this.seleccionado()?.estado !== 'Pendiente' },
  ]);

  abrir(fila: Record<string, unknown>): void {
    const formato = this.formatos().find((f) => f.id === fila['id']);
    if (!formato) return;
    this.seleccionado.set(formato);
    this.detalleAbierto.set(true);
  }

  /** Pasos del proceso recorridos según el estado actual. */
  proceso(): SiremTimelineItem[] {
    const f = this.seleccionado();
    if (!f) return [];
    const pasos: SiremTimelineItem[] = [
      { title: 'Definición del formato', description: 'Estructura DIAN ' + f.codigo + ' cargada en el sistema.', time: f.periodo, tone: 'success' },
      { title: 'Extracción de datos', description: 'Lectura de los libros contables del periodo.', time: f.periodo, tone: 'info' },
      { title: 'Validación', description: 'Reglas de consistencia del medio magnético.', time: f.periodo, tone: 'info' },
      { title: 'Presentación', description: 'Radicado del archivo ante la DIAN.', time: f.periodo, tone: 'success' },
    ];
    const avance = f.estado === 'Pendiente' ? 1 : f.estado === 'Generado' ? 3 : 4;
    return pasos.slice(0, avance);
  }

  accion(label: string): void {
    if (label === 'Cerrar') {
      this.detalleAbierto.set(false);
      return;
    }
    const f = this.seleccionado();
    if (f) this.generar(f.id);
  }

  /** Genera todos los formatos pendientes marcados en la lista. */
  generarSeleccionados(): void {
    const filas = this.filas();
    const pendientes = this.seleccion().map((i) => filas[i]).filter((f) => f.estado === 'Pendiente');
    if (!pendientes.length) {
      this.toast.info({ title: 'Nada que generar', description: 'Selecciona al menos un formato pendiente.', duration: 3_000 });
      return;
    }
    for (const fila of pendientes) this.generar(fila.id);
  }

  /** Simula el trabajo del archivo: toast de inicio y de cierre. */
  private generar(id: number): void {
    const formato = this.formatos().find((f) => f.id === id);
    if (!formato || formato.estado !== 'Pendiente') return;

    const registros = (formato.registros || 1842).toLocaleString('es-CO');
    this.toast.info({
      title: 'Generando ' + formato.codigo + '…',
      description: 'Extrayendo ' + registros + ' registros de ' + formato.nombre.toLowerCase() + '.',
      duration: 3_000,
    });

    setTimeout(() => {
      const generado = { estado: 'Generado' as const, registros: formato.registros || 1842 };
      this.formatos.update((lista) => lista.map((f) => (f.id === id ? { ...f, ...generado } : f)));
      this.seleccionado.update((f) => (f && f.id === id ? { ...f, ...generado } : f));
      this.toast.success({
        title: 'Formato ' + formato.codigo + ' generado',
        description: 'Archivo listo para presentar en la DIAN.',
        duration: 4_000,
      });
    }, 800);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'informacion-exogena.html',
      language: 'html',
      code: `<sirem-page-header title="Información exógena / reportes tributarios"
  subtitle="Generación de archivos base para impuestos y medios magnéticos">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" (pressed)="generarSeleccionados()">Generar seleccionado</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-3">
  <sirem-stat-card label="Pendientes" [value]="pendientes()" color="warning" />
  <sirem-stat-card label="Generados" [value]="generados()" color="info" />
  <sirem-stat-card label="Presentados" [value]="presentados()" color="success" />
</div>

<div class="grid gap-3 md:grid-cols-[13rem_1fr]">
  <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
  <sirem-search-field placeholder="Buscar por código o nombre…" [(value)]="q" />
</div>

<sirem-card-list
  [items]="filas()"
  titleKey="nombre"
  subtitleKey="codigo"
  badgeKey="estado"
  [badgeTones]="tonos"
  [fields]="campos"
  [selectable]="true"
  [(selection)]="seleccion"
  (itemPressed)="abrir($event)"
/>

<sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as formato) {
    <p>Código DIAN {{ formato.codigo }} · periodo {{ formato.periodo }}</p>
    <p>Registros {{ formato.registros }} · estado {{ formato.estado }}</p>
    <sirem-timeline [items]="proceso()" />
  }
</sirem-modal>`,
    },
    {
      name: 'informacion-exogena.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import { SiremCardList, SiremModal, SiremTimeline, type SiremModalAction } from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { FORMATOS_TRIBUTARIOS, type ErpFormatoTributario } from '../../data/erp-mock';

export class InformacionExogenaPage {
  private readonly toast = inject(DynamicToastService);

  readonly formatos = signal<ErpFormatoTributario[]>(FORMATOS_TRIBUTARIOS.map(f => ({ ...f })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly seleccion = signal<number[]>([]);
  readonly seleccionado = signal<ErpFormatoTributario | null>(null);

  readonly filas = computed(() =>
    this.formatos().filter(f => !this.estado() || f.estado === this.estado()),
  );

  readonly pendientes = computed(() =>
    this.formatos().filter(f => f.estado === 'Pendiente').length,
  );

  readonly acciones = computed<SiremModalAction[]>(() => [
    { label: 'Cerrar', variant: 'secondary' },
    { label: 'Generar archivo', disabled: this.seleccionado()?.estado !== 'Pendiente' },
  ]);

  /** Cambia Pendiente -> Generado con toast de inicio y de cierre. */
  generar(id: number): void {
    const formato = this.formatos().find(f => f.id === id);
    if (!formato || formato.estado !== 'Pendiente') return;

    this.toast.info({
      title: 'Generando ' + formato.codigo + '...',
      description: 'Extrayendo registros del periodo.',
      duration: 3_000,
    });

    setTimeout(() => {
      this.formatos.update(lista =>
        lista.map((f): ErpFormatoTributario =>
          f.id === id ? { ...f, estado: 'Generado' } : f,
        ),
      );
      this.toast.success({
        title: 'Formato ' + formato.codigo + ' generado',
        description: 'Archivo listo para presentar en la DIAN.',
        duration: 4_000,
      });
    }, 800);
  }
}`,
    },
  ];
}
