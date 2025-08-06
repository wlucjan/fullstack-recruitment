import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ButtonModule
  ],
  template: `
    <form [formGroup]="createUserForm" (ngSubmit)="onCreate()">
      <div class="field">
        <label for="email">Email *</label>
        <input 
          pInputText 
          id="email" 
          type="email" 
          formControlName="email" 
          placeholder="Enter email address"
          class="full-width"
          [class.ng-invalid]="createUserForm.get('email')?.invalid && createUserForm.get('email')?.touched">
        <small 
          class="p-error" 
          *ngIf="createUserForm.get('email')?.hasError('required') && createUserForm.get('email')?.touched">
          Email is required
        </small>
        <small 
          class="p-error" 
          *ngIf="createUserForm.get('email')?.hasError('email') && createUserForm.get('email')?.touched">
          Please enter a valid email
        </small>
      </div>

      <div class="field">
        <label for="password">Password *</label>
        <p-password 
          formControlName="password" 
          inputId="password"
          placeholder="Enter password (min 8 characters)"
          [feedback]="true"
          [toggleMask]="true"
          styleClass="full-width"
          [inputStyle]="{'width': '100%'}"
          [class.ng-invalid]="createUserForm.get('password')?.invalid && createUserForm.get('password')?.touched">
        </p-password>
        <small 
          class="p-error" 
          *ngIf="createUserForm.get('password')?.hasError('required') && createUserForm.get('password')?.touched">
          Password is required
        </small>
        <small 
          class="p-error" 
          *ngIf="createUserForm.get('password')?.hasError('minlength') && createUserForm.get('password')?.touched">
          Password must be at least 8 characters long
        </small>
      </div>

      <div class="field">
        <label for="role">Role *</label>
        <p-select 
          formControlName="role" 
          [options]="roleOptions" 
          placeholder="Select a role"
          optionLabel="label" 
          optionValue="value"
          styleClass="full-width"
          [class.ng-invalid]="createUserForm.get('role')?.invalid && createUserForm.get('role')?.touched">
        </p-select>
        <small 
          class="p-error" 
          *ngIf="createUserForm.get('role')?.hasError('required') && createUserForm.get('role')?.touched">
          Role is required
        </small>
      </div>

      <div class="dialog-actions">
        <p-button 
          label="Cancel" 
          icon="pi pi-times" 
          styleClass="p-button-text"
          (onClick)="onCancel()">
        </p-button>
        <p-button 
          type="submit"
          label="Create User" 
          icon="pi pi-check" 
          [disabled]="createUserForm.invalid || isLoading"
          [loading]="isLoading">
        </p-button>
      </div>
    </form>
  `,
  styles: [`
    .field {
      margin-bottom: 1.5rem;
    }

    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .p-error {
      display: block;
      margin-top: 0.25rem;
    }
  `]
})
export class CreateUserDialogComponent {
  @Output() userCreated = new EventEmitter<void>();
  @Output() dialogClosed = new EventEmitter<void>();

  createUserForm: FormGroup;
  isLoading = false;
  roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private messageService: MessageService
  ) {
    this.createUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['user', [Validators.required]]
    });
  }

  onCreate(): void {
    if (this.createUserForm.valid) {
      this.isLoading = true;
      
      const formValue = this.createUserForm.value;
      const userData = {
        email: formValue.email,
        plainPassword: formValue.password,
        role: formValue.role
      };
      
      this.usersService.createUser(userData).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User created successfully!'
          });
          this.userCreated.emit();
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Error creating user. Please try again.';
          
          if (error.status === 400 && error.error?.message) {
            if (Array.isArray(error.error.message)) {
              errorMessage = error.error.message.join(', ');
            } else {
              errorMessage = error.error.message;
            }
          } else if (error.status === 409) {
            errorMessage = 'User with this email already exists.';
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
          console.error('Create user error:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogClosed.emit();
  }
}