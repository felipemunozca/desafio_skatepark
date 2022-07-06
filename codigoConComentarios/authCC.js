/* requerir el paquete de json web token */
const jwt = require("jsonwebtoken");

/* crear una función que se encargara de verificar el token. */
const verificarToken = (req, res, next) => {

    /* se crea una nueva contante llamada token, la cual recibira su valor de diferentes formas. */
    /* puede obtener los datos desde el body. */
    /* o puede obtener los datos como parte de una query. */
    /* o puede obtener los datos desde el encabezado mediante las propiedades x-access-token o authorization. */
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

    //si NO existe un token se envia un mensaje al cliente.
    /* SI token no tiene un valor, se envia un mensaje al navegador del usuario. */
    /* El codigo 403 o Forbidden indica que el servidor ha recibido y ha entendido la petición, pero rechaza enviar una respuesta. */
    if (!token) {
        return res.status(403).send({code: 403, message: "Usted no tiene los permisos necesarios para acceder a la ruta"})
    } else {
        //en caso contrario, se validara el token.

        /* En caso contrario, si token tiene un valor, se debe validar si es correcto o no. */
        /* Se crea una nueva constante que tendra el valor de los datos decodificados. */
        /* Se utiliza el metodo verify() para pasarle el token que escribio el cliente en el formulario de inicio de sesion y 
        despues se le pasa la llave con la que se cifro en el archivo .env . */
        /* Se crea una nueva propiedad req.body.usuario a la cual se le pasaran los datos decodificados. */
        /* Finalemnte, utilizando next() se le indica que puede pasar a la siguiente ruta. */

        /* Si se produce un error, el catch lo atrapara y mostrara un mensaje en el navegador del usuario. */
        /* El codigo 401 o Unauthorized indica que es necesario autenticar para obtener una respuesta. */
        try {
            const datosDecodificados = jwt.verify(token, process.env.SECRET_PASSWORD);
            req.body.usuario = datosDecodificados;
            return next();
        } catch (error) {
            return res.status(401).send({code: 401, message: "Token no válido, se le ha negado el acceso"});
        }
    }

}

/* Se exporta el modulo para ser utilizado en otros arvchivos. */
module.exports = verificarToken;