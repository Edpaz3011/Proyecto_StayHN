import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-guests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-guests">
      <h2>Huéspedes</h2>
      <div *ngIf="loading">Cargando usuarios...</div>
      <table *ngIf="!loading">
        <thead>
          <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{u.fullName}}</td>
            <td>{{u.email}}</td>
            <td>{{u.role}}</td>
            <td>
              <button (click)="promote(u)" [disabled]="u.role==='admin'">Promover a admin</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminGuestsComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => { this.users = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  promote(user: User) {
    if (!confirm(`Promover a ${user.fullName} a administrador?`)) return;
    this.userService.promoteUser(user.id).subscribe({
      next: () => { user.role = 'admin'; },
      error: (err) => alert('Error promoviendo usuario: ' + (err?.message || err))
    });
  }
}
