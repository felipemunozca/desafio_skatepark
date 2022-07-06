require("dotenv").config();

const express = require('express');
app = express();
const { create } = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const session = require('express-session');
const fs = require('fs');

const { listarUsuarios, 
    loginUsuario, 
    registrarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarEstado,
    buscarUsuarioPorId } = require('./consultasBD');

app.listen(3000, console.log("Servidor corriendo en http://localhost:3000/"));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use("/assets", express.static(__dirname + "/public/assets"));

app.use(expressFileUpload({
    limits: 10000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen ha superado el limite permitido (10mb)"
}))

app.use(session({
    secret: "123456",
    resave: false,
    saveUninitialized: true
}))

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})

const hbs = create({
    partialDir: ["views/partials"]
})
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views")


/*** ENDPOINTS ***/

/* Ruta raiz del programa. */
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
app.post("/login", (req, res) => {
    const { email, password } = req.body;

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
app.post("/registro", (req, res) => {
    let { email, nombre, password, anos_experiencia, especialidad} = req.body;
    let fotoPerfil = req.files.foto;
    let nombreFoto = fotoPerfil.name;
    let datos = [email, nombre, password, anos_experiencia, especialidad, nombreFoto];

    registrarUsuario(datos)
        .then(resultado => {
            res.send(resultado);
            fotoPerfil.mv(`${__dirname}/public/assets/img/${nombreFoto}`);
        })
        .catch(error => res.status(500).send({code: 500, message: 'Ha ocurrido un error al registrar un nuevo skater en la BD'}));
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
app.delete("/registro/:id", async (req, res) => {
    let { id } = req.params;
    let datos = [id];

    const buscarPorId = await buscarUsuarioPorId(id);
    const { foto } = buscarPorId;
    
    eliminarUsuario(datos)
        .then((resultado) => {
            res.send(resultado)
            fs.unlinkSync(`${__dirname}/public/assets/img/${foto}`)
        })
        .catch(error => res.status(500).send({code: 500, message: 'Ha ocurrido un error al eliminar un skater en la BD'}));
});

/* Ruta /admin para renderizar la vista admin. */
app.get("/admin", async (req, res) => {
    const usuarios = await listarUsuarios();
    res.render("Admin", { usuarios })
});

/* Ruta /admin para actualizar el estado de los skaters. */
app.put('/admin', async (req, res) => {
    const { estado, id } = req.body;

    await actualizarEstado(estado, id)
        .then(resultado => res.send(resultado))
        .catch(error => res.status(500).send({code: 500, message: 'Ha ocurrido un error al cambiar el estado en la BD'}));
});

/* Ruta /logout para destruir y limpiar la sesión.  */
app.get("/logout", (req, res) => {
    req.session.destroy();
    req.localStorage.clear();
    storage.clear();
})

/* Ruta por defecto, en donde se renderizara la vista 404. */
app.get("*", (req, res) => {
    res.render("404");
})