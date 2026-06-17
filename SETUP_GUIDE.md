# Setup rápido — StayHn

Este documento explica lo mínimo necesario para poner el proyecto en marcha en una máquina de desarrollo Windows.

Requisitos
- .NET SDK 10
- Node.js (v16+) y npm
- Cuenta de Firebase con un proyecto creado

1) Credenciales de Firebase
 - En Firebase Console → Project settings → Service accounts → Generate new private key.
 - Guarda el JSON en un lugar seguro, por ejemplo `C:\dev\stayhn\firebase-key.json`.
 - Exporta la variable de entorno (PowerShell):
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\dev\stayhn\firebase-key.json'
```

2) Backend (.NET)
 - Abre una terminal en la raíz del repo y ejecuta:
```powershell
cd ProyectoClaseG4
dotnet restore
dotnet run --urls "http://localhost:5042"
```
 - Comprueba `http://localhost:5042/swagger` para ver los endpoints si estás en Development.

3) Frontend (Angular)
 - En otra terminal:
```bash
cd stayhn-frontend
npm install
npm start
```
 - Abre `http://localhost:4200`.

Consejos y troubleshooting
- Si `dotnet run` no encuentra las credenciales, confirma que `GOOGLE_APPLICATION_CREDENTIALS` apunta a un archivo válido y que `Firebase:ProjectId` coincide con `project_id` del JSON.
- Si Angular falla por políticas de PowerShell al ejecutar `npm`, usa `npm.cmd` o ajusta la política (`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`).
- Para pruebas rápidas, puedes editar manualmente un documento en `Users` y marcar `role: admin`.




