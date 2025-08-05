import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Create New User</h2>
    
    <mat-dialog-content>
      <form [formGroup]="createUserForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
          <mat-error *ngIf="createUserForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="createUserForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="createUserForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="createUserForm.get('password')?.hasError('minlength')">
            Password must be at least 8 characters long
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role" required>
            <mat-option value="user">User</mat-option>
            <mat-option value="admin">Admin</mat-option>
          </mat-select>
          <mat-error *ngIf="createUserForm.get('role')?.hasError('required')">
            Role is required
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onCreate()"
        [disabled]="createUserForm.invalid || isLoading">
        {{ isLoading ? 'Creating...' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      min-width: 350px;
    }
  `]
})
export class CreateUserDialogComponent {
  createUserForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private snackBar: MatSnackBar
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
          this.snackBar.open('User created successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
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
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          console.error('Create user error:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}