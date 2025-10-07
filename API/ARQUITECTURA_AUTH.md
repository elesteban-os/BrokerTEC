# Sistema de Autenticación BrokerTEC - Arquitectura Modular

## Endpoints Implementados

### Registro Público

- **POST** `/api/auth/register`
- Crea usuarios con rol TRADER (id_role = 3)
- Acceso público (sin autenticación)
- Genera tokens JWT automáticamente
- ** REGISTRA EN AUDITORÍA**: `USER_CREATE` con detalles del usuario

### Registro Administrativo

- **POST** `/api/auth/admin/register`
- Crea usuarios ADMIN (id_role = 1) o ANALISTA (id_role = 2)
- **✅ TOTALMENTE PROTEGIDO**: Requiere JWT + rol ADMINISTRADOR
- Genera tokens JWT automáticamente
- **✅ REGISTRA EN AUDITORÍA**: `USER_CREATE` para usuarios administrativos

### Autenticación

- **POST** `/api/auth/login` - Iniciar sesión
  - **✅ REGISTRA EN AUDITORÍA**: `LOGIN` (exitoso) o `LOGIN_FAILED` (fallido)
- **POST** `/api/auth/refresh` - Renovar tokens
- **POST** `/api/auth/logout` - Cerrar sesión
  - **✅ TOTALMENTE FUNCIONAL**: Requiere JWT válido
  - **✅ REGISTRA EN AUDITORÍA**: `LOGOUT` con información del usuario

## Características de Seguridad

### Passwords

- Hash con bcrypt (salt rounds: 12)
- Validación de mínimo 8 caracteres
- No se almacenan contraseñas en texto plano

### JWT Tokens

- **Access Token**: Corta duración (configurable)
- **Refresh Token**: Larga duración (configurable)
- Token versioning para invalidación de tokens
- Algoritmo HS256
- Issuer/Audience validation

### Validación de Datos

- DTOs con decoradores de validación
- Middleware `validateDto` para validación automática
- Manejo de errores específicos

### Sistema de Auditoría Integrado

- **Registro automático**: Todas las acciones de autenticación se registran en la tabla `auditoria`
- **Acciones auditadas**:
  - `LOGIN` - Login exitoso con detalles del usuario y rol
  - `LOGIN_FAILED` - Intentos de login fallidos con información del error
  - `USER_CREATE` - Creación de usuarios (tanto TRADER como ADMIN/ANALISTA)
  - `LOGOUT` - Cierre de sesión con invalidación de tokens
- **Información capturada**:
  - Usuario que realiza la acción (id_user, alias, rol)
  - Timestamp automático (fecha_hora)
  - Descripción legible de la acción
  - Estado exitoso/fallido con mensajes de error
  - IP y contexto adicional (próximo)
- **Cumplimiento**: Sistema diseñado para auditorías financieras y cumplimiento regulatorio

### 🛡️ Guards de Seguridad Implementados

- **JwtAuthGuard**: Middleware de autenticación JWT

  - Verifica tokens válidos y no expirados
  - Valida existencia y estado activo del usuario
  - Agrega información del usuario a `req.user`
  - Manejo de errores específicos (token expirado, inválido, etc.)

- **RolesGuard**: Middleware de autorización por roles

  - `RolesGuard.adminOnly()` - Solo ADMINISTRADOR
  - `RolesGuard.adminOrAnalyst()` - ADMINISTRADOR y ANALISTA
  - `RolesGuard.anyAuthenticated()` - Cualquier usuario autenticado
  - `RolesGuard.hasRole([roles])` - Roles específicos

- **Endpoints Protegidos**:
  - ✅ `/api/auth/admin/register` - Solo ADMINISTRADOR
  - ✅ `/api/auth/logout` - Cualquier usuario autenticado

## Roles del Sistema

| ID  | Nombre        | Descripción                                 |
| --- | ------------- | ------------------------------------------- |
| 1   | ADMINISTRADOR | Acceso completo, puede crear otros usuarios |
| 2   | ANALISTA      | Análisis de datos y reportes                |
| 3   | TRADER        | Usuario público, trading básico             |

## Patrones Implementados

### Separation of Concerns

- **Controllers**: Manejo de HTTP requests/responses
- **Services**: Lógica de negocio
- **DTOs**: Validación y serialización de datos
- **Guards**: Autenticación y autorización

### Single Responsibility Principle

- Cada controlador maneja una funcionalidad específica
- Servicios dedicados por tipo de operación
- DTOs específicos por endpoint

## 🚀 Próximos Pasos

### Guards de Autenticación

```typescript
// JWT Auth Guard
app.use("/api/auth/admin/*", jwtAuthGuard);

// Roles Guard
app.use("/api/auth/admin/register", rolesGuard(["ADMINISTRADOR"]));
```

### Middleware de Usuario

```typescript
// Agregar usuario al request
req.user = decodedToken;
```

### Endpoints Adicionales

- Password reset
- Email verification
- User profile management

## 📖 Documentación API

Todos los endpoints están documentados con Swagger:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

### Ejemplos de Uso

#### Registro Público

```bash
POST /api/auth/register
{
  "alias": "nuevo_trader",
  "email": "trader@brokertec.com",
  "nombre": "Juan",
  "apellido1": "Pérez",
  "password": "MiPassword123!",
  "country_origin": "Costa Rica",
  "phone_numbers": ["8888-1234"]
}
```

#### Login

```bash
POST /api/auth/login
{
  "alias": "nuevo_trader",
  "password": "MiPassword123!"
}
```

#### Refresh Token

```bash
POST /api/auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## ✅ Ventajas de la Arquitectura Modular

1. **Mantenibilidad**: Cada funcionalidad está claramente separada
2. **Escalabilidad**: Fácil agregar nuevos tipos de registro o autenticación
3. **Testing**: Servicios pueden ser testeados independientemente
4. **Documentación**: Swagger organizado por funcionalidad
5. **Reutilización**: JwtService compartido entre todos los servicios
6. **Seguridad**: Separación clara entre endpoints públicos y privados

Esta arquitectura modular hace que el código sea mucho más fácil de mantener, escalar y entender.
