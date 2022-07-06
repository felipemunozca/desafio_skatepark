# desafio_skatepark

_Prueba final del módulo El framework Express_

## Tecnologias a utilizar:
* NPM
* Express
* Handlebars
* PostgreSQL
* JWT
* Express-fileupload
* File-system
* PG

## Indicaciones:
* El sistema debe permitir registrar nuevos participantes.
* Se debe crear una vista para que los participantes puedan iniciar sesión con su correo y contraseña.
* Luego de iniciar la sesión, los participantes deberán poder modificar sus datos, exceptuando el correo electrónico y su foto. Esta vista 
debe estar protegida con JWT y los datos que se utilicen en la plantilla deben ser extraídos del token. 
* La vista correspondiente a la ruta raíz debe mostrar todos los participantes registrados y su estado de revisión.
* La vista del administrador debe mostrar los participantes registrados y permitir aprobarlos para cambiar su estado.

## Requerimientos
_1. Crear una API REST con el Framework Express._

_2. Servir contenido dinámico con express-handlebars._

_3. Ofrecer la funcionalidad Upload File con express-fileupload._

_4. Implementar seguridad y restricción de recursos o contenido con JWT._
