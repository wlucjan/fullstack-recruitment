import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';

import { UsersService, UserListItem } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { CreateUserDialogComponent } from './create-user-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    CreateUserDialogComponent
  ],
  template: `
    <p-toolbar>
      <div class="p-toolbar-group-start">
        <h2>Users Management</h2>
      </div>
      <div class="p-toolbar-group-end">
        <p-button 
          *ngIf="isAdmin"
          label="Create User" 
          icon="pi pi-plus" 
          (onClick)="showCreateUserDialog = true"
          styleClass="p-button-success p-mr-2">
        </p-button>
        <p-button 
          label="Logout" 
          icon="pi pi-sign-out" 
          (onClick)="logout()"
          styleClass="p-button-secondary">
        </p-button>
      </div>
    </p-toolbar>

    <div class="users-container">
      <p-table 
        [value]="users" 
        [paginator]="true" 
        [rows]="pageSize"
        [totalRecords]="totalUsers"
        [lazy]="true"
        (onLazyLoad)="loadUsers($event)"
        [loading]="isLoading"
        styleClass="p-datatable-striped">
        
        <ng-template pTemplate="header">
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th *ngIf="isAdmin">Actions</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.email }}</td>
            <td>
              <p-tag 
                [value]="user.role | titlecase" 
                [severity]="user.role === 'admin' ? 'warning' : 'info'">
              </p-tag>
            </td>
            <td *ngIf="isAdmin">
              <p-button 
                icon="pi pi-trash" 
                styleClass="p-button-danger p-button-text p-button-sm"
                (onClick)="confirmDelete(user)"
                [disabled]="user.id === currentUserId"
                pTooltip="Delete user">
              </p-button>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3">No users found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog 
      header="Create New User" 
      [(visible)]="showCreateUserDialog" 
      [modal]="true" 
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="p-fluid">
      <app-create-user-dialog 
        *ngIf="showCreateUserDialog"
        (userCreated)="onUserCreated()"
        (dialogClosed)="showCreateUserDialog = false">
      </app-create-user-dialog>
    </p-dialog>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [`
    h2 {
      margin: 0;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 1.5rem;
    }

    .p-mr-2 {
      margin-right: 0.5rem;
    }

    :host ::ng-deep .p-datatable {
      border-radius: 0;
    }

    :host ::ng-deep .p-toolbar {
      border-radius: 0;
    }
  `],
  providers: [MessageService, ConfirmationService]
})
export class UsersListComponent implements OnInit {
  users: UserListItem[] = [];
  totalUsers = 0;
  pageSize = 10;
  currentPage = 1;
  isAdmin = false;
  currentUserId: string | null = null;
  isLoading = false;
  showCreateUserDialog = false;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
  }

  loadUsers(event?: any): void {
    this.isLoading = true;
    
    if (event) {
      this.currentPage = (event.first / event.rows) + 1;  
      this.pageSize = event.rows;
    }

    this.usersService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalUsers = response.metadata.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error loading users'
        });
        console.error('Error loading users:', error);
      }
    });
  }

  confirmDelete(user: UserListItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user ${user.email}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user);
      }
    });
  }

  deleteUser(user: UserListItem): void {
    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted successfully'
        });
        this.loadUsers();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error deleting user'
        });
        console.error('Error deleting user:', error);
      }
    });
  }

  onUserCreated(): void {
    this.showCreateUserDialog = false;
    this.loadUsers();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}