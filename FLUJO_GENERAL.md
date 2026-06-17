# Flujo General del Sistema — StayHn

## Visión Completeta (Ciclo de Vida de una Reserva)

StayHn funciona alrededor de un flujo principal: un huésped busca un alojamiento, verifica disponibilidad en fechas específicas, realiza una reserva, completa un pago simulado y recibe confirmación. Todo queda registrado en Firestore.

### Diagrama del Flujo (resumen)

```
1. Usuario llega → Login / Registro
     ↓
2. Navega a "Buscar Alojamientos"
     ↓
3. Ve lista de alojamientos disponibles
     ↓
4. Selecciona uno → Ve detalle (fotos, descripción, reseñas)
     ↓
5. Elige fechas de entrada y salida → Sistema valida disponibilidad
     ↓
6. Si está disponible → Accede al formulario de reserva
     ↓
7. Completa formulario de pago simulado
     ↓
8. Envía reserva → Backend valida y registra en Firestore
     ↓
9. Recibe confirmación con número de referencia
     ↓
10. Puede ver su reserva en "Mis Reservas"
     ↓
11. Después de la estadía → Puede dejar reseña y calificación
```

## Desglose por Capas

### Frontend (Angular 18)
- **Responsabilidad:** Mostrar UI, recopilar datos del usuario, validar inputs locales.
- **Flujo:** Usuario interactúa con componentes → se envían peticiones HTTP al backend → se muestran respuestas o errores.

### Backend (ASP.NET Core 10)
- **Responsabilidad:** Recibir peticiones, validar lógica de negocio, comunicarse con Firestore.
- **Flujo:** Petición HTTP → Autenticación (JWT) → Validación de disponibilidad → Escritura en Firestore → Respuesta.

### Firebase / Firestore
- **Responsabilidad:** Persistencia de datos. Almacenar usuarios, alojamientos, reservas, reseñas, preguntas.
- **Flujo:** Backend escribe/lee documentos → Datos quedan en colecciones Firestore.

## Casos de Uso Principales

### 1. Registro e Inicio de Sesión
- Usuario ingresa email y contraseña → Backend valida en Firestore → Genera JWT → Frontend lo guarda en localStorage.

### 2. Búsqueda de Alojamientos
- Frontend solicita lista de alojamientos → Backend trae de Firestore → Frontend los muestra con foto y precio.

### 3. Verificar Disponibilidad
- Usuario elige fechas → Frontend envía rango → Backend revisa colección Reservations → Responde sí/no.

### 4. Crear Reserva
- Frontend envía datos (fecha entrada, fecha salida, usuario, alojamiento) → Backend valida atómicamente → Escribe en Firestore → Devuelve número de referencia.

### 5. Pago Simulado
- Frontend muestra formulario → Usuario ingresa datos (sin procesamiento real) → Backend valida formato → Registra en PaymentRecords.

### 6. Dejar Reseña
- Usuario con reserva confirmada → Escribe comentario y estrellas → Backend valida que tenga reserva → Guarda en colección Reviews.

### 7. Preguntas y Respuestas
- Usuario pregunta sobre alojamiento → Pregunta se guarda en Firestore → Admin la ve en panel y responde → Respuesta visible para todos.

## Autenticación y Autorización

- **JWT (JSON Web Token):** Se genera al login con claims: `id`, `email`, `role` (guest/admin), `fullName`.
- **Roles:**
  - **Guest:** Puede buscar, reservar, dejar reseñas, hacer preguntas.
  - **Admin:** Puede gestionar alojamientos, ver reportes, moderar reseñas/preguntas, promover usuarios.
- **Middleware en Backend:** Cada petición valida que el token no haya expirado y que el usuario tiene permisos.

## Validaciones Críticas

1. **Disponibilidad:** Antes de crear reserva, backend consulta todas las reservas confirmadas en ese período.
2. **Atomicidad:** La creación de reserva y bloqueo de fechas se hacen juntas (transacción Firestore).
3. **Una reseña por usuario por alojamiento:** Si ya hay reseña, se rechaza la nueva.
4. **Solo admins pueden responder preguntas:** Validación en backend.

## Infraestructura

- **Credenciales Firebase:** Archivo `firebase-key.json` en raíz (no commiteado).
- **CORS:** Backend permite solicitudes desde `http://localhost:4200` (frontend).
- **Tokens JWT:** Firmados con clave en `appsettings.json` (en desarrollo; en producción sería un vault).
- **Logging:** Backend escribe eventos de autenticación y operaciones críticas en consola (upgradeable a sistema de logs).

## Siguiente Paso en Desarrollo

El flujo está diseñado. Ahora falta:
- Completar componentes faltantes en frontend (búsqueda avanzada, filtros).
- Terminar módulo de admin (CRUD de alojamientos, reportes gráficos).
- Tests E2E para validar el flujo completo de reserva.

---
**Última actualización:** 2026-06-15
