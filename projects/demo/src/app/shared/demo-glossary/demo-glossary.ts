import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { API_SECTIONS } from '../../data/demo-api.generated';
import { DemoGlossaryType } from './demo-glossary-type';

/** Una propiedad documentada de un componente, directiva o pipe. */
export interface GlossaryValue {
  /** Valor concreto. */
  value: string;
  /** Qué hace exactamente ese valor. */
  description: string;
}

/** Campo de un objeto que viaja como carga útil (esquema de un Output). */
export interface GlossaryField {
  /** Nombre del campo. */
  name: string;
  /** Tipo tal cual lo declara TypeScript. */
  type: string;
  /** Para qué sirve el campo, si está documentado. */
  description?: string;
  /** `true` si el campo es opcional. */
  optional?: boolean;
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
  /**
   * Esquema de la carga útil de un `Output`: los campos del objeto emitido,
   * con su tipo y su descripción.
   */
  returns?: GlossaryField[];
  /** Descripción del valor emitido cuando no es un objeto con esquema. */
  returnsText?: string;
  /** Marca `true` si la propiedad es obligatoria. */
  required?: boolean;
}

/**
 * Tipo, alias o interfaz que usa un artefacto. Esquema reutilizable: sirve
 * tanto para el bloque «Esquemas y tipos» como para el overlay que aparece
 * al dejar el puntero sobre un nombre de tipo.
 */
export interface GlossaryType {
  /** Nombre del tipo, p. ej. `SiremButtonVariant`. */
  name: string;
  /** Forma del tipo: interfaz, unión de literales o alias. */
  kind: 'interface' | 'union' | 'alias';
  /** Para qué sirve el tipo. */
  description?: string;
  /** Definición literal (uniones y alias), tal cual en TypeScript. */
  definition?: string;
  /** Valores admitidos, si es una unión de literales. */
  values?: GlossaryValue[];
  /** Campos, si es una interfaz. */
  fields?: GlossaryField[];
}

/** Nombre en castellano de la forma de un tipo. */
export function glossaryKindLabel(kind: GlossaryType['kind']): string {
  if (kind === 'interface') return 'interfaz';
  if (kind === 'union') return 'unión';
  return 'alias';
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
  /** Esquemas, tipos e interfaces que usa el artefacto. */
  types?: GlossaryType[];
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
  imports: [DemoGlossaryType],
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
          {{ total() }} propiedades: tipo, valor por defecto, para qué sirven, qué hace cada
          valor y qué devuelve cada output. Debajo, los esquemas, tipos e interfaces que
          usa cada artefacto; deja el puntero 3 s sobre un nombre para ver su composición.
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
                        <app-glossary-type
                          class="text-xs text-slate-600"
                          [label]="entry.type"
                          [type]="typeFor(section, entry.type)"
                        />
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

                        @if (entry.returnsText) {
                          <p class="mt-2 text-xs text-slate-600">
                            <span class="font-semibold text-slate-700">Devuelve:</span>
                            {{ entry.returnsText }}
                          </p>
                        }

                        @if (entry.returns?.length) {
                          <div class="mt-2">
                            <p class="text-xs font-semibold text-slate-700">Devuelve</p>
                            <ul class="mt-1 space-y-1.5">
                              @for (field of entry.returns; track field.name) {
                                <li class="flex flex-wrap items-baseline gap-2 text-xs">
                                  <code
                                    class="shrink-0 rounded px-1.5 py-0.5 font-mono font-semibold"
                                    style="
                                      background: var(--sirem-surface-alt);
                                      color: var(--sirem-text-soft);
                                    "
                                    >{{ field.name }}{{ field.optional ? '?' : '' }}</code
                                  >
                                  <app-glossary-type
                                    class="text-xs text-slate-500"
                                    [label]="field.type"
                                    [type]="typeFor(section, field.type)"
                                  />
                                  @if (field.description) {
                                    <span class="text-slate-600">{{ field.description }}</span>
                                  }
                                </li>
                              }
                            </ul>
                          </div>
                        }

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

            @if (section.types?.length) {
              <div
                class="mt-5 border-t pt-4"
                style="border-color: var(--sirem-border-soft)"
              >
                <h4 class="text-sm font-bold text-slate-900">Esquemas y tipos</h4>
                <p class="mb-3 text-xs text-slate-500">
                  Tipos, alias e interfaces que usa {{ section.name }}. Deja el puntero 3 s
                  sobre un nombre para ver su composición completa.
                </p>
                <div class="grid gap-3 lg:grid-cols-2">
                  @for (type of section.types; track type.name) {
                    <div
                      class="p-3"
                      style="
                        border-radius: var(--sirem-radius-md);
                        border: 1px solid var(--sirem-border-soft);
                        background: var(--sirem-surface-alt);
                      "
                    >
                      <div class="flex flex-wrap items-center gap-2">
                        <app-glossary-type
                          class="text-sm font-semibold text-slate-900"
                          [label]="type.name"
                          [type]="type"
                        />
                        <span
                          class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style="
                            background: var(--sirem-surface);
                            color: var(--sirem-text-muted);
                          "
                        >
                          {{ kindLabel(type.kind) }}
                        </span>
                      </div>

                      @if (type.description) {
                        <p class="mt-1 text-xs text-slate-600">{{ type.description }}</p>
                      }

                      @if (type.definition) {
                        <code
                          class="mt-2 block break-words rounded p-2 font-mono text-[11px] text-slate-600"
                          style="background: var(--sirem-surface)"
                          >{{ type.definition }}</code
                        >
                      }

                      @if (type.values?.length) {
                        <div class="mt-2 flex flex-wrap gap-1">
                          @for (value of type.values; track value.value) {
                            <code
                              class="rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-600"
                              style="background: var(--sirem-surface)"
                              [title]="value.description || value.value"
                              >{{ value.value }}</code
                            >
                          }
                        </div>
                      }

                      @if (type.fields?.length) {
                        <ul class="mt-2 max-h-64 space-y-0.5 overflow-auto pr-1">
                          @for (field of type.fields; track field.name) {
                            <li class="flex flex-wrap items-baseline gap-1.5 text-[11px]">
                              <code class="font-mono font-semibold text-slate-700"
                                >{{ field.name }}{{ field.optional ? '?' : '' }}</code
                              >
                              <app-glossary-type
                                class="text-slate-500"
                                [label]="field.type"
                                [type]="typeFor(section, field.type)"
                              />
                            </li>
                          }
                        </ul>
                      }
                    </div>
                  }
                </div>
              </div>
            }
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

  /** Nombre en castellano de la forma de un tipo (`interfaz`, `unión`, `alias`). */
  protected readonly kindLabel = glossaryKindLabel;

  /**
   * Ficha del tipo que aparece en un texto de tipo (`SiremListItem[]`,
   * `SiremBadgeTone | null`…), si ese tipo pertenece a la sección. Así el
   * nombre se puede enriquecer con el overlay de composición.
   */
  protected typeFor(section: GlossarySection, typeText: string): GlossaryType | null {
    const types = section.types;
    if (!types?.length) return null;
    for (const name of typeText.match(/[A-Z]\w*/g) ?? []) {
      const found = types.find((t) => t.name === name);
      if (found) return found;
    }
    return null;
  }
}
