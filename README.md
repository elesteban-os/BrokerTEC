# BrokerTEC

Sistema de trading de acciones desarrollado con Node.js, TypeScript, SQL Server y Next.js.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Inicialización de Datos](#inicialización-de-datos)
5. [Ejecución del Sistema](#ejecución-del-sistema)
6. [Usuarios de Prueba](#usuarios-de-prueba)
7. [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## Requisitos Previos

- **Node.js** v18 o superior
- **SQL Server** (local)
- **Git**
- **npm**

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd BrokerTEC
```

### 2. Instalar dependencias del backend

```bash
cd API
npm install
cd ..
```

### 3. Instalar dependencias del frontend

```bash
cd frontend\broker-tec
npm install
cd ..\..
```

---

## Configuración de Base de Datos

### 1. Configurar SQL Server

1. El servidor debe estar en el puerto **1435**
2. Habilitar autenticación mixta:

   - Abrir SQL Server Management Studio (SSMS)
   - Clic derecho en el servidor > Propiedades > Seguridad
   - Seleccionar **"SQL Server and Windows Authentication mode"**
   - Reiniciar el servicio de SQL Server

3. Crear la base de datos:
   ```sql
   CREATE DATABASE BrokerTEC;
   ```

### 2. Crear usuario de base de datos

En SSMS, ejecutar:

```sql
CREATE LOGIN userdev WITH PASSWORD = 'passworddev';
USE BrokerTEC;
CREATE USER userdev FOR LOGIN userdev;
ALTER ROLE db_owner ADD MEMBER userdev;
USE master;
ALTER SERVER ROLE sysadmin ADD MEMBER userdev;
```

### 3. Verificar variables de entorno

El archivo `.env` ya existe en `API/.env`. Solo verifica que coincida con tu configuración:

```env
DB_HOST=localhost
DB_PORT=1435
DB_USER=userdev
DB_PASS=passworddev
DB_NAME=BrokerTEC
```

---

## Inicialización de Datos

### 1. Crear tablas (Opción A - Recomendado)

Desde la raíz del proyecto:

```bash
cd API
npm run migration:run
```

### 1. Crear tablas (Opción B - Manual)

1. Abrir SQL Server Management Studio
2. Conectarse a la base de datos **BrokerTEC**
3. Abrir el archivo `API\src\db\seeds\Create_Tables.sql`
4. Ejecutar el script

### 2. Instalar Stored Procedures

**IMPORTANTE**: Antes de iniciar la aplicación, debes instalar los Stored Procedures.

1. En SSMS, conectarse a la base de datos **BrokerTEC**
2. Ir a la carpeta `API\Stored Procedures`
3. Ejecutar cada archivo `.sql` en el siguiente orden:
   - `usp_CreateWalletForTrader.sql`
   - `usp_ComprarAcciones.sql`
   - `usp_VenderAcciones.sql`
   - `usp_LiquidarTodoTrader.sql`
   - `usp_DelistEmpresa.sql`
   - `usp_DisableTrader.sql`
   - `usp_BulkUpdatePrecios.sql`
   - `usp_GetDistribucionAccionesMercado.sql`
   - `usp_GetMayorTenedorPorEmpresa.sql`

### 3. Poblar la base de datos

1. En SSMS, conectarse a la base de datos **BrokerTEC**
2. Abrir el archivo `API\src\db\seeds\simulacion_5_dias_completa.sql`
3. Ejecutar el script

Esto insertará usuarios de prueba, mercados, empresas y datos históricos.

---

## Ejecución del Sistema

**IMPORTANTE**: Ejecutar primero el backend y luego el frontend.

### 1. Iniciar el backend (API)

Terminal 1:

```bash
cd API
npm run dev
```

Deberías ver: `API running on http://localhost:3000`

### 2. Iniciar el frontend

Terminal 2:

```bash
cd frontend\broker-tec
npm run dev
```

Deberías ver: `Ready on http://localhost:3001`

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3000/api-docs

---

## Usuarios de Prueba

| Rol           | Usuario  | Contraseña |
| ------------- | -------- | ---------- |
| Administrador | admin    | HolaHola1  |
| Analista      | analista | Holahola1  |
| Trader        | trader   | Holahola1  |

---

## Tecnologías Utilizadas

**Backend:**

- Node.js + TypeScript
- Express
- TypeORM
- SQL Server
- JWT
- Swagger

**Frontend:**

- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Recharts

---

## Comandos Útiles

**Backend:**

```bash
npm run dev              # Modo desarrollo
npm run build            # Compilar proyecto
npm run migration:run    # Ejecutar migraciones
```

**Frontend:**

```bash
npm run dev              # Modo desarrollo
npm run build            # Compilar proyecto
```

---

## Problemas Comunes

**No conecta a SQL Server:**

- Verificar que SQL Server esté corriendo
- Confirmar puerto 1435
- Revisar credenciales en `.env`

**Puerto 3000 ocupado:**

- Cerrar aplicaciones que usen el puerto
- O cambiar el puerto en `.env`

**Error en migraciones:**

- Verificar que la base de datos exista
- Confirmar permisos del usuario
- Intentar crear tablas manualmente

**Frontend no conecta al backend:**

- Verificar que ambos servidores estén corriendo
- Confirmar que el backend esté en puerto 3000
