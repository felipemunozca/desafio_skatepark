/**
 * inicializar el proyecto
 * > npm init -y
 * 
 * instalar el paquete express
 * > npm i express
 * 
 * instalar el paquete handlebars
 * > npm i express-handlebars
 * 
 * instalar el paquete fileupload
 * > npm i express-fileupload
 * 
 * instalar el paquete pg
 * > npm i pg
 * 
 * instalar nodemon como dependencia de desarrollo
 * > npm i nodemon -D
 * 
 * crear una nueva ruta de carpetas:
 * views carpeta en donde estaran las vistas en formato handlebars.
 * layout carpeta en donde estara el archivo principal o main del proyecto.
 * partials la carpeta en donde se agregan estractos de codigo html que se reutilizaran.
 * crear la carpeta public, dentro la carpeta assets y dentro de esta 3 carpetas: css, img, js.
 * 
 * instalar el paquete json web token
 * > npm i jsonwebtoken
 * 
 * instalar el paquete dotenv para trabajar con variables de entorno
 * (no es algo que el ejercicio pida, es un extra del profesor para aprender su uso)
 * > npm i dotenv
 * 
 * crear una nueva carpeta llamada middleware para optimizar y reutilzar codigo de mejor manera.
 * agregar dentro de la carpeta el archivo auth.js
 * 
 * instalar el paquete express-session para manejar sesiones.
 * > npm i express-session
 * 
 * agregar el enlace CDN de sweetalert2 dentro del header de main.handlebars para mostrar mejores alertas en pantalla.
 * 
 * instalar el paquete uuid para renombrar las imagenes y evitar que al subir una con el mismo nombre se elimine mas de una vez.
 * > npm i uuid
 */

/* se requiere el paquete dotenv pero no se le asigna una variable, ya que no se va a almacenar 
solo se utilizara su metodo config para leer el archivo. */
require("dotenv").config();

/* Se declaran las los paquetes a utilizar. */
const express = require('express');
app = express();
const { create } = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const session = require('express-session');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

/* se llaman a las funciones creadas en el archivo consultasBD.js */
const { listarUsuarios, 
    loginUsuario, 
    registrarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarEstado } = require('./consultasBD');

app.listen(3000, console.log("Servidor corriendo en http://localhost:3000/"));


/* Se establecen los middleware */
app.use(express.urlencoded({extended: false}));
app.use(express.json());
/* Se deja publica la carpeta assets para llamar a los archivos que estan dentro. */
app.use("/assets", express.static(__dirname + "/public/assets"));

/* Se fija con file upload que el tamaño de las imagenes no podran superar los 10 Mb. */
app.use(expressFileUpload({
    limits: 10000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen ha superado el limite permitido (10mb)"
}))

/* Se crea un nuevo middleware para crear la configuración para utilizar sesiones. */
/* Se define una contraseña (secret), puede ser cualquier palabra o secuencias numerica, esto es para proteger la seguridad de la sesion. */
/* Con resave se genera una cookie de sesión que se puede reutilizar dentro de las diferentes vistas. */
/* Con saveUninitialized se crea un objeto de sesión vacio. Si no se le pasan datos al archivo, el objeto puede quedar vacio.  */
app.use(session({
    secret: "123456",
    resave: false,
    saveUninitialized: true
}))

/* Se define un nuevo middleware, con este se podra utilizar la sesión en todas las vistas. */
/* Se crea una variable de sesion de forma local. */
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})

/* Se configura los handlebars y la ruta de las vistas y los parciales. */
const hbs = create({
    partialDir: ["views/partials"]
})
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views")


/*** ENDPOINTS ***/

/* Ruta raiz del programa. */
/* Se llama a la función para traer todos los usuarios registrados en la base de datos. */
/* Despues se renderiza la vista index.handlebars. */
app.get("/", (req, res) => {
    listarUsuarios()
        .then(respuesta => {
            res.render("index", {
                usuarios: respuesta
            })
        })
        .catch(error => {
            res.status(500);
            res.send({code: 500, message: "Ha ocurrido un error"});
            console.log(error);
        });
})

/* Ruta /login para renderizar la vista login.handlebars. */
app.get("/login", (req, res) => {
    res.render("login");
})

/* Ruta /login para iniciar sesión. */
/* Se crean dos nuevas constantes y utilizando destructuring, se separa la informacion que esta trayendo el body
desde el formulario login. */
/* Se utiliza un arreglo para pasar los valores de email y password a la funcion para loguearse. */
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    /* skater es el payload que trae toda la informacion del usuario desde la consulta SQL. */
    /* Se crea un token utilizando el metodo sign() al cual se le pasas como primer parametro el payload con la informacion,
    el segundo parametro es la llave con la que se firmara el token y como tercer parametro, un objeto que indicara la duracion
    del token, se debe anotar en segundos, si necesito que el token dure algunos minutos, se puede multiplicar la cantidad de minutos
    por los 60 segundos de cada minuto, por ejemplo: 10 minutos -> 10 * 60 */
    /* Se crea una nueva variable utilizando req.session y el atributo email. */
    /* Asi se puede pasar el email que se esta recibiendo en el body para imprimirlo en el login o en el menu. */
    /* Se crea una nueva variable, llamada token, a la cual se le pasa el token, para ser utilizada en otros endpoints. */
    loginUsuario([email, password])
        .then(skater => {
        const token = jwt.sign(skater, process.env.SECRET_PASSWORD, {
            expiresIn: 60,
        });
        req.session.email = skater.email;
        res.send({token: token});
            
        })
        .catch(error => {
            res.status(500);
            res.send({code: 500, message: "Ha ocurrido un error al traer los datos"});
            console.log(error);
        })
});


