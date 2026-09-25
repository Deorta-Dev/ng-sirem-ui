/**
 * Caja única de todos los campos del design system.
 *
 * Fuente de verdad del borde (`slate-300`, `red-400` en error) y del resto
 * del chrome del input. Todos los fields (`sirem-input-field`, `sirem-textarea-field`,
 * `sirem-select-field`, `sirem-datepicker-field`, `sirem-search-field`, `sirem-date-field`…)
 * la usan para que el borde sea idéntico en toda la librería.
 *
 * Los literales completos viven aquí para que Tailwind los detecte;
 * `extra` solo añade tamaños/paddings (también literales en cada llamada).
 */
export const SIREM_FIELD_BOX =
  'w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:outline-2 focus:outline-sirem-600 disabled:bg-slate-100 disabled:text-slate-500';

export function siremFieldBox(invalid: boolean, extra = ''): string {
  const tone = invalid ? 'border-red-400' : 'border-slate-300';
  return extra ? `${SIREM_FIELD_BOX} ${tone} ${extra}` : `${SIREM_FIELD_BOX} ${tone}`;
}
