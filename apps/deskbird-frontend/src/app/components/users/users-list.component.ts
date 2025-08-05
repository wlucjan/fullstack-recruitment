import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { UsersService, UserListItem } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { CreateUserDialogComponent } from './create-user-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <mat-toolbar>
      <span>Users Management</span>
      <span class="spacer"></span>
      <button mat-raised-button color="primary" *ngIf="isAdmin" (click)="openCreateUserDialog()">
        <mat-icon>add</mat-icon>
        Create User
      </button>
      <button mat-button (click)="logout()">
        <mat-icon>logout</mat-icon>
        Logout
      </button>
    </mat-toolbar>

    <div class="users-container">
      <div class="users-table-container">
        <table mat-table [dataSource]="users" class="users-table">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let user">
              <span class="role-badge" [class.admin]="user.role === 'admin'">
                {{ user.role | titlecase }}
              </span>
            </td>
          </ng-container>


          <ng-container matColumnDef="actions" *ngIf="isAdmin">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button 
                mat-icon-button 
                color="warn" 
                (click)="deleteUser(user)"
                [disabled]="user.id === currentUserId">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator
          [length]="totalUsers"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          [pageIndex]="currentPage - 1"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .users-container {
      padding: 20px;
    }

    .users-table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .users-table {
      width: 100%;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.admin {
      background-color: #fff3e0;
      color: #f57c00;
    }

    mat-toolbar {
      margin-bottom: 20px;
    }

    mat-toolbar button {
      margin-left: 8px;
    }

    mat-toolbar button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class UsersListComponent implements OnInit {
  users: UserListItem[] = [];
  totalUsers = 0;
  pageSize = 10;
  currentPage = 1;
  isAdmin = false;
  currentUserId: string | null = null;

  displayedColumns: string[] = ['email', 'role'];

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    
    if (this.isAdmin) {
      this.displayedColumns.push('actions');
    }
    
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalUsers = response.metadata.total;
      },
      error: (error) => {
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        console.error('Error loading users:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: UserListItem): void {
    if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}