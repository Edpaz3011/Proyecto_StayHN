# Flujo del Frontend — Angular 18

## Arquitectura

El frontend sigue arquitectura de componentes con servicios HTTP:

```
User Interaction (UI)
    ↓
Component (TypeScript logic + HTML template)
    ↓
Service (HTTP calls to Backend)
    ↓
Backend API
    ↓
Response (JSON)
    ↓
Component updates state → Template re-renders
```

## Componentes Principales

### Componentes Públicos (Sin Autenticación)

**LandingComponent**
- Página de inicio con descripción de la plataforma.
- Botones para login y registro.
- Muestra destacados o promociones.

**LoginComponent**
- Formulario: email, contraseña.
- Envía `POST /api/auth/login` via `AuthService`.
- Si éxito: guarda token en localStorage → navega a home.
- Si error: muestra mensaje al usuario.

**RegisterComponent**
- Formulario: nombre completo, email, contraseña, confirmación.
- Envía `POST /api/auth/register`.
- Si éxito: redirige a login.

### Componentes de Huésped

**AccommodationListComponent**
- Solicita lista de alojamientos via `AccommodationService.getAccommodations()`.
- Muestra cada alojamiento con foto, nombre, precio por noche.
- Botón "Ver detalle" → navega a AccommodationDetailComponent.

**AccommodationDetailComponent**
- Recibe ID del alojamiento via route param.
- Solicita detalle via `AccommodationService.getAccommodationById(id)`.
- Muestra:
  - Galería de fotos (carrusel).
  - Descripción, capacidad, amenidades.
  - Precio por noche.
  - Reseñas de otros usuarios (estrellas + comentarios).
  - Calendario/selector de fechas para verificar disponibilidad.
- Botón "Reservar" → abre modal/form de reserva.

**SearchComponent** (futuro)
- Filtros: ubicación, precio min/max, tipo, capacidad.
- Envía filtros al backend → obtiene lista filtrada.

**ReservationComponent**
- Recibe alojamiento y fechas.
- Solicita disponibilidad via `ReservationService.checkAvailability(accommodationId, dates)`.
- Si disponible:
  - Muestra resumen: alojamiento, fechas, noches, precio/noche, total.
  - Botón "Proceder al pago" → navega a PaymentComponent.
- Si no disponible:
  - Muestra mensaje y sugiere otras fechas.

**PaymentComponent**
- Formulario simulado: número tarjeta, CVV, fecha vencimiento, nombre titular.
- Valida formato localmente.
- Envía `POST /api/payments` con datos + datos de reserva.
- Si éxito: navega a ReservationConfirmationComponent.

**ReservationConfirmationComponent**
- Muestra:
  - Número de referencia de la reserva.
  - Resumen de la reserva (alojamiento, fechas, total).
  - "Descargar confirmación" (opcional).
  - Botón "Ver mis reservas".

**MyReservationsComponent**
- Solicita via `ReservationService.getUserReservations(userId)`.
- Listado de todas las reservas del usuario con estado (confirmada, pendiente, cancelada).
- Para cada reserva:
  - Detalles: alojamiento, fechas, monto.
  - Botones: "Ver detalle", "Cancelar" (si permite), "Dejar reseña" (si está confirmada y pasó la fecha).

**ReviewFormComponent**
- Modal/página dentro de AccommodationDetailComponent.
- Formulario: calificación (1-5 estrellas), comentario.
- Valida que usuario tenga reserva confirmada (backend lo verifica).
- Envía via `ReviewService.createReview()`.

**QuestionFormComponent**
- Modal/página dentro de AccommodationDetailComponent.
- Formulario: texto de la pregunta.
- Envía via `QuestionService.createQuestion()`.

### Componentes de Administrador

**AdminDashboardComponent**
- Página principal del admin.
- Menú lateral con opciones: alojamientos, reservas, usuarios, reportes, preguntas/reseñas.
- Resumen rápido: # alojamientos, # reservas hoy, ingresos (simulados).

**AccommodationManagementComponent**
- Tabla de alojamientos con acciones: editar, desactivar, ver estadísticas.
- Botón "+ Nuevo" → abre AccommodationFormComponent.

**AccommodationFormComponent**
- Formulario: nombre, tipo, ubicación, capacidad, amenidades, precio/noche, fotos.
- Crear o editar alojamiento.
- Upload de fotos (local storage en memoria para demo; en producción ir a Firebase Storage).
- Envía via `AccommodationService.createAccommodation()` o `.updateAccommodation()`.

**GuestListComponent**
- Tabla de usuarios (huéspedes).
- Columnas: nombre, email, rol, fecha registro.
- Botón "Promover a admin" → llamada a `UserService.promoteUser()`.

**ReservationListComponent**
- Tabla filtrable de todas las reservas.
- Filtros: por fecha, por estado (confirmada/pendiente/cancelada), por alojamiento.
- Detalles: usuario, alojamiento, fechas, monto, estado.

**ReportsComponent**
- Visualizaciones:
  - Gráfico de barras: ocupación por alojamiento.
  - Gráfico circular: distribución de reservas por estado.
  - Gráfico de línea: tendencia de ingresos por mes.
  - Tabla: estadísticas detalladas.
- Filtros por rango de fechas.
- Usa Chart.js para gráficos.

## Servicios HTTP

**AuthService**
- `login(email, password)` → `POST /api/auth/login`
- `register(name, email, password)` → `POST /api/auth/register`
- `logout()` → limpia localStorage
- Propiedades: `token`, `user` (guardados en localStorage)
- Guard: `AuthGuard` previene acceso a rutas si no estoy autenticado

