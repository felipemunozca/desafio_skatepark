
const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(403).send({code: 403, message: "Usted no tiene los permisos necesarios para acceder a la ruta"})
    } else {
        try {
            const datosDecodificados = jwt.verify(token, process.env.SECRET_PASSWORD);
            req.body.usuario = datosDecodificados;
            return next();
        } catch (error) {
            return res.status(401).send({code: 401, message: "Token no válido, se le ha negado el acceso"});
        }
    }

}

module.exports = verificarToken;