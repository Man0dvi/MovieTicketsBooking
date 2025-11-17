import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public year = new Date().getFullYear();

  public currentUser$; // declare but don’t assign yet

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    // assign here → now auth is already initialized
    this.currentUser$ = this.auth.currentUser$;
  }

  goToMyTickets(event?: MouseEvent) {
    if (event) event.preventDefault();
    this.router.navigate(['/my-tickets']).catch(err => {
      console.warn('Navigation to /my-tickets failed', err);
    });
  }
}