/* Ruta /datos para renderizar la vista datos. */
/* Se le agrega la variable auth la cual esta enlazada al archivo auth.js para validar si existe un token valido o no. */
/* Se crea una variable usuario, la cual almacenara los datos del usuario que llegan por el body. */
/* Ademas de renderizar la vista, se disponibiliza un objeto skater para que reciba los valores de usuario. */
app.get("/datos", auth, async (req, res) => {
    let usuario = req.body.usuario;
    res.render("datos", {
        skater: usuario
    });
})

/* Ruta /registro para renderizar la vista registro. */
app.get("/registro", (req, res) => {
    res.render("registro")
});

/* Ruta /registro para registrar un nuevo usuario. */
/* Se declaran las variables en el orden que se recibira la informacion desde el formulario de datos. */
/* Se crea una constante para obtener el nombre de la foto. */
app.post("/registro", (req, res) => {
    let { email, nombre, password, anos_experiencia, especialidad} = req.body;
    let fotoPerfil = req.files.foto;
    let nombreFoto = fotoPerfil.name;
    let datos = [email, nombre, password, anos_experiencia, especialidad, nombreFoto];

    registrarUsuario(datos)
        .then(resultado => res.send(resultado))
        .catch(error => res.status(500).send({code: 500, message: 'Ha ocurrido un error al registrar un nuevo skater en la BD'}));

    /* Se agrega el metodo mv() para mover la imagen a la ruta definida, guardandola con el nombre del archivo. */
    /* Mas adelante tratar de usar uuid para renombrar las imagenes con un codigo unico. */
        fotoPerfil.mv(`${__dirname}/public/assets/img/${nombreFoto}`, (err) => {
        if (err) {
            console.log("No se pudo subir la imagen al servidor")
        } else {
            console.log("Se subio la imagen al servidor.")
        }
    });
});

/* Ruta /registro para actualizar la info de un usuario. */
app.put("/registro", (req, res) => {
    let { id, nombre, password, anos_experiencia, especialidad} = req.body;
    let datos = [id, nombre, password, anos_experiencia, especialidad];
    
    actualizarUsuario(datos)
        .then(resultado => res.send(resultado))
        .catch(error => res.status(500).send({code: 500, message: 'Ha ocurrido un error al actualizar los datos del skater en la BD'}));
});

/* Ruta /registro para eliminar un usuario. */
/* Se recibe el id para ejecutar la consulta SQL. */
/* Se recibe el nombre para buscar la imagen en la carpeta img y eliminarla. */
app.delete("/registro/:id", (req, res) => {
    let { id } = req.params;
    let { foto } = req.body;
    let datos = [id];
    let nombreFoto = [foto];
    
    console.log(nombreFoto)
    console.log(datos)
    
    eliminarUsuario(datos)
        .then(resultado => res.send(resultado))
        .catch(error => res.status(500).send({code: 500, message: 'Ha ocurrido un error al eliminar un skater en la BD'}));
    
    fs.unlink(`${__dirname}/public/assets/img/${nombreFoto}`, (err) => {
    //fs.mv(`${__dirname}/public/assets/img/${nombreFoto}`, (err) => {
        if (err) {
            console.log("Error al eliminar la fotografia", err);
        } else {
            console.log("Fotografia eliminada con exito.");
        }
    });
    
});

/* Ruta /admin para renderizar la vista admin. */
app.get("/admin", async (req, res) => {
    const usuarios = await listarUsuarios();
    res.render("Admin", { usuarios })
});

/* Ruta /admin para actualizar el estado de los skaters. */
/* Se crea un destructuring para recibir el estado y el id. */
app.put('/admin', async (req, res) => {
    const { estado, id } = req.body;

    await actualizarEstado(estado, id)
        .then(resultado => res.send(resultado))
        .catch(error => res.status(500).send({code: 500, message: 'Ha ocurrido un error al cambiar el estado en la BD'}));
});

/* Ruta /logout para destruir y limpiar la sesión.  */
/* clear() método que al invocarlo, elimina o "limpia" todos los registros del almacén local (token). */
app.get("/logout", (req, res) => {
    req.session.destroy();
    req.localStorage.clear();
    storage.clear();
})

/* Ruta por defecto, en donde se renderizara la vista 404. */
app.get("*", (req, res) => {
    res.render("404");
})