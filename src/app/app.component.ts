// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// adjust these paths if your header/footer live elsewhere
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Cinema Delight';
}