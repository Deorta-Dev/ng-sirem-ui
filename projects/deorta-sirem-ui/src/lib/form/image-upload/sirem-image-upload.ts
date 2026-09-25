import { Component, input, model } from '@angular/core';

/**
 * Carga de imagen con vista previa (foto del paciente, logo, QR…).
 * El valor es la imagen como data-URL lista para previsualizar/enviar.
 */
@Component({
  selector: 'sirem-image-upload-field',
  standalone: true,
  styleUrl: './sirem-image-upload.scss',
  template: `
    <div>
      @if (label()) {
        <p class="sirem-image__title">
          {{ label() }}
          @if (required()) {
            <span class="sirem-field__required" aria-hidden="true">*</span>
          }
        </p>
      }
      @if (value()) {
        <div class="sirem-image__preview">
          <img
            [src]="value()"
            [alt]="label() || 'Vista previa'"
            class="sirem-image__img"
          />
          <button
            type="button"
            (click)="value.set(null)"
            aria-label="Quitar imagen"
            class="sirem-image__remove"
          >
            <i class="fi fi-rr-trash" aria-hidden="true"></i>
          </button>
        </div>
      } @else {
        <label class="sirem-image__drop">
          <span aria-hidden="true" class="sirem-image__glyph">
            <i class="fi fi-rr-picture" aria-hidden="true"></i>
          </span>
          <span class="sirem-image__cta">{{ placeholder() }}</span>
          @if (hint()) {
            <span class="sirem-field__hint">{{ hint() }}</span>
          }
          <input
            type="file"
            [accept]="accept()"
            (change)="onFile($event)"
            [disabled]="disabled()"
            class="sirem-image__file"
            [attr.aria-label]="label() || 'Subir imagen'"
          />
        </label>
      }
      @if (error()) {
        <p role="alert" class="sirem-field__error">{{ error() }}</p>
      }
    </div>
  `,
})
export class SiremImageUpload {
  readonly value = model<string | null>(null);
  readonly label = input('');
  readonly placeholder = input('Toca para subir una imagen');
  readonly hint = input('PNG o JPG');
  readonly error = input('');
  readonly accept = input('image/*');
  readonly required = input(false);
  readonly disabled = input(false);

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.value.set(String(reader.result));
    reader.readAsDataURL(file);
  }
}
