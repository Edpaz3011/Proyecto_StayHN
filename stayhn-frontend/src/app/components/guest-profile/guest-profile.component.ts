import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-guest-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-profile.component.html',
  styleUrls: ['./guest-profile.component.css']
})
export class GuestProfileComponent implements OnInit {
  model: any = {};
  message = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) this.model = { ...user };
  }

  save(): void {
    // No backend update implemented; update local storage and BehaviorSubject
    this.authService.setUserData(this.model, this.authService.tokenValue || '');
    this.message = 'Perfil actualizado localmente.';
  }
}
