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
  /** Imagen elegida (data URL o ruta), con enlace de dos vías. */
  readonly value = model<string | null>(null);
  /** Etiqueta visible sobre el control. */
  readonly label = input('');
  /** Texto del estado vacío de la zona de carga. */
  readonly placeholder = input('Toca para subir una imagen');
  /** Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay. */
  readonly hint = input('PNG o JPG');
  /** Mensaje de error. Con texto, el campo se marca en rojo y se anuncia. */
  readonly error = input('');
  /** Tipos admitidos por el selector de archivos (`image/*`, `.png`…). */
  readonly accept = input('image/*');
  /** Marca el campo como obligatorio (`aria-required` e indicador visual). */
  readonly required = input(false);
  /** Deshabilita el control: no se puede enfocar ni editar. */
  readonly disabled = input(false);

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.value.set(String(reader.result));
    reader.readAsDataURL(file);
  }
}
