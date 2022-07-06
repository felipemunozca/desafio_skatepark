CREATE DATABASE skatepark;

CREATE TABLE skaters (
	id SERIAL PRIMARY KEY, 
	email VARCHAR(50) NOT NULL UNIQUE, 
	nombre VARCHAR(25) NOT NULL, 
	password VARCHAR(25) NOT NULL, 
	anos_experiencia INT NOT NULL, 
	especialidad VARCHAR(50) NOT NULL, 
	foto VARCHAR(255) NOT NULL, 
	estado BOOLEAN NOT NULL DEFAULT false
);

SELECT * FROM skaters;

--usuario de prueba
INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado)
VALUES ('tony@mail.cl', 'Tony Hawk', '123456', 20, 'Turn 900', 'tony.jpg', true);
