# BrokerTEC

Sistema de trading de acciones desarrollado con Node.js, TypeScript, SQL Server y Next.js.

---

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Inicialización de Datos](#inicialización-de-datos)
5. [Ejecución del Sistema](#ejecución-del-sistema)
6. [Verificación de Funcionamiento](#verificación-de-funcionamiento)
7. [Scripts Disponibles](#scripts-disponibles)
8. [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## Requisitos Previos

Antes de comenzar, asegúrese de tener instalado lo siguiente:

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **SQL Server** 2019 o superior (local o remoto)
- **Git** para clonar el repositorio
- **npm** (incluido con Node.js)

---

## Instalación

### Paso 1: Clonar el repositorio

Abra una terminal CMD o PowerShell y ejecute:

```bash
git clone <repository-url>
cd BrokerTEC
```

### Paso 2: Instalar dependencias del backend (API)

```bash
cd API
npm install
cd ..
```

### Paso 3: Instalar dependencias del frontend

```bash
cd frontend\broker-tec
npm install
cd ..\..
```

---

## Configuración de Base de Datos

### Paso 1: Configurar SQL Server

Asegúrese de que su instancia de SQL Server esté configurada correctamente:

1. **Verificar el puerto**: El servidor debe estar escuchando en el puerto **1435**.
2. **Habilitar autenticación mixta**:

   - Abra SQL Server Management Studio (SSMS)
   - Clic derecho en el servidor > Propiedades > Seguridad
   - Seleccione **"SQL Server and Windows Authentication mode"**
   - Reinicie el servicio de SQL Server

3. **Crear la base de datos**:
   ```sql
   CREATE DATABASE BrokerTEC;
   ```

### Paso 2: Crear usuario de base de datos

Ejecute los siguientes comandos en SSMS:

```sql
-- Crear login
CREATE LOGIN userdev WITH PASSWORD = 'passworddev';

-- Usar la base de datos
USE BrokerTEC;

-- Crear usuario
CREATE USER userdev FOR LOGIN userdev;

-- Asignar permisos
ALTER ROLE db_owner ADD MEMBER userdev;

-- Asignar roles de servidor
USE master;
ALTER SERVER ROLE sysadmin ADD MEMBER userdev;
```

### Paso 3: Verificar variables de entorno

El archivo `.env` en la carpeta `API` debe contener:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=1435
DB_USER=userdev
DB_PASS=passworddev
DB_NAME=BrokerTEC
DB_ENCRYPT=true
DB_TRUST_SERVER_CERT=true

JWT_SECRET=BrokerTEC_Super_Secret_Key_2025_Development
JWT_ACCESS_EXPIRATION=60m
JWT_REFRESH_EXPIRATION=7d
```

**Nota**: Este archivo ya existe en el proyecto. Solo verifique que los valores coincidan con su configuración de SQL Server.

---

## Inicialización de Datos

### Opción 1: Crear tablas usando TypeORM (Recomendado)

Abra una terminal CMD en la raíz del proyecto y ejecute:

```bash
cd API
npm run migration:run
```

Este comando creará automáticamente todas las tablas necesarias en la base de datos.

### Opción 2: Crear tablas manualmente

Si prefiere crear las tablas manualmente:

1. Abra SQL Server Management Studio
2. Conéctese a la base de datos **BrokerTEC**
3. Abra el archivo `API\src\db\seeds\Create_Tables.sql`
4. Copie el contenido y ejecútelo en una nueva consulta

### Poblar la base de datos

Una vez creadas las tablas, debe poblar la base de datos con datos de ejemplo:

1. Abra SQL Server Management Studio
2. Conéctese a la base de datos **BrokerTEC**
3. Abra el archivo `API\src\db\seeds\simulacion_5_dias_completa.sql`
4. Copie el contenido y ejecútelo en una nueva consulta

Este script insertará:

- Usuarios de ejemplo (administrador, analista, trader)
- Mercados y empresas
- Datos históricos de precios
- Simulación de 5 días de trading

---

## Ejecución del Sistema

**IMPORTANTE**: Debe iniciar primero el backend (API) antes que el frontend para asegurar que los puertos se asignen correctamente.

### Paso 1: Iniciar el backend (API)

Abra una terminal CMD en la raíz del proyecto:

```bash
cd API
npm run dev
```

Debería ver el mensaje:

```
API running on http://localhost:3000
```

**Mantenga esta terminal abierta.**

### Paso 2: Iniciar el frontend

Abra una **segunda terminal CMD** en la raíz del proyecto:

```bash
cd frontend\broker-tec
npm run dev
```

Debería ver el mensaje:

```
Ready on http://localhost:3001
```

**Mantenga ambas terminales abiertas mientras trabaja con la aplicación.**

---

## Verificación de Funcionamiento

### Backend (API)

Acceda a la documentación de la API:

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Frontend (Aplicación Web)

Acceda a la aplicación en su navegador:

- **URL**: [http://localhost:3001](http://localhost:3001)

### Usuarios de Prueba

Después de poblar la base de datos, puede iniciar sesión con:

| Rol           | Usuario  | Contraseña  |
| ------------- | -------- | ----------- |
| Administrador | admin    | admin123    |
| Analista      | analista | analista123 |
| Trader        | trader   | trader123   |

---

## Scripts Disponibles

### Backend (API)

```bash
npm run dev              # Iniciar servidor en modo desarrollo con hot-reload
npm run build            # Compilar TypeScript a JavaScript
npm start                # Iniciar servidor en modo producción
npm run migration:run    # Ejecutar migraciones de base de datos
npm run migration:revert # Revertir última migración
npm run migration:gen    # Generar nueva migración
```

### Frontend

```bash
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar aplicación para producción
npm start                # Iniciar servidor en modo producción
npm run lint             # Ejecutar linter
```

---

## Tecnologías Utilizadas

### Backend

- **Node.js** - Entorno de ejecución
- **TypeScript** - Lenguaje de programación
- **Express** - Framework web
- **TypeORM** - ORM para base de datos
- **SQL Server** - Sistema de gestión de base de datos
- **JWT** - Autenticación basada en tokens
- **Swagger** - Documentación de API

### Frontend

- **Next.js 15** - Framework de React
- **TypeScript** - Lenguaje de programación
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes de UI
- **Recharts** - Gráficos y visualizaciones

---

## Estructura del Proyecto

```
BrokerTEC/
├── API/
│   ├── src/
│   │   ├── config/         # Configuración (DB, Swagger, env)
│   │   ├── db/             # Migraciones y seeds
│   │   ├── entities/       # Entidades de TypeORM
│   │   ├── modules/        # Módulos de la aplicación
│   │   └── app.ts          # Punto de entrada
│   ├── .env                # Variables de entorno
│   └── package.json
│
└── frontend/
    └── broker-tec/
        ├── app/            # Páginas (Next.js App Router)
        ├── components/     # Componentes React
        ├── lib/            # Utilidades y configuración
        └── package.json
```

---

## Solución de Problemas Comunes

### Error: "Cannot connect to SQL Server"

- Verifique que SQL Server esté corriendo
- Confirme que el puerto 1435 esté abierto
- Verifique las credenciales en el archivo `.env`

### Error: "Port 3000 is already in use"

- Cierre cualquier aplicación que esté usando el puerto 3000
- O modifique el puerto en el archivo `.env`

### Error: "Migration failed"

- Verifique que la base de datos BrokerTEC exista
- Confirme que el usuario tenga permisos suficientes
- Intente crear las tablas manualmente (Opción 2)

### Frontend no se conecta al backend

- Verifique que ambos servidores estén corriendo
- Confirme que el backend esté en el puerto 3000
- Revise la consola del navegador para ver mensajes de error

---

## Contacto y Soporte

Para reportar problemas o solicitar ayuda, por favor abra un issue en el repositorio.

---

## Licencia

Este proyecto es privado y está desarrollado con fines académicos.
