// src/app/features/auth/sign-in/sign-in.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AutofocusDirective],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  // Model properties bound to form controls
  phone = '';
  password = '';
  showPw = false;
  error = '';
  isLoading = false;

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit(form: NgForm) {
    this.error = '';
    if (form.invalid) {
      // mark controls touched to show validation UI
      Object.values(form.controls).forEach(c => (c as any).markAsTouched());

      return;
    }

    this.isLoading = true;
    this.authService.signIn(this.phone, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        // AuthService saved token+user to storage already
        // Navigate to home (or previous route)
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        // error may be Error or HttpErrorResponse
        const msg = (err && (err.message || (err.error && err.error.message))) ? (err.message || err.error.message) : 'Invalid phone number or password';
        this.error = msg;
      }
    });
  }
}
