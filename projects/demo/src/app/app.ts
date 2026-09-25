import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicToastViewportComponent } from 'ngx-dynamic-toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DynamicToastViewportComponent],
  templateUrl: './app.html',
})
export class App {}
