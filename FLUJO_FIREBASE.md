# Flujo de Firebase / Firestore — Base de Datos y Persistencia

## Rol de Firebase

Firebase es el backend de datos (BaaS — Backend as a Service) que proporciona:
- **Firestore:** Base de datos NoSQL en la nube.
- **Storage:** Almacenamiento de archivos (fotos).
- **Authentication (opcional):** Gestión de usuarios (en nuestro caso usamos JWT propio).

En StayHn, **usamos Firestore como única fuente de verdad** para datos, y Storage para fotos de alojamientos.

## Autenticación con Firebase

Backend accede a Firestore usando **Google.Cloud.Firestore** (Admin SDK) con credenciales:
- Archivo: `firebase-key.json` (descargado de Firebase Console).
- Variable de entorno: `GOOGLE_APPLICATION_CREDENTIALS` (en launchSettings.json).
- Permiso: Acceso total a Firestore (solo en desarrollo; en producción usar reglas de seguridad).

## Estructura de Colecciones

### 1. Colección: Users

**Documento:**
```json
{
  "id": "user-uuid",
  "email": "usuario@email.com",
  "fullName": "Juan Pérez",
  "passwordHash": "hashed-password",
  "role": "guest",
  "profilePhotoUrl": "https://storage.firebase.com/...",
  "createdAt": "2026-06-01T10:00:00Z"
}
```

**Propósito:** Almacenar datos de usuarios, credenciales (hash), rol.

**Operaciones:**
- Crear: En `POST /api/auth/register`.
- Leer: En `POST /api/auth/login` (buscar por email).
- Actualizar: En `PUT /api/admin/users/{id}/promote` (cambiar role).
- Listar: En `GET /api/admin/users` (solo admin).

### 2. Colección: Accommodations

**Documento:**
```json
{
  "id": "accommodation-uuid",
  "name": "Casa frente al mar",
  "type": "Casa completa",
  "location": "Playa Grande, Bocas del Toro",
  "description": "Hermosa casa con vista al mar...",
  "capacity": 6,
  "amenities": ["WiFi", "Cocina equipada", "Aire acondicionado"],
  "photoUrls": [
    "https://storage.firebase.com/accommodations/photos/img1.jpg",
    "https://storage.firebase.com/accommodations/photos/img2.jpg"
  ],
  "pricePerNight": 150,
  "isActive": true,
  "createdAt": "2026-05-01T10:00:00Z",
  "createdBy": "user-admin-id",
  "updatedAt": "2026-06-01T10:00:00Z"
}
```

**Propósito:** Catálogo de alojamientos disponibles.

**Operaciones:**
- Crear: `POST /api/accommodations` (admin).
- Leer: `GET /api/accommodations` (todos), `GET /api/accommodations/{id}` (detalle).
- Actualizar: `PUT /api/accommodations/{id}` (admin).
- Desactivar: Marcar `isActive: false` sin eliminar (conservar historial).

### 3. Colección: Reservations

**Documento:**
```json
{
  "id": "reservation-uuid",
  "userId": "user-guest-id",
  "userName": "Juan Pérez",
  "accommodationId": "accommodation-uuid",
  "accommodationName": "Casa frente al mar",
  "checkInDate": "2026-07-01",
  "checkOutDate": "2026-07-05",
  "nights": 4,
  "pricePerNight": 150,
  "subtotal": 600,
  "taxes": 120,
  "totalCost": 720,
  "status": "confirmed",
  "createdAt": "2026-06-13T15:30:00Z"
}
```

**Estados posibles:**
- `confirmed` — reserva válida y pagada.
- `pending` — reserva creada pero pago no confirmado.
- `cancelled` — cancelada por usuario o sistema.

**Propósito:** Log de auditoría de todas las reservas.

**Operaciones:**
- Crear: `POST /api/reservations` (validación de disponibilidad).
- Leer: `GET /api/reservations/{id}`, `GET /api/reservations/user/{userId}`.
- Actualizar: Cambiar status a `cancelled`.
- Consulta de disponibilidad: Buscar todas las reservas `confirmed` o `pending` del alojamiento en rango de fechas.

