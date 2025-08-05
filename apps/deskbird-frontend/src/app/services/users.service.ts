import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserListItem {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface CreateUserRequest {
  email: string;
  plainPassword: string;
  role: 'admin' | 'user';
}

export interface PageMetadata {
  total: number;
  totalPages: number;
  limit: number;
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface UsersListResponse {
  data: UserListItem[];
  metadata: PageMetadata;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUsers(page: number = 1, limit: number = 10): Observable<UsersListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<UsersListResponse>(`${this.API_URL}/users`, { params });
  }

  createUser(userData: CreateUserRequest): Observable<UserListItem> {
    return this.http.post<UserListItem>(`${this.API_URL}/users`, userData);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${userId}`);
  }
}