**AccommodationService**
- `getAccommodations()` → `GET /api/accommodations`
- `getAccommodationById(id)` → `GET /api/accommodations/{id}`
- `createAccommodation(data)` → `POST /api/accommodations` (admin)
- `updateAccommodation(id, data)` → `PUT /api/accommodations/{id}` (admin)

**ReservationService**
- `checkAvailability(accommodationId, checkIn, checkOut)` → valida en backend
- `getUserReservations(userId)` → obtiene mis reservas
- `createReservation(data)` → `POST /api/reservations`

**ReviewService**
- `getReviewsByAccommodation(accommodationId)` → `GET /api/reviews/accommodation/{id}`
- `createReview(data)` → `POST /api/reviews`

**QuestionService**
- `getQuestions(accommodationId)` → `GET /api/questions/accommodation/{id}`
- `createQuestion(data)` → `POST /api/questions`
- `answerQuestion(id, answer)` → `PUT /api/questions/{id}/answer` (admin)

**PaymentService**
- `processPayment(data)` → `POST /api/payments`
- Validaciones locales de formato de tarjeta

**ReportService**
- `getStatistics()` → `GET /api/reports/statistics`
- `getReservationsByStatus()` → agregación de reservas
- `getOccupancy()` → ocupación por alojamiento

**UserService** (nuevo)
- `getUsers()` → `GET /api/admin/users` (admin)
- `promoteUser(userId)` → `PUT /api/admin/users/{id}/promote` (admin)

## Flujo de una Reserva Típica (Paso a Paso)

1. **Navegar a detalles del alojamiento**
   - Usuario hace clic en un alojamiento en la lista.
   - `AccommodationDetailComponent` se carga.
   - Solicita detalles via `AccommodationService.getAccommodationById()`.
   - Template muestra fotos, descripción, reseñas.

2. **Seleccionar fechas**
   - Usuario abre selector de fechas (date picker).
   - Selecciona fecha entrada y salida.
   - Component emite evento al backend verificando disponibilidad.

3. **Revisar disponibilidad**
   - Frontend envía `checkAvailability(accommodationId, dates)`.
   - Backend responde: disponible sí/no.
   - Si no disponible: muestra mensaje.

4. **Confirmar reserva**
   - Usuario ve resumen: alojamiento, fechas, # noches, $ total.
   - Hace clic "Proceder al pago" → navega a PaymentComponent.

5. **Completar pago simulado**
   - Formulario con campos: # tarjeta, CVV, fecha vencimiento.
   - Validación local de formato.
   - Hace clic "Pagar" → envía `POST /api/payments`.

6. **Confirmación**
   - Backend procesa y crea reserva en Firestore.
   - Devuelve número de referencia y status.
   - Frontend navega a `ReservationConfirmationComponent`.
   - Muestra confirmación con número de ref + resumen.

7. **Ver mis reservas**
   - Usuario navega a "Mis reservas".
   - Component solicita via `ReservationService.getUserReservations()`.
   - Lista todas las reservas del usuario.

8. **Dejar reseña** (opcional)
   - Usuario regresa al detalle del alojamiento.
   - Ve botón "Dejar reseña" (visible si tiene reserva confirmada).
   - Abre formulario, ingresa calificación + comentario.
   - Envía via `ReviewService.createReview()`.

## Guards (Protección de Rutas)

**AuthGuard**
- Verifica si hay token en localStorage.
- Si no, redirige a login.
- Usado en rutas: `/home`, `/accommodations/*`, `/my-reservations`, `/admin/*`.

**AdminGuard** (futuro)
- Verifica que usuario tenga `role: admin`.
- Si no, redirige a home.
- Usado en: `/admin/*`.

## Estructura de Carpetas

```
stayhn-frontend/src/app/
├── components/
│   ├── landing/
│   ├── login/
│   ├── register/
│   ├── accommodation-list/
│   ├── accommodation-detail/
│   ├── search/
│   ├── reservation/
│   ├── payment/
│   ├── reservation-confirmation/
│   ├── my-reservations/
│   ├── review-form/
│   ├── question-form/
│   ├── admin-dashboard/
│   ├── accommodation-management/
│   ├── accommodation-form/
│   ├── guest-list/
│   ├── reservation-list/
│   └── reports/
├── services/
│   ├── auth.service.ts
│   ├── accommodation.service.ts
│   ├── reservation.service.ts
│   ├── review.service.ts
│   ├── question.service.ts
│   ├── payment.service.ts
│   ├── report.service.ts
│   └── user.service.ts
├── guards/
│   ├── auth.guard.ts
│   └── admin.guard.ts (futuro)
├── models/
│   ├── user.model.ts
│   ├── accommodation.model.ts
│   ├── reservation.model.ts
│   ├── review.model.ts
│   ├── question.model.ts
│   └── payment-record.model.ts
└── app.component.ts
```

## Puntos Clave en la Defensa

1. **Token en localStorage:** Cómo se persiste, cómo se envía en cada request.
2. **Validaciones locales vs remotas:** Frontend valida formato; backend valida lógica.
3. **Componentes reutilizables:** Cómo se comunican padre-hijo (input/output).
4. **Guardias de ruta:** Cómo se protegen rutas según autenticación y rol.
5. **Manejo de errores:** Cómo se capturan errores HTTP y se muestran al usuario.
6. **Binding bidireccional:** `[(ngModel)]` para formularios.
7. **Inyección de dependencias:** Cómo se inyectan servicios en componentes.

---
**Última actualización:** 2026-06-15
