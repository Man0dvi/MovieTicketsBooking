// src/app/features/auth/sign-up/sign-up.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (!v) return { required: true };
  const rules = [
    { r: /.{8,}/, msg: 'minLength' },
    { r: /[A-Z]/, msg: 'uppercase' },
    { r: /[a-z]/, msg: 'lowercase' },
    { r: /[0-9]/, msg: 'number' },
    { r: /[^A-Za-z0-9]/, msg: 'special' },
  ];
  const failed = rules.filter(x => !x.r.test(v)).map(x => x.msg);
  return failed.length ? { passwordStrength: failed } : null;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  form: FormGroup;
  showPw = false;
  showPw2 = false;
  success = '';
  error = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: [this.passwordMatchValidator] });
  }

  get f() { return this.form.controls; }

  passwordMatchValidator(group: AbstractControl) {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw === cpw ? null : { mismatch: true };
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const usersRaw = localStorage.getItem('cinema_users');
    const users = usersRaw ? JSON.parse(usersRaw) as any[] : [];

    const { username, email, phone, password } = this.form.value;

    // check existing by email or phone
    if (users.some(u => u.email === email)) {
      this.error = 'Email already registered';
      return;
    }
    if (users.some(u => u.phone === phone)) {
      this.error = 'Phone number already registered';
      return;
    }

    users.push({ id: Date.now().toString(), username, email, phone, password });
    localStorage.setItem('cinema_users', JSON.stringify(users));
    this.success = 'Registration successful. Redirecting to Sign In...';

    setTimeout(() => {
      this.router.navigate(['/signin']);
    }, 900);
  }
}
