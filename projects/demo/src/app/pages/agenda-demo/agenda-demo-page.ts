import { Component, computed, signal } from '@angular/core';
import {
  SiremAgenda,
  type SiremAgendaEvent,
  type SiremAgendaMode,
  type SiremAgendaSlot,
} from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

/** Lunes de la semana en curso. */
const today = new Date();
today.setHours(0, 0, 0, 0);
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

/** Fecha de la semana en curso a una hora concreta. */
const at = (dayOffset: number, hour: number, minute = 0): Date => {
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

@Component({
  selector: 'app-agenda-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremAgenda],
  template: `
    <app-demo-page-layout
      title="Agenda"
      category="Agenda"
      subtitle="sirem-agenda — día, semana, mes y lista sobre la misma fuente de eventos. El selector es segmented y la navegación, date-chip."
    >
      <app-demo-variant-card
        title="Semana completa"
        description="Celdas de 64 px por hora, cabecera de chips, franja de todo el día, solapes en columnas e indicador de la hora actual. Sin scroll interno: fluye con la página."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <sirem-agenda
          class="w-full"
          [events]="citas"
          [(mode)]="modoSemana"
          [(date)]="diaSemana"
          (eventPressed)="ultimo.set($event.title)"
          (slotPressed)="hueco.set($event)"
        />
        <p class="text-sm text-slate-600">
          Último evento: {{ ultimo() || '—' }} · Hueco: {{ huecoLabel() }}
        </p>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Cabeceras fijas al hacer scroll"
        description="sticky='both' pega la barra y la fila de días bajo el header del catálogo. Cada cabecera define su fondo, su blur y su alto por separado en reposo y ya pegada."
        [htmlCode]="h2"
        [tsCode]="t1"
      >
        <sirem-agenda
          class="w-full"
          [events]="citas"
          [(mode)]="modoSticky"
          [(date)]="diaSemana"
          sticky="both"
          stickyOffset="4rem"
          [stickyGap]="4"
          toolbarBackgroundStuck="color-mix(in srgb, var(--sirem-surface) 78%, transparent)"
          [toolbarBlurStuck]="12"
          [toolbarStickyHeight]="56"
          daysBackgroundStuck="color-mix(in srgb, var(--sirem-surface) 84%, transparent)"
          [daysBlurStuck]="10"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Día con el riel de la semana"
        description="Una columna con celdas de 72 px y los siete chips delante para moverse entre días; solo la fila de días se pega."
        [htmlCode]="h3"
        [tsCode]="t1"
      >
        <sirem-agenda
          class="w-full"
          [events]="citas"
          [(mode)]="modoDia"
          [(date)]="diaDia"
          sticky="days"
          stickyOffset="4rem"
          [hourHeight]="72"
          [startHour]="8"
          [endHour]="19"
          (slotPressed)="hueco.set($event)"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Mes"
        description="Chips por día con el tono del evento y «+N más» cuando no caben; los días de la semana quedan fijos."
        [htmlCode]="h4"
        [tsCode]="t1"
      >
        <sirem-agenda
          class="w-full"
          [events]="citas"
          [(mode)]="modoMes"
          [(date)]="diaMes"
          sticky="days"
          stickyOffset="4rem"
          [maxPerDay]="2"
          (eventPressed)="ultimo.set($event.title)"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Lista (agenda)"
        description="Días con eventos agrupados, con la hora, el lugar y la etiqueta de cada cita; cada cabecera de día se pega."
        [htmlCode]="h5"
        [tsCode]="t1"
      >
        <sirem-agenda
          class="w-full"
          [events]="citas"
          [(mode)]="modoLista"
          [(date)]="diaLista"
          sticky="days"
          stickyOffset="4rem"
          [listDays]="21"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Modos limitados y jornada corta"
        description="modes deja solo semana y mes; startHour/endHour recortan la rejilla a la jornada real."
        [htmlCode]="h6"
        [tsCode]="t1"
      >
        <sirem-agenda
          class="w-full"
          [events]="citas"
          [(mode)]="modoLimitado"
          [(date)]="diaSemana"
          [modes]="['week', 'month']"
          [startHour]="9"
          [endHour]="18"
          [hourHeight]="72"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Responsive"
        description="En 20rem la agenda oculta la vista de semana, pasa a modo compacto y en el mes deja solo puntos."
        [htmlCode]="h7"
        [tsCode]="t1"
      >
        <div class="w-[20rem] max-w-full">
          <sirem-agenda [events]="citas" [(mode)]="modoCompacto" [(date)]="diaSemana" />
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class AgendaDemoPage {
  readonly modoSemana = signal<SiremAgendaMode>('week');
  readonly modoSticky = signal<SiremAgendaMode>('week');
  readonly modoDia = signal<SiremAgendaMode>('day');
  readonly modoMes = signal<SiremAgendaMode>('month');
  readonly modoLista = signal<SiremAgendaMode>('list');
  readonly modoLimitado = signal<SiremAgendaMode>('week');
  readonly modoCompacto = signal<SiremAgendaMode>('week');

  readonly diaSemana = signal(new Date());
  readonly diaDia = signal(new Date());
  readonly diaMes = signal(new Date());
  readonly diaLista = signal(new Date());

  readonly ultimo = signal('');
  readonly hueco = signal<SiremAgendaSlot | null>(null);

  readonly huecoLabel = computed(() => {
    const slot = this.hueco();
    if (!slot) return '—';
    const weekday = slot.date.toLocaleDateString('es-ES', { weekday: 'long' });
    return `${weekday} ${slot.hour}:${String(slot.minute).padStart(2, '0')}`;
  });

  readonly citas: SiremAgendaEvent[] = [
    {
      id: 'c1',
      title: 'Revisión de historias',
      start: at(0, 9, 0),
      end: at(0, 9, 45),
      tone: 'sage',
      location: 'Sala 1',
      meta: 'Óptica',
    },
    {
      id: 'c2',
      title: 'Cirugía refractiva',
      start: at(0, 11, 0),
      end: at(0, 12, 30),
      tone: 'brand',
      location: 'Quirófano',
    },
    {
      id: 'c3',
      title: 'Llamada con proveedor',
      start: at(0, 11, 30),
      end: at(0, 12, 0),
      tone: 'warning',
      location: 'Despacho',
    },
    {
      id: 'c4',
      title: 'Control postoperatorio',
      start: at(1, 10, 0),
      end: at(1, 11, 0),
      tone: 'success',
      location: 'Consulta 2',
    },
    {
      id: 'c5',
      title: 'Congreso de optometría',
      start: at(2, 0, 0),
      end: at(5, 0, 0),
      allDay: true,
      tone: 'accent',
    },
    {
      id: 'c6',
      title: 'Formación interna',
      start: at(2, 15, 0),
      end: at(2, 16, 30),
      tone: 'sage',
      location: 'Aula',
      meta: 'Equipo',
    },
    {
      id: 'c7',
      title: 'Topografía corneal',
      start: at(3, 8, 30),
      end: at(3, 9, 30),
      tone: 'brand',
      location: 'Gabinete 3',
    },
    {
      id: 'c8',
      title: 'Reunión de equipo',
      start: at(4, 12, 0),
      end: at(4, 13, 0),
      tone: 'muted',
      location: 'Sala 1',
      meta: 'Equipo',
    },
    {
      id: 'c9',
      title: 'Revisión de stock',
      start: at(4, 17, 0),
      end: at(4, 17, 45),
      tone: 'danger',
      location: 'Almacén',
    },
  ];

  readonly h1 = `<sirem-agenda
  [events]="citas"
  [(mode)]="modo"
  [(date)]="dia"
  (eventPressed)="abrir($event)"
  (slotPressed)="nuevaCita($event)"
/>`;

  readonly h2 = `<sirem-agenda
  [events]="citas"
  sticky="both"
  stickyOffset="4rem"
  [stickyGap]="4"
  [toolbarStickyHeight]="56"
  toolbarBackgroundStuck="color-mix(in srgb, var(--sirem-surface) 78%, transparent)"
  [toolbarBlurStuck]="12"
  daysBackgroundStuck="color-mix(in srgb, var(--sirem-surface) 84%, transparent)"
  [daysBlurStuck]="10"
/>`;

  readonly h3 = `<sirem-agenda [events]="citas" [(mode)]="vista" [(date)]="dia"
  sticky="days" stickyOffset="4rem"
  [hourHeight]="72" [startHour]="8" [endHour]="19" />`;

  readonly h4 = `<sirem-agenda [events]="citas" [(mode)]="vista"
  [(date)]="dia" sticky="days" [maxPerDay]="2" />`;

  readonly h5 = `<sirem-agenda [events]="citas" [(mode)]="vista"
  [(date)]="dia" sticky="days" [listDays]="21" />`;

  readonly h6 = `<sirem-agenda [events]="citas" [modes]="['week', 'month']"
  [startHour]="9" [endHour]="18" [hourHeight]="72" />`;

  readonly h7 = `<!-- Por debajo de 40rem la agenda oculta la semana
     y compacta el resto de vistas. -->\n<div class="w-[20rem]">\n  <sirem-agenda [events]="citas" [(mode)]="modo" [(date)]="dia" />\n</div>`;

  readonly t1 = `import { SiremAgenda, type SiremAgendaEvent } from '@deorta-dev/ng-sirem-ui';

readonly citas: SiremAgendaEvent[] = [
  { title: 'Revisión', start: '2026-10-19T09:00', end: '2026-10-19T09:45',
    tone: 'sage', location: 'Sala 1' },
  { title: 'Cirugía', start: new Date(2026, 9, 19, 11), end: new Date(2026, 9, 19, 12, 30),
    tone: 'brand' },
  { title: 'Congreso', start: '2026-10-21T00:00', end: '2026-10-24T00:00',
    allDay: true, tone: 'accent' },
];

// Scroll: la agenda sigue el flujo de la página.
// sticky: 'none' | 'toolbar' | 'days' | 'both'
// Cada cabecera (toolbar*/days*) tiene fondo, blur y alto de sticky propios,
// en reposo y ya pegada: *Background, *BackgroundStuck, *Blur, *BlurStuck
// y *StickyHeight.`;
}
