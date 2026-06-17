<<<<<<< HEAD
# StayHn — Guía rápida del proyecto

Este repositorio contiene la API y el cliente de StayHn, una pequeña plataforma de reservas de alojamientos que estamos desarrollando como proyecto de clase.

Objetivo
- Permitir a administradores publicar y gestionar alojamientos.
- Permitir a huéspedes buscar, reservar y dejar reseñas.

Estructura (resumen)
- `ProyectoClaseG4/` — Backend en ASP.NET Core 10 (controladores, servicios, modelos).
- `stayhn-frontend/` — Frontend en Angular 18 (componentes, servicios, rutas).

Arranque rápido

Backend
1. En la raíz del repo, ejecuta:
```powershell
cd ProyectoClaseG4
dotnet run --urls "http://localhost:5042"
```
2. Antes de ejecutar, coloca `firebase-key.json` en la raíz del repositorio. El backend detecta automáticamente `../firebase-key.json` desde `ProyectoClaseG4`, y también puedes usar la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` o `appsettings.json` con `Firebase:CredentialPath`.

3. Para cambiar a otro proyecto de Firebase, actualiza `ProyectoClaseG4/appsettings.json` con:
   - `Firebase:ProjectId`
   - `Firebase:CredentialPath` (ruta al JSON si no está en la raíz)
   - `Firebase:AuthDomain` y `Firebase:StorageBucket` si tu proyecto nuevo los requiere.

Frontend
1. Abre otra terminal y ejecuta:
```bash
cd stayhn-frontend
npm install
npm start
```
2. Abre `http://localhost:4200`.

Crear un administrador (rápido)
- Manual: desde Firebase Console (Firestore) edita el documento del usuario y cambia `role` a `admin`.
- API: si ya existe un admin, usar `PUT /api/admin/users/{id}/promote` con `Authorization: Bearer <token>`.

Prueba básica
1. Regístrate como usuario (serás `guest`).
2. Busca un alojamiento, entra a su detalle y realiza una reserva.
3. Completa el pago simulado y revisa la colección `Reservations` en Firestore.

Dónde mirar el código
- Backend: `ProyectoClaseG4/Controllers`, `ProyectoClaseG4/Services`.
- Frontend: `stayhn-frontend/src/app/components`, `stayhn-frontend/src/app/services`.




---
=======
# Proyecto_StayHN
Proyecto de Alojamiento 
>>>>>>> d70c15e6aa03a99373863b90549887606f1510c2
