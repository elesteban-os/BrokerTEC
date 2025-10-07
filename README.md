# BrokerTEC

Sistema de trading desarrollado con Node.js, TypeScript y SQL Server.

## 📋 Prerequisitos

- **Node.js** v18+
- **SQL Server** (local)
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

1. El servidor de la BD debe estar en el puerto 1435
2. En propiedades del servidor -> seguridad -> server authentication -> Activar la opcion "SQL Server and Windows Authentication mode"
3. Crear un usuario con el Alias de "userdev" y su contraseña debe ser "passworddev"
4. En las propiedades del usuario creado debe hacer lo siguiente:
   a. Server Roles -> "public" y "sysadmin" check.
   b. User Mapping -> "BrokerTEC" y "master" check.

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

## Scripts Disponibles

```bash
npm run dev              # Desarrollo con hot-reload
npm run build           # Compilar TypeScript
npm start               # Ejecutar en producción
npm run migration:run   # Ejecutar migraciones
npm run migration:revert # Revertir última migración
npm run migration:gen   # Generar nueva migración
```

## Base de Datos

Este proyecto usa **TypeORM** con **SQL Server**. Las migraciones se encuentran en `src/db/migrations/`.

## Contribuir

1. Hacer fork del proyecto
2. Crear rama feature (`git checkout -b feat/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feat/nueva-funcionalidad`)
5. Abrir Pull Request
