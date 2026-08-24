import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {  MenageComponent } from "./menage/menage";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenageComponent, MenageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angularr');
}
