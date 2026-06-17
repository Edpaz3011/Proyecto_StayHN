# Flujo del Backend — ASP.NET Core 10

## Arquitectura

El backend sigue un patrón capas:

```
HTTP Request (Frontend)
    ↓
Controllers (AuthController, AccommodationController, etc.)
    ↓
Services (AuthService, AccommodationService, FirebaseService, etc.)
    ↓
Firebase / Firestore (Google Cloud)
    ↓
Response (JSON)
```

## Componentes Principales

### 1. Program.cs — Configuración de la App

**Qué hace:**
- Configura CORS para aceptar solicitudes del frontend en `http://localhost:4200`.
- Registra servicios en el contenedor de inyección de dependencias (DI).
- Configura autenticación JWT (lee clave de `appsettings.json`).
- Define política de autorización "AdminOnly" que requiere claim `role: admin`.
- Habilita Swagger (documentación interactiva de API en Development).

**Flujo:**
Cuando inicia la app, Program.cs configura todo. Cada request pasa por middleware de autenticación antes de llegar a los controladores.

### 2. Controllers — Puntos de Entrada HTTP

**AuthController** (inicio de sesión, registro)
- `POST /api/auth/register` → Recibe email y contraseña → Crea usuario en Firestore → Devuelve JWT.
- `POST /api/auth/login` → Valida credenciales → Devuelve JWT con claims (id, email, role, fullName).

**AccommodationController** (alojamientos)
- `GET /api/accommodations` → Devuelve lista de todos los alojamientos activos.
- `GET /api/accommodations/{id}` → Devuelve detalle de un alojamiento (incluye reseñas).
- `POST /api/accommodations` → Crea alojamiento (solo admin).
- `PUT /api/accommodations/{id}` → Edita alojamiento (solo admin).

**ReservationController** (reservas)
- `POST /api/reservations` → Crea nueva reserva.
  - Valida disponibilidad (verifica que no haya otra reserva en esas fechas).
  - Calcula noches y monto.
  - Registra en Firestore.
- `GET /api/reservations/{id}` → Obtiene detalle de una reserva.
- `GET /api/reservations/user/{userId}` → Devuelve todas las reservas del usuario.

**ReviewController** (reseñas)
- `POST /api/reviews` → Crea reseña (solo si usuario tiene reserva confirmada).
- `GET /api/reviews/accommodation/{accommodationId}` → Obtiene todas las reseñas de un alojamiento.

**QuestionController** (preguntas)
- `POST /api/questions` → Crea pregunta sobre alojamiento.
- `PUT /api/questions/{id}/answer` → Admin responde (solo admin).
- `GET /api/questions/accommodation/{accommodationId}` → Obtiene preguntas y respuestas.

**PaymentController** (pagos)
- `POST /api/payments` → Registra pago simulado (solo validación de formato).

**AdminController** (solo admin)
- `GET /api/admin/users` → Lista todos los usuarios.
- `PUT /api/admin/users/{id}/promote` → Promueve usuario a admin.

**ReportController** (estadísticas)
- `GET /api/reports/statistics` → Devuelve totales (alojamientos, reservas, ingresos, ocupación).
- `GET /api/reports/reservations-by-status` → Distribución de reservas por estado.
- `GET /api/reports/occupancy` → Porcentaje de ocupación por alojamiento.

### 3. Services — Lógica de Negocio

**AuthService**
- Genera JWT con HMAC-SHA256.
- Valida credenciales contra Firestore.
- Hashea contraseñas (en desarrollo usa plaintext para demo; en producción usar bcrypt).

**AccommodationService**
- CRUD de alojamientos.
- Valida que admin sea quien crea/edita.
- Consulta Firestore.

**ReservationService**
- **Operación crítica:** Verifica disponibilidad.
  1. Consulta todas las reservas confirmadas del alojamiento.
  2. Compara rango de fechas solicitadas contra las existentes.
  3. Si hay solapamiento, rechaza la reserva.
  4. Si no hay, crea la reserva atómicamente (la escribe junto con el registro de pago).
- Calcula monto: `(noches * pricePerNight) + taxes`.

**ReviewService**
- Valida que usuario tenga al menos una reserva confirmada en el alojamiento.
- Evita duplicados (una reseña por usuario por alojamiento).

**QuestionService**
- Crea preguntas asociadas a alojamiento.
- Registra respuestas (solo admin).

