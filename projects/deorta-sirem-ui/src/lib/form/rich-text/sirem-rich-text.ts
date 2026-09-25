import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Editor de texto enriquecido liviano (contenteditable + barra de formato).
 * Devuelve HTML en doble vía; sin dependencias externas.
 *
 * Uso:
 * ```html
 * <sirem-rich-text label="Evolución" [(value)]="evo" />
 * ```
 */
@Component({
  selector: 'sirem-rich-text',
  standalone: true,
  styleUrl: './sirem-rich-text.scss',
  template: `
    <div class="sirem-rich">
      @if (label()) {
        <label class="sirem-rich__label">{{ label() }}</label>
      }
      <div class="sirem-rich__toolbar" role="toolbar" aria-label="Formato de texto">
        <button type="button" (mousedown)="format($event, 'bold')" title="Negrita (Ctrl+B)" aria-label="Negrita" class="sirem-rich__btn sirem-rich__btn--b">B</button>
        <button type="button" (mousedown)="format($event, 'italic')" title="Cursiva (Ctrl+I)" aria-label="Cursiva" class="sirem-rich__btn sirem-rich__btn--i">I</button>
        <button type="button" (mousedown)="format($event, 'underline')" title="Subrayado (Ctrl+U)" aria-label="Subrayado" class="sirem-rich__btn sirem-rich__btn--u">U</button>
        <button type="button" (mousedown)="format($event, 'strikeThrough')" title="Tachado" aria-label="Tachado" class="sirem-rich__btn sirem-rich__btn--s">S</button>
        <span class="sirem-rich__sep" aria-hidden="true"></span>
        <button type="button" (mousedown)="format($event, 'insertUnorderedList')" title="Lista con viñetas" aria-label="Lista con viñetas" class="sirem-rich__btn">•≡</button>
        <button type="button" (mousedown)="format($event, 'insertOrderedList')" title="Lista numerada" aria-label="Lista numerada" class="sirem-rich__btn">1≡</button>
        <button type="button" (mousedown)="format($event, 'formatBlock', 'blockquote')" title="Cita" aria-label="Cita" class="sirem-rich__btn">❝</button>
        <span class="sirem-rich__sep" aria-hidden="true"></span>
        <button type="button" (mousedown)="format($event, 'removeFormat')" title="Quitar formato" aria-label="Quitar formato" class="sirem-rich__btn">⟲</button>
      </div>
      <div
        #area
        class="sirem-rich__area"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        [style.min-height.px]="minHeight()"
        [attr.aria-label]="label() || 'Texto enriquecido'"
        [attr.data-placeholder]="placeholder()"
        [class.sirem-rich__area--empty]="isEmpty()"
        (input)="onInput()"
        (blur)="onInput()"
      ></div>
      <div class="sirem-rich__foot">
        @if (error()) {
          <span role="alert" class="sirem-rich__error">{{ error() }}</span>
        } @else if (hint()) {
          <span class="sirem-rich__hint">{{ hint() }}</span>
        }
        <span class="sirem-rich__count">{{ plainLength() }} caracteres</span>
      </div>
    </div>
  `,
})
export class SiremRichText implements AfterViewInit {
  /** HTML del contenido (doble vía). */
  readonly value = model('');
  readonly label = input('');
  readonly placeholder = input('Escribe aquí…');
  readonly hint = input('');
  readonly error = input('');
  /** Alto mínimo del área en px. */
  readonly minHeight = input(140);

  private readonly areaRef = viewChild<ElementRef<HTMLDivElement>>('area');
  private readonly dirty = signal(false);

  readonly isEmpty = computed(() => {
    const text = this.areaRef()?.nativeElement.textContent ?? this.value();
    return text.trim() === '';
  });

  readonly plainLength = computed(() => {
    const el = this.areaRef()?.nativeElement;
    if (el && document.activeElement === el) return (el.textContent ?? '').length;
    const tmp = document.createElement('div');
    tmp.innerHTML = this.value();
    return (tmp.textContent ?? '').length;
  });

  ngAfterViewInit(): void {
    const el = this.areaRef()?.nativeElement;
    if (el && this.value()) el.innerHTML = this.value();
    this.dirty.set(true);
  }

  onInput(): void {
    const el = this.areaRef()?.nativeElement;
    if (!el) return;
    this.value.set(el.innerHTML);
  }

  format(event: Event, command: string, arg?: string): void {
    // mousedown (no click) para no perder la selección del área.
    event.preventDefault();
    document.execCommand(command, false, arg);
    this.onInput();
    this.areaRef()?.nativeElement.focus();
  }
}
