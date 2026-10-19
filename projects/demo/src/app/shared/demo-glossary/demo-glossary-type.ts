import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiremOverlayTrigger } from 'deorta-sirem-ui';
import { glossaryKindLabel } from './demo-glossary';
import type { GlossaryType } from './demo-glossary';

/**
 * Nombre de un tipo del glosario.
 *
 * Si se le pasa la ficha del tipo, al dejar el puntero encima durante
 * `delay` ms (3 s por defecto) abre un overlay con su composición: la
 * definición de la unión o los campos de la interfaz, cada uno con su
 * descripción. Si no hay ficha, se pinta como texto sin más.
 *
 * El overlay reutiliza `siremOverlay` (directiva de la librería) con
 * `siremOverlayTrigger="hover"` y `siremOverlayHoverDelayMs`, la opción que
 * permite exigir una permanencia larga antes de abrir.
 */
@Component({
  selector: 'app-glossary-type',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiremOverlayTrigger],
  template: `
    @let t = type();
    @if (t) {
      <span
        class="cursor-help underline decoration-dotted decoration-1 underline-offset-2"
        [siremOverlay]="tip"
        siremOverlayTrigger="hover"
        [siremOverlayHoverDelayMs]="delay()"
        [siremOverlayHoverHideDelayMs]="250"
        [siremOverlayOffset]="6"
        [siremOverlayPlacement]="placement()"
      >
        <code class="font-mono">{{ label() }}</code>
      </span>

      <ng-template #tip>
        <div
          class="w-[24rem] max-w-[80vw] p-3 text-xs"
          style="
            border-radius: var(--sirem-radius-md);
            border: 1px solid var(--sirem-border);
            background: var(--sirem-surface);
            box-shadow: var(--sirem-shadow-md);
            color: var(--sirem-text);
          "
        >
          <div class="flex flex-wrap items-center gap-2">
            <code class="font-mono text-sm font-semibold">{{ t.name }}</code>
            <span
              class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style="background: var(--sirem-surface-alt); color: var(--sirem-text-muted)"
            >
              {{ glossaryKindLabel(t.kind) }}
            </span>
          </div>

          @if (t.description) {
            <p class="mt-1" style="color: var(--sirem-text-soft)">{{ t.description }}</p>
          }

          @if (t.definition) {
            <code
              class="mt-2 block break-words rounded p-2 font-mono text-[11px]"
              style="background: var(--sirem-surface-alt); color: var(--sirem-text-soft)"
              >{{ t.definition }}</code
            >
          }

          @if (t.values?.length) {
            <ul class="mt-2 space-y-1">
              @for (value of t.values; track value.value) {
                <li class="flex gap-2">
                  <code class="shrink-0 font-mono font-semibold">{{ value.value }}</code>
                  @if (value.description) {
                    <span style="color: var(--sirem-text-soft)">{{ value.description }}</span>
                  }
                </li>
              }
            </ul>
          }

          @if (t.fields?.length) {
            <ul class="mt-2 space-y-1">
              @for (field of t.fields; track field.name) {
                <li class="flex flex-wrap items-baseline gap-1.5">
                  <code class="font-mono font-semibold"
                    >{{ field.name }}{{ field.optional ? '?' : '' }}</code
                  >
                  <code class="font-mono" style="color: var(--sirem-text-muted)">{{
                    field.type
                  }}</code>
                  @if (field.description) {
                    <span style="color: var(--sirem-text-soft)">{{ field.description }}</span>
                  }
                </li>
              }
            </ul>
          }

          @if (!t.definition && !t.values?.length && !t.fields?.length) {
            <p class="mt-1" style="color: var(--sirem-text-muted)">
              Sin composición registrada (tipo opaco).
            </p>
          }
        </div>
      </ng-template>
    } @else {
      <code class="font-mono">{{ label() }}</code>
    }
  `,
})
export class DemoGlossaryType {
  /** Texto a mostrar: normalmente el nombre del tipo. */
  readonly label = input.required<string>();
  /** Ficha del tipo; `null` deja el nombre como texto plano. */
  readonly type = input<GlossaryType | null>(null);
  /** Milisegundos con el puntero encima antes de abrir el overlay. */
  readonly delay = input(3000);
  /** Lado preferido del overlay. */
  readonly placement = input<'top' | 'bottom' | 'bottom-start' | 'left' | 'right'>('bottom-start');

  /** Nombre del tipo de esquema, en castellano. */
  protected readonly glossaryKindLabel = glossaryKindLabel;
}