**Validación de Disponibilidad (critical):**
```
GET Reservations
WHERE accommodationId == $accommodationId
  AND status IN ["confirmed", "pending"]
  AND (checkInDate <= $requestedCheckOut AND checkOutDate > $requestedCheckIn)

Si hay coincidencias: No disponible
Si no hay: Disponible, crear reserva
```

### 4. Colección: Reviews

**Documento:**
```json
{
  "id": "review-uuid",
  "userId": "user-guest-id",
  "userName": "Juan Pérez",
  "accommodationId": "accommodation-uuid",
  "rating": 5,
  "comment": "Excelente lugar, muy acogedor y limpio.",
  "createdAt": "2026-07-10T12:00:00Z"
}
```

**Propósito:** Reseñas y calificaciones de huéspedes.

**Validaciones:**
- Solo se permite UNA reseña por usuario por alojamiento.
- Solo usuarios con reserva confirmada pueden reseñar.

**Operaciones:**
- Crear: `POST /api/reviews` (solo huéspedes con reserva).
- Leer: `GET /api/reviews/accommodation/{id}` (público).
- Actualizar: No permitido (solo crear o eliminar por moderación).

### 5. Colección: Questions

**Documento:**
```json
{
  "id": "question-uuid",
  "userId": "user-guest-id",
  "userName": "Laura Martínez",
  "accommodationId": "accommodation-uuid",
  "questionText": "¿Tiene estacionamiento disponible?",
  "answerText": "Sí, hay 2 espacios de estacionamiento gratuito.",
  "answeredBy": "admin-id",
  "questionCreatedAt": "2026-06-10T10:00:00Z",
  "answerCreatedAt": "2026-06-10T11:30:00Z"
}
```

**Propósito:** Preguntas frecuentes y respuestas públicas.

**Operaciones:**
- Crear pregunta: `POST /api/questions` (cualquier usuario).
- Responder: `PUT /api/questions/{id}/answer` (solo admin).
- Leer: `GET /api/questions/accommodation/{id}` (público).

### 6. Colección: PaymentRecords

**Documento:**
```json
{
  "id": "payment-uuid",
  "reservationId": "reservation-uuid",
  "userId": "user-guest-id",
  "amount": 720,
  "cardLast4": "1234",
  "status": "success",
  "createdAt": "2026-06-13T15:35:00Z"
}
```

**Propósito:** Registro de intentos de pago (auditoría).

**Operaciones:**
- Crear: `POST /api/payments`.
- Leer: Para reportes y auditoría.

## Integración Backend ↔ Firestore

### Flujo de Lectura (GET)

```
Frontend HTTP GET
    ↓
Backend Controller recibe request
    ↓
Controller llama Service
    ↓
Service llama FirebaseService.GetDocumentAsync() o QueryAsync()
    ↓
FirebaseService usa Google.Cloud.Firestore
    ↓
Firestore devuelve JSON
    ↓
Service deserializa a objeto C#
    ↓
Controller devuelve al Frontend como JSON
```

**Ejemplo:** `GET /api/accommodations`
```csharp
public async Task<List<Accommodation>> GetAccommodations()
{
    var query = db.Collection("Accommodations")
                  .WhereEqualTo("isActive", true);
    var snapshot = await query.GetSnapshotAsync();
    var accommodations = snapshot.Documents
        .Select(doc => doc.ConvertTo<Accommodation>())
        .ToList();
    return accommodations;
}
```

### Flujo de Escritura (POST/PUT)

```
Frontend HTTP POST
    ↓
Backend Controller recibe request + datos
    ↓
Controller valida (roles, formatos)
    ↓
Service aplica lógica de negocio
    ↓
Service llama FirebaseService.SetDocumentAsync() o UpdateAsync()
    ↓
FirebaseService escribe en Firestore
    ↓
Si éxito: Firestore devuelve confirmación
    ↓
Backend devuelve al Frontend
```

