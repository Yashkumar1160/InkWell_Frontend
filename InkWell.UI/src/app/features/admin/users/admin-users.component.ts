import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Search, Filter, Trash2, UserCheck, UserX } from 'lucide-angular';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  roleFilter: string = 'ALL';
  searchByEmail: boolean = false;

  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly DeleteIcon = Trash2;
  readonly DeactivateIcon = UserX;
  readonly ReactivateIcon = UserCheck;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe(users => {
      this.users = users;
      this.filterUsers();
    });
  }

  filterUsers(): void {
    if (this.searchTerm.trim()) {
      if (this.searchByEmail) {
        this.adminService.getUserByEmail(this.searchTerm).subscribe({
          next: (user) => {
            this.filteredUsers = user ? [user] : [];
          },
          error: () => this.filteredUsers = []
        });
      } else {
        this.adminService.searchUsers(this.searchTerm).subscribe(users => {
          this.filteredUsers = this.roleFilter === 'ALL' 
            ? users 
            : users.filter(u => u.role === this.roleFilter);
        });
      }
    } else if (this.roleFilter !== 'ALL') {
      this.adminService.getUsersByRole(this.roleFilter).subscribe(users => {
        this.filteredUsers = users;
      });
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  changeRole(userId: number, role: string): void {
    this.adminService.changeUserRole(userId, role).subscribe(() => {
      const user = this.users.find(u => u.userId === userId);
      if (user) user.role = role;
      alert('User role updated successfully');
    });
  }

  deactivateUser(userId: number): void {
    this.adminService.deactivateUser(userId).subscribe(() => {
      const user = this.users.find(u => u.userId === userId);
      if (user) user.isActive = false;
    });
  }

  reactivateUser(userId: number): void {
    this.adminService.reactivateUser(userId).subscribe(() => {
      const user = this.users.find(u => u.userId === userId);
      if (user) user.isActive = true;
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.adminService.deleteUser(userId).subscribe(() => {
        this.users = this.users.filter(u => u.userId !== userId);
        this.filterUsers();
      });
    }
  }
}
