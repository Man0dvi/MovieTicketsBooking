// src/app/features/auth/sign-in/sign-in.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  form: FormGroup;
  showPw = false;
  error = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      phone: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.error = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const usersRaw = localStorage.getItem('cinema_users');
    const users = usersRaw ? JSON.parse(usersRaw) as any[] : [];
    const { phone, password } = this.form.value;
    const user = users.find(u => u.phone === phone && u.password === password);

    if (!user) {
      this.error = 'Invalid phone number or password';
      return;
    }

    // persist current user session
    localStorage.setItem('cinema_auth', JSON.stringify({ id: user.id, username: user.username, email: user.email, phone: user.phone }));
    this.router.navigate(['/']);
  }
}