**Ejemplo:** `POST /api/reservations`
```csharp
public async Task<Reservation> CreateReservation(CreateReservationRequest req)
{
    // Validar disponibilidad
    var conflicts = await CheckAvailability(req.AccommodationId, req.CheckInDate, req.CheckOutDate);
    if (conflicts.Count > 0) throw new Exception("No disponible");
    
    // Crear documento
    var reservation = new Reservation
    {
        Id = Guid.NewGuid().ToString(),
        UserId = req.UserId,
        AccommodationId = req.AccommodationId,
        CheckInDate = req.CheckInDate,
        CheckOutDate = req.CheckOutDate,
        Status = "confirmed",
        CreatedAt = DateTime.UtcNow
    };
    
    // Guardar en Firestore
    await db.Collection("Reservations").Document(reservation.Id).SetAsync(reservation);
    return reservation;
}
```

## Transacciones (Atomicidad)

Para operaciones críticas (crear reserva + registrar pago juntos):
```csharp
var batch = db.StartBatch();

// Agregar operaciones
batch.Set(db.Collection("Reservations").Document(reservationId), reservation);
batch.Set(db.Collection("PaymentRecords").Document(paymentId), payment);

// Confirmar todas o ninguna
await batch.CommitAsync();
```

## Índices

Firestore necesita índices para consultas complejas. Ejemplos:
- `Reservations`: índice en `(accommodationId, status, checkInDate)` para consultas de disponibilidad.
- `Reviews`: índice en `(accommodationId, createdAt)` para listados ordenados.

Firestore los crea automáticamente; solo necesitamos especificarlo en reglas si queremos custom.

## Storage (Fotos)

Ruta: `gs://project-id.appspot.com/accommodations/photos/`

**Flujo de Upload (futuro):**
1. Frontend selecciona fotos.
2. Envía a Backend.
3. Backend sube a Firebase Storage.
4. Backend obtiene URL pública: `https://storage.googleapis.com/.../photo.jpg`.
5. Backend guarda URL en Firestore (colección Accommodations, campo photoUrls).

## Reglas de Seguridad (Firebase)

Para producción, definir reglas que:
- Solo admins pueden crear/editar alojamientos.
- Usuarios pueden crear reseñas solo si tienen reserva confirmada.
- Las preguntas son públicas de lectura; solo admins pueden responder.

Ejemplo (pseudo):
```
match /databases/{database}/documents {
  match /Users/{userId} {
    allow read: if request.auth != null;
    allow write: if request.auth.uid == userId || isAdmin();
  }
  
  match /Accommodations/{accommodationId} {
    allow read: if true; // público
    allow write: if isAdmin();
  }
  
  match /Reservations/{reservationId} {
    allow read: if request.auth.uid == resource.data.userId || isAdmin();
    allow write: if isAdmin(); // solo backend escribe
  }
}
```

## Diagnósticos en Backend

Para verificar conectividad:
- Logs en consola muestran: DNS resolution, TCP connect, Firestore operations.
- Si hay error `Grpc.Core.RpcException`, revisar:
  1. Variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` correcta.
  2. Archivo `firebase-key.json` válido y con permisos.
  3. Acceso a internet y no bloqueado por firewall/proxy.

## Puntos Clave en la Defensa

1. **Estructura de colecciones:** Explicar por qué se diseñó así (desnormalización para velocidad).
2. **Validación de disponibilidad:** Cómo Firestore query permite prevenir overbooking.
3. **Atomicidad:** Transacciones para garantizar consistencia.
4. **Auditoría:** Todos los documentos tienen `createdAt`, muchos tienen `createdBy`.
5. **Escalabilidad:** NoSQL permite crecer sin problemas de schema.
6. **Integración Admin SDK:** Por qué Backend usa Admin SDK y no cliente SDK.

---
**Última actualización:** 2026-06-15
