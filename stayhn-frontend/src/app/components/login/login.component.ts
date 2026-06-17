import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: LoginRequest = { email: '', password: '' };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Control del flujo visual: 'login', 'forgot' o 'reset'
  viewMode: 'login' | 'forgot' | 'reset' = 'login';

  // Datos temporales para la recuperación de contraseña
  recoveryData = {
    email: '',
    token: '',
    newPassword: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  // Login normal
  login(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginData).subscribe(
        (response) => {
          this.authService.setUserData(response.user, response.token);
          this.router.navigate([response.user.role === 'admin' ? '/admin' : '/guest']);
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Error al iniciar sesión';
          this.isLoading = false;
        }
    );
  }

  // Método para alternar vistas limpiando errores previos
  changeView(mode: 'login' | 'forgot' | 'reset'): void {
    this.viewMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Enviar el correo para pedir código
  onForgotPassword(): void {
    if (!this.recoveryData.email) {
      this.errorMessage = 'Por favor, escribe tu correo electrónico.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.recoveryData.email).subscribe(
        (response) => {
          this.isLoading = false;
          // Avanzamos automáticamente a la pantalla de meter el código
          this.changeView('reset');
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Error al enviar el código. Verifica el correo.';
          this.isLoading = false;
        }
    );
  }

  // Enviar código y nueva contraseña para el cambio final
  // Enviar código y nueva contraseña para el cambio final
  onResetPassword(): void {
    if (!this.recoveryData.token || !this.recoveryData.newPassword) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.recoveryData).subscribe(
        (response) => {
          this.isLoading = false;

          // 1. Cambiamos la vista primero
          this.viewMode = 'login';
          this.errorMessage = '';

          // 2. Seteamos el mensaje DESPUÉS para que no lo borre el limpiador
          this.successMessage = '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con su nueva contraseña.';
        },
        (error) => {
          this.errorMessage = error.error?.message || 'El código es inválido o expiró.';
          this.isLoading = false;
        }
    );
  }
}