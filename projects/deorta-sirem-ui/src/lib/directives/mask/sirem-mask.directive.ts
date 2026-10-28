import {
  Directive,
  ElementRef,
  HostListener,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

/** Configuración avanzada de la máscara para inputs. */
export interface SiremMaskConfig {
  /** Patrón de máscara con tokens (ej. '00/00/0000', '(000) 000-0000') o RegExp. */
  pattern: string | RegExp;
  /** Mapa personalizado de tokens comodín a RegExp. */
  tokens?: Record<string, RegExp>;
  /** Si es true, el valor sin caracteres fijos se sincroniza. */
  unmask?: boolean;
}

/** Patrón de máscara: texto con tokens, RegExp o configuración avanzada. */
export type SiremMaskPattern = string | RegExp | SiremMaskConfig;

const DEFAULT_TOKENS: Record<string, RegExp> = {
  '0': /\d/,
  a: /[a-zA-Z]/,
  A: /[A-Z]/,
  '*': /[a-zA-Z0-9]/,
};

/**
 * Directiva de máscara para campos de texto `<input>` (`siremMask`).
 *
 * Admite máscaras estructuradas con tokens comodín (`00/00/0000`, `(000) 000-0000`)
 * o expresiones regulares (`/^[0-9]*$/`).
 *
 * ## Tokens por defecto:
 * - `0`: Cualquier dígito (0–9).
 * - `a`: Cualquier letra (a–z, A–Z).
 * - `A`: Letras mayúsculas.
 * - `*`: Alfanumérico.
 *
 * Caracteres literales (como `/`, `-`, `(`, `)`, `.`, espacio) se insertan
 * automáticamente al escribir y se respetan al borrar.
 *
 * ## Uso:
 * ```html
 * <!-- Fecha con formato dd/mm/aaaa -->
 * <input siremMask="00/00/0000" placeholder="dd/mm/aaaa" />
 *
 * <!-- Teléfono internacional -->
 * <input siremMask="(000) 000-0000" />
 *
 * <!-- Filtro por expresión regular (solo números y letras) -->
 * <input [siremMask]="regexAlfanumerico" />
 *
 * <!-- Con objeto de configuración y tokens personalizados -->
 * <input [siremMask]="{ pattern: 'AAA-0000', tokens: { 'A': /[A-Z]/ } }" />
 * ```
 */
@Directive({
  selector: 'input[siremMask]',
  standalone: true,
})
export class SiremMaskDirective {
  /** Patrón de máscara (string con tokens, RegExp o configuración). */
  readonly siremMask = input<SiremMaskPattern | null>(null);
  /** Emite el valor limpio sin caracteres separadores fijos. */
  readonly siremMaskUnmask = input(false, { transform: booleanAttribute });
  /** Mapa de tokens adicionales o de reemplazo. */
  readonly siremMaskTokens = input<Record<string, RegExp>>({});

  /** Emite el valor con formato de máscara aplicado. */
  readonly maskedChange = output<string>();
  /** Emite el valor crudo/limpio sin caracteres literales de máscara. */
  readonly rawChange = output<string>();

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  constructor() {
    effect(() => {
      const pattern = this.siremMask();
      const input = this.el.nativeElement;
      if (pattern && input.value) {
        this.applyMask();
      }
    });
  }

  @HostListener('input', ['$event'])
  onInput(event?: Event): void {
    this.applyMask();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const input = this.el.nativeElement;
      const maskStr = this.getMaskString();
      if (!maskStr) return;

      const { selectionStart, selectionEnd } = input;
      if (selectionStart !== null && selectionStart === selectionEnd && selectionStart > 0) {
        const charBefore = input.value[selectionStart - 1];
        const isLiteral = !this.isTokenChar(maskStr[selectionStart - 1]);
        if (isLiteral) {
          event.preventDefault();
          // Saltar o borrar el literal y el dígito anterior
          let deleteIndex = selectionStart - 1;
          while (deleteIndex > 0 && !this.isTokenChar(maskStr[deleteIndex])) {
            deleteIndex--;
          }
          const val = input.value;
          input.value = val.slice(0, deleteIndex) + val.slice(selectionStart);
          input.setSelectionRange(deleteIndex, deleteIndex);
          this.applyMask();
        }
      }
    }
  }

  /** Aplica el formateo de máscara al valor actual del input. */
  applyMask(): void {
    const input = this.el.nativeElement;
    const config = this.resolveConfig();
    if (!config) return;

    const raw = input.value;

    if (config.pattern instanceof RegExp) {
      // Modo RegExp
      const filtered = this.filterByRegex(raw, config.pattern);
      if (filtered !== raw) {
        const cursorPos = input.selectionStart ?? filtered.length;
        input.value = filtered;
        input.setSelectionRange(cursorPos - 1, cursorPos - 1);
      }
      this.maskedChange.emit(filtered);
      this.rawChange.emit(filtered);
      return;
    }

    // Modo patrón de caracteres
    const maskStr = config.pattern;
    const tokens = { ...DEFAULT_TOKENS, ...this.siremMaskTokens(), ...config.tokens };
    const { formatted, unmasked } = this.formatValue(raw, maskStr, tokens);

    if (formatted !== raw) {
      const oldLen = raw.length;
      const newLen = formatted.length;
      let cursorPos = input.selectionStart ?? newLen;
      if (newLen > oldLen) {
        cursorPos += newLen - oldLen;
      }
      input.value = formatted;
      input.setSelectionRange(cursorPos, cursorPos);
    }

    this.maskedChange.emit(formatted);
    this.rawChange.emit(unmasked);
  }

  private resolveConfig(): SiremMaskConfig | null {
    const raw = this.siremMask();
    if (!raw) return null;
    if (typeof raw === 'string') {
      return { pattern: raw, unmask: this.siremMaskUnmask() };
    }
    if (raw instanceof RegExp) {
      return { pattern: raw, unmask: this.siremMaskUnmask() };
    }
    return raw;
  }

  private getMaskString(): string | null {
    const config = this.resolveConfig();
    return config && typeof config.pattern === 'string' ? config.pattern : null;
  }

  private isTokenChar(char: string | undefined): boolean {
    if (!char) return false;
    const tokens = { ...DEFAULT_TOKENS, ...this.siremMaskTokens() };
    return Object.prototype.hasOwnProperty.call(tokens, char);
  }

  private filterByRegex(value: string, regex: RegExp): string {
    if (regex.test(value)) return value;
    // Si no coincide la cadena completa, filtrar carácter a carácter
    let result = '';
    for (const ch of value) {
      if (regex.test(result + ch)) {
        result += ch;
      }
    }
    return result;
  }

  private formatValue(
    value: string,
    mask: string,
    tokens: Record<string, RegExp>,
  ): { formatted: string; unmasked: string } {
    // 1. Extraer caracteres que coinciden con los tokens de la máscara
    let rawChars = '';
    for (const ch of value) {
      for (const tokenKey in tokens) {
        if (tokens[tokenKey].test(ch)) {
          rawChars += ch;
          break;
        }
      }
    }

    // 2. Construir la cadena enmascarada
    let formatted = '';
    let unmasked = '';
    let rawIndex = 0;

    for (let maskIndex = 0; maskIndex < mask.length; maskIndex++) {
      if (rawIndex >= rawChars.length) break;

      const maskChar = mask[maskIndex];
      const tokenRegex = tokens[maskChar];

      if (tokenRegex) {
        const char = rawChars[rawIndex];
        if (tokenRegex.test(char)) {
          formatted += char;
          unmasked += char;
          rawIndex++;
        } else {
          // Si el carácter no encaja en el token, se descarta y se reintenta
          rawIndex++;
          maskIndex--;
        }
      } else {
        // Carácter literal fijo de la máscara (ej: '/', '-', '(', ')')
        formatted += maskChar;
      }
    }

    return { formatted, unmasked };
  }
}
