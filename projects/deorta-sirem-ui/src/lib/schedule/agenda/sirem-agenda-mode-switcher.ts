import { Component, computed, input, model, output } from '@angular/core';
import {
  SiremSegmented,
  type SiremSegmentedItem,
} from '../../navigation/segmented/sirem-segmented';
import type { SiremAgendaMode } from './sirem-agenda-types';

/**
 * Selector de vistas de la agenda (`sirem-agenda-mode-switcher`).
 *
 * Permite conmutar el modo de visualización entre día, semana, mes y lista
 * para sincronizar tanto el cuerpo de la agenda como el navegador de fechas.
 *
 * Uso:
 * ```html
 * <sirem-agenda-mode-switcher [(mode)]="vista" />
 * ```
 */
@Component({
  selector: 'sirem-agenda-mode-switcher',
  standalone: true,
  imports: [SiremSegmented],
  styleUrl: './sirem-agenda-mode-switcher.scss',
  template: `
    <div class="sirem-agenda-mode-switcher">
      <sirem-segmented
        [items]="modeItems()"
        [value]="mode()"
        (valueChange)="setMode($event)"
        [size]="compact() ? 'sm' : size()"
        [ariaLabel]="ariaLabel()"
      />
    </div>
  `,
})
export class SiremAgendaModeSwitcher {
  /** Vista activa en doble vía (`day`, `week`, `month`, `list`). */
  readonly mode = model<SiremAgendaMode>('week');
  /** Vistas disponibles en el selector. */
  readonly modes = input<SiremAgendaMode[]>(['day', 'week', 'month', 'list']);
  /** Tamaño compacto para anchos reducidos. */
  readonly compact = input(false);
  /** Tamaño del control segmented (`sm` o `md`). */
  readonly size = input<'sm' | 'md'>('md');
  /** Etiqueta de accesibilidad del grupo. */
  readonly ariaLabel = input('Vista de agenda');

  /** Se emite cuando cambia la vista. */
  readonly modeChange = output<SiremAgendaMode>();

  readonly availableModes = computed<SiremAgendaMode[]>(() => {
    const list = this.modes();
    const filtered = this.compact() ? list.filter((m) => m !== 'week') : list;
    return filtered.length ? filtered : ['day'];
  });

  readonly modeItems = computed<SiremSegmentedItem[]>(() => {
    const labels: Record<SiremAgendaMode, { label: string; icon: string }> = {
      day: { label: 'Día', icon: 'fi fi-rr-calendar-day' },
      week: { label: 'Semana', icon: 'fi fi-rr-calendar-days' },
      month: { label: 'Mes', icon: 'fi fi-rr-calendar-lines' },
      list: { label: 'Agenda', icon: 'fi fi-rr-list' },
    };
    return this.availableModes().map((m) => ({ value: m, ...labels[m] }));
  });

  setMode(value: string | null): void {
    if (!value) return;
    const next = value as SiremAgendaMode;
    if (next !== this.mode()) {
      this.mode.set(next);
      this.modeChange.emit(next);
    }
  }
}
