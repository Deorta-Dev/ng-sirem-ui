import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { API_SECTIONS } from '../../data/demo-api.generated';

/** Una propiedad documentada de un componente, directiva o pipe. */
export interface GlossaryValue {
  /** Valor concreto. */
  value: string;
  /** Qué hace exactamente ese valor. */
  description: string;
}

/** Fila del glosario: una propiedad (input, output, método o pipe). */
export interface GlossaryEntry {
  /** Nombre de la propiedad, sin paréntesis. */
  name: string;
  /** Clase de la API: `Input`, `Output`, `Method` o `Pipe`. */
  kind: 'Input' | 'Output' | 'Method' | 'Pipe';
  /** Tipo tal cual lo declara TypeScript. */
  type: string;
  /** Valor por defecto, si tiene. */
  default?: string;
  /** Para qué sirve la propiedad. */
  description: string;
  /**
   * Valores posibles y qué hace cada uno. Es lo que se rellena a mano: el
   * tipo da los valores, pero su comportamiento no se puede deducir.
   */
  values?: GlossaryValue[];
  /** Marca `true` si la propiedad es obligatoria. */
  required?: boolean;
}

/** Bloque del glosario: suele haber uno por cada artefacto del catálogo. */
export interface GlossarySection {
  /** Nombre del artefacto, p. ej. `SiremCard`. */
  name: string;
  /** Selector oPipe, para orientarse. */
  selector?: string;
  /** Slug de la página de demo donde vive (`/demo/<slug>`). */
  slug?: string;
  /** Slugs adicionales, para agrupar piezas de un mismo artefacto. */
  extraSlugs?: string[];
  /** Resumen de una línea. */
  summary?: string;
  entries: GlossaryEntry[];
}

/**
 * Glosario de API que se añade al final de cada página de demo.
 *
 * Muestra, por artefacto, todas sus propiedades con su tipo, su valor por
 * defecto, para qué sirven y qué hace cada valor posible.
 *
 * No hay que pasarle nada: si no se indica `slug`, lo deduce de la ruta
 * (`/demo/<slug>`), de modo que todas las páginas lo obtienen sin cableado.
 */
@Component({
  selector: 'app-demo-glossary',
  standalone: true,
  template: `
    @if (active().length) {
      <section class="mt-12 px-4 py-8 md:px-8" aria-labelledby="glosario-titulo">
        <h2
          id="glosario-titulo"
          class="mb-1 text-lg font-extrabold text-slate-900"
        >
          Glosario de API
        </h2>
        <p class="mb-5 text-sm text-slate-600">
          {{ total() }} propiedades: tipo, valor por defecto, para qué sirven y qué hace cada
          valor.
        </p>

        @for (section of active(); track section.name) {
          <div
            class="mb-5 border p-5"
            style="
              border-radius: var(--sirem-radius-lg);
              border-color: var(--sirem-border-soft);
              background: var(--sirem-surface);
              box-shadow: var(--sirem-shadow-xs);
            "
          >
            <h3 class="font-mono text-sm font-bold text-slate-900">
              {{ section.name }}
              @if (section.selector) {
                <span class="ml-2 font-sans text-xs font-normal text-slate-500">
                  {{ section.selector }}
                </span>
              }
            </h3>
            @if (section.summary) {
              <p class="mt-1 text-sm text-slate-600">{{ section.summary }}</p>
            }

            <div class="mt-4 overflow-x-auto">
              <table class="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead>
                  <tr
                    class="border-b text-xs uppercase tracking-wide text-slate-500"
                    style="border-color: var(--sirem-border-soft)"
                  >
                    <th class="py-2 pr-3 font-semibold">Propiedad</th>
                    <th class="py-2 pr-3 font-semibold">Tipo</th>
                    <th class="py-2 pr-3 font-semibold">Por defecto</th>
                    <th class="py-2 font-semibold">Para qué sirve</th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of section.entries; track entry.name) {
                    <tr
                      class="border-b align-top last:border-b-0"
                      style="border-color: var(--sirem-border-soft)"
                    >
                      <td class="py-3 pr-3">
                        <code class="font-mono text-xs font-semibold text-slate-900">
                          {{ entry.name }}
                        </code>
                        <span
                          class="ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                          style="
                            background: var(--sirem-tint-bg);
                            color: var(--sirem-tint-text);
                          "
                        >
                          {{ entry.kind }}
                        </span>
                        @if (entry.required) {
                          <span
                            class="ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                            style="
                              background: var(--sirem-tint-danger-bg);
                              color: var(--sirem-tint-danger-text);
                            "
                            >obligatorio</span
                          >
                        }
                      </td>
                      <td class="py-3 pr-3">
                        <code class="font-mono text-xs text-slate-600">{{ entry.type }}</code>
                      </td>
                      <td class="py-3 pr-3">
                        @if (entry.default !== undefined) {
                          <code class="font-mono text-xs text-slate-600">{{
                            entry.default
                          }}</code>
                        } @else {
                          <span class="text-xs text-slate-400">—</span>
                        }
                      </td>
                      <td class="py-3">
                        <p class="text-slate-700">{{ entry.description }}</p>

                        @if (entry.values?.length) {
                          <ul class="mt-2 space-y-1.5">
                            @for (v of entry.values; track v.value) {
                              <li class="flex gap-2 text-xs">
                                <code
                                  class="shrink-0 rounded px-1.5 py-0.5 font-mono font-semibold"
                                  style="
                                    background: var(--sirem-surface-alt);
                                    color: var(--sirem-text-soft);
                                  "
                                  >{{ v.value }}</code
                                >
                                <span class="text-slate-600">{{ v.description }}</span>
                              </li>
                            }
                          </ul>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class DemoGlossary {
  /**
   * Secciones a mostrar. Si se omite, se resuelven por el `slug` de la ruta,
   * de forma que la página no tiene que saber nada del glosario.
   */
  readonly sections = input<GlossarySection[] | null>(null);
  /** Slug explícito; por defecto se toma de la URL. */
  readonly slug = input<string | null>(null);

  private readonly router = inject(Router);

  /** Slug efectivo: el explícito o el último segmento de la ruta. */
  private readonly activeSlug = computed(() => {
    const explicit = this.slug();
    if (explicit) return explicit;
    const segments = this.router.url.split('?')[0].split('/').filter(Boolean);
    return segments[segments.length - 1] ?? '';
  });

  /** Sección que corresponde a la página actual. */
  readonly active = computed<GlossarySection[]>(() => {
    const provided = this.sections();
    if (provided) return provided;
    const slug = this.activeSlug();
    const found = API_SECTIONS.filter(
      (s) => s.slug === slug || s.extraSlugs?.includes(slug),
    );
    return found;
  });

  /** Número total de propiedades documentadas. */
  readonly total = computed(() =>
    this.active().reduce((acc, s) => acc + s.entries.length, 0),
  );
}
