# BrokerTEC

Sistema de trading desarrollado con Node.js, TypeScript y SQL Server.

## 📋 Prerequisitos

- **Node.js** v18+
- **SQL Server** (local o remoto)
- **npm** o **yarn**

### 1. Clonar e instalar dependencias

```bash
git clone <repository-url>
cd BrokerTEC/API
npm install
```

### 2. Configurar Base de Datos

Necesitas una instancia de SQL Server corriendo. Puedes usar:

- SQL Server local
- SQL Server Express
- Azure SQL Database
- Docker: `docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=TuPassword123!" -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest`

### 3. Ejecutar Migraciones

```bash
# Crear las tablas en la base de datos
npm run migration:run
```

### 4. Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
API/
├── src/
│   ├── config/          # Configuración de DB y variables
│   ├── db/migrations/   # Migraciones de base de datos
│   ├── modules/
│   │   └── users/       # Módulo de usuarios (CRUD)
│   └── app.ts          # Punto de entrada
├── .env                # Variables de entorno (incluidas en repo)
└── package.json
```

## 🔧 Scripts Disponibles

```bash
npm run dev              # Desarrollo con hot-reload
npm run build           # Compilar TypeScript
npm start               # Ejecutar en producción
npm run migration:run   # Ejecutar migraciones
npm run migration:revert # Revertir última migración
npm run migration:gen   # Generar nueva migración
```

## 🗃️ Base de Datos

Este proyecto usa **TypeORM** con **SQL Server**. Las migraciones se encuentran en `src/db/migrations/`.

### Entidades actuales:

- **User**: Gestión de usuarios del sistema

## 🤝 Contribuir

1. Hacer fork del proyecto
2. Crear rama feature (`git checkout -b feat/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feat/nueva-funcionalidad`)
5. Abrir Pull Request
