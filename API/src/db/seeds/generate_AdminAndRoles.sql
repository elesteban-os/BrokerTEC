-- Insertar roles a la tabla roles
INSERT INTO roles (role_name)
VALUES
    ('ADMINISTRADOR'),
    ('ANALISTA'),
    ('TRADER');

-- Insertar administrador a la tabla usuarios
INSERT INTO usuarios (
    alias, email, nombre, apellido1, apellido2, password, country_origin, id_role
)
VALUES (
    'usuarioAdmin',
    'useradmin@brokertec.com',
    'Josue',
    'Monge',
    'Sanabria',
    '$2a$12$kvw4cbUyRKz0/uBxPkXm/eb03NcyppV.yv1g7iHEgtJG0nmxW02X2', -- Contraseña encriptada con bcrypt "Holahola1"
    'Costa Rica',
    1
);

-- Insertar números de teléfono para el administrador en la tabla PhoneNumber_User
INSERT INTO PhoneNumber_User (id_user, phone_number)
VALUES
    ((SELECT id_user FROM usuarios WHERE alias = 'usuarioAdmin'), '8888-1234'),
    ((SELECT id_user FROM usuarios WHERE alias = 'usuarioAdmin'), '2222-5678');