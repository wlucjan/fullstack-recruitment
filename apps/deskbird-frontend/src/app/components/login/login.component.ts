import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  template: `
    <div class="login-container">
      <p-card header="Login" class="login-card">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email">Email</label>
            <input
              pInputText
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              class="full-width"
              [class.ng-invalid]="
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
              "
            />
            <small
              class="p-error"
              *ngIf="
                loginForm.get('email')?.hasError('required') &&
                loginForm.get('email')?.touched
              "
            >
              Email is required
            </small>
            <small
              class="p-error"
              *ngIf="
                loginForm.get('email')?.hasError('email') &&
                loginForm.get('email')?.touched
              "
            >
              Please enter a valid email
            </small>
          </div>

          <div class="field">
            <label for="password">Password</label>
            <p-password
              formControlName="password"
              inputId="password"
              placeholder="Enter your password"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="full-width"
              [inputStyle]="{ width: '100%' }"
              [class.ng-invalid]="
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
            >
            </p-password>
            <small
              class="p-error"
              *ngIf="
                loginForm.get('password')?.hasError('required') &&
                loginForm.get('password')?.touched
              "
            >
              Password is required
            </small>
          </div>

          <div class="login-actions">
            <p-button
              type="submit"
              label="Login"
              [disabled]="loginForm.invalid || isLoading"
              [loading]="isLoading"
              styleClass="full-width"
            >
            </p-button>
          </div>
        </form>
      </p-card>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border-radius: 12px;
      overflow: hidden;
    }

    :host ::ng-deep .login-card .p-card-body {
      padding: 2rem;
    }

    :host ::ng-deep .login-card .p-card-header {
      background: var(--surface-0);
      border-bottom: 1px solid var(--surface-border);
      padding: 1.5rem 2rem 1rem 2rem;
    }

    :host ::ng-deep .login-card .p-card-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
      text-align: center;
      margin: 0;
    }

    .field {
      margin-bottom: 1.5rem;
    }

    .field label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.875rem;
    }

    .full-width {
      width: 100%;
    }

    .login-actions {
      margin-top: 2rem;
    }

    :host ::ng-deep .login-actions .p-button {
      width: 100%;
      padding: 0.75rem 1rem;
      font-weight: 600;
      border-radius: 8px;
    }

    .p-error {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    :host ::ng-deep .p-inputtext {
      border-radius: 8px;
      padding: 0.75rem 1rem;
    }

    :host ::ng-deep .p-password-input {
      border-radius: 8px;
      padding: 0.75rem 1rem;
    }
  `],
  providers: [MessageService],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful!',
          });
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Login failed. Please check your credentials.',
          });
          console.error('Login error:', error);
        },
      });
    }
  }
}