**PaymentService**
- Valida formato de tarjeta (número, CVV, fecha vencimiento).
- Registra el evento en colección PaymentRecords (no procesa dinero real).

**ReportService**
- Consulta Firestore con agregaciones.
- Calcula estadísticas: totales, tendencias, porcentajes.

**FirebaseService**
- Wrapper de Google.Cloud.Firestore.
- Métodos: `GetDocumentAsync`, `SetDocumentAsync`, `UpdateAsync`, `DeleteAsync`, `QueryAsync`.
- Maneja credenciales (lee `GOOGLE_APPLICATION_CREDENTIALS`).
- Incluye logging de diagnóstico (DNS, TCP, conexión exitosa).

### 4. Autenticación y Autorización

**Flujo JWT:**

1. Usuario hace login → `POST /api/auth/login` con email y contraseña.
2. AuthService valida en Firestore.
3. Si válido, genera JWT:
   ```
   Header: { alg: "HS256", typ: "JWT" }
   Payload: { id, email, role, fullName, exp, iat }
   Signature: HMAC-SHA256(header.payload, secret_key)
   ```
4. Backend devuelve `{ token, user }`.
5. Frontend guarda token en `localStorage` y lo envía en header `Authorization: Bearer <token>` en cada petición.
6. Backend valida que token no haya expirado y no haya sido tamperado.

**Autorización por Rol:**

- **Guest:** Acceso a lectura (alojamientos, detalle, reseñas) y escritura propia (reserva, reseña, pregunta).
- **Admin:** Acceso a todo. Controlado por atributo `[Authorize(Policy = "AdminOnly")]` en métodos de controller.

### 5. Validaciones en Backend

**Disponibilidad:**
```
Si (fechaEntrada <= fechaSalidaExistente) AND (fechaSalida > fechaEntradaExistente):
    rechazar
```

**Reseña:**
```
Si (usuario no tiene reserva confirmada en el alojamiento):
    rechazar
Si (usuario ya reseñó ese alojamiento):
    rechazar
```

**Pregunta/Respuesta:**
```
Crear pregunta: cualquier usuario.
Responder: solo admin.
```

## Flujo de una Petición Típica (Crear Reserva)

1. Frontend: `POST /api/reservations` con `{ accommodationId, checkInDate, checkOutDate }` + JWT en header.
2. Middleware: Valida JWT, extrae claims (userId, role, etc.).
3. Controller: Recibe datos, llama a `ReservationService.CreateReservationAsync()`.
4. Service:
   - Obtiene alojamiento de Firestore.
   - Consulta todas las reservas confirmadas de ese alojamiento.
   - Compara fechas. Si hay conflicto, lanza excepción.
   - Si está disponible, calcula monto.
   - Escribe en Firestore (colección Reservations).
   - Devuelve objeto Reservation con id generado.
5. Controller: Devuelve status 200 + JSON de la reserva creada.
6. Frontend: Recibe respuesta, muestra confirmación.

## Estructura de Carpetas

```
ProyectoClaseG4/
├── Program.cs                 (configuración app)
├── appsettings.json           (claves, URLs, config)
├── Controllers/
│   ├── AuthController.cs
│   ├── AccommodationController.cs
│   ├── ReservationController.cs
│   ├── ReviewController.cs
│   ├── QuestionController.cs
│   ├── PaymentController.cs
│   ├── AdminController.cs
│   └── ReportController.cs
├── Services/
│   ├── AuthService.cs
│   ├── AccommodationService.cs
│   ├── ReservationService.cs
│   ├── ReviewService.cs
│   ├── QuestionService.cs
│   ├── PaymentService.cs
│   ├── ReportService.cs
│   └── FirebaseService.cs
└── Models/
    ├── User.cs
    ├── Accommodation.cs
    ├── Reservation.cs
    ├── Review.cs
    ├── Question.cs
    ├── PaymentRecord.cs
    └── ReservationStatistics.cs
```

## Puntos Clave en la Defensa

1. **Autenticación JWT:** Explicar cómo se genera, cómo se valida, qué claims contiene.
2. **Autorización por rol:** Mostrar `[Authorize(Policy = "AdminOnly")]` y cómo funciona.
3. **Validación de disponibilidad:** El corazón del sistema; sin esto, podrían haber overbooking.
4. **Integración Firestore:** Cómo el backend comunica con Firebase sin usar cliente SDK (usa Admin SDK).
5. **Atomicidad:** Las operaciones críticas (crear reserva) son transacciones.

---
**Última actualización:** 2026-06-15
