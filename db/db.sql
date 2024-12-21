DROP DATABASE IF EXISTS spinsa;
CREATE DATABASE IF NOT EXISTS spinsa DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE spinsa;
--------------------CREACION DE TABLAS------------------------------------
-- Tabla de roles
CREATE TABLE roles (
    id_rol INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion_permisos TEXT
);
-- Tabla de marca
CREATE TABLE marca (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre_marca VARCHAR(100) NOT NULL
);
-- Tabla de usuario
-- Un usuario pertenece a un rol y administra una marca
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    ap_usuario VARCHAR(50) NOT NULL,
    am_usuario VARCHAR(50) NOT NULL,
    estatus_usuario VARCHAR(20) NOT NULL,
    correo_usuario VARCHAR(100) NOT NULL UNIQUE,
    contrasena_usuario VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    id_marca INT,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca)
);
-- Tabla de pieza
CREATE TABLE pieza (
    id_pieza INT AUTO_INCREMENT PRIMARY KEY,
    nombre_pieza VARCHAR(100) NOT NULL,
    descripcion_pieza TEXT
);
-- Tabla de inventario
-- Cada marca tiene un inventario (1:1), y el inventario se asocia a una pieza.
CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_marca INT NOT NULL,
    id_pieza INT NOT NULL,
    cantidad_inventario INT NOT NULL,
    fecha_ultimo_movimiento DATE,
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca),
    FOREIGN KEY (id_pieza) REFERENCES pieza(id_pieza)
);
-- Tabla de produccion
-- Una marca tiene múltiples producciones (1:N),
-- y cada producción se asocia a una pieza.
CREATE TABLE produccion (
    id_produccion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_marca INT NOT NULL,
    id_pieza INT NOT NULL,
    folio_produccion VARCHAR(50) NOT NULL UNIQUE,
    cantidad_produccion INT NOT NULL,
    estatus_produccion BOOLEAN NOT NULL,
    aprobado_produccion BOOLEAN DEFAULT FALSE,
    nombre_produccion VARCHAR(100) NOT NULL,
    descripcion_produccion TEXT,
    FS_produccion DATE,
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca),
    FOREIGN KEY (id_pieza) REFERENCES pieza(id_pieza)
);
--
--
--
--------------------INGRESO DE DATOS BASICOS------------------------------------
--
--
--Insert ROLES:
INSERT INTO roles (id_rol, nombre_rol, descripcion_permisos)
VALUES (
        128,
        'Administrador General',
        'permisos completos a todo el sistema'
    ),
    (
        64,
        'Administrador de Marca',
        'permisos para una sola marca'
    );
--Insert MARCA:
INSERT INTO marca (id_marca, nombre_marca)
VALUES(4, 'Audi'),
    (3, 'Penta nova'),
    (2, 'Tesla'),
    (1, 'Volkswagen');
-------------------------------
INSERT INTO usuario (
        estatus_usuario,
        nombre_usuario,
        ap_usuario,
        am_usuario,
        correo_usuario,
        contrasena_usuario,
        id_rol,
        id_marca
    )
VALUES (
        1,
        'Avimael',
        'Jiménez',
        'Herrera',
        'avimael.herrera@spinsa.com.mx',
        SHA2('AVJimenezH25#', 256),
        128,
        NULL
    ),
    (
        1,
        'Jesus',
        'Xolo',
        'Fiscal',
        'jesusxolo@spinsa.com.mx',
        SHA2('JXfiscal#2024', 256),
        64,
        4
    ),
    (
        1,
        'Estefania',
        'Bello',
        'Lopez',
        'estefaniabello@spinsa.com.mx',
        SHA2('EBlopez24@', 256),
        64,
        3
    ),
    (
        1,
        'Jose Gabriel',
        'Trujillo',
        'Ramos',
        'josetrujillo@spinsa.com.mx',
        SHA2('JGtrujillo!24', 256),
        64,
        2
    ),
    (
        1,
        'Francisco Javier',
        'León',
        'Hernández',
        'franciscoleon@spinsa.com.mx',
        SHA2('FJLh2024!', 256),
        64,
        1
    );