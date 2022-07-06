const { Pool } = require('pg');

//llamo a las variables de entorno del archivo .env para conectarme a la base  de datos. 
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    password: process.env.PASSWORD_DB,
    database:process.env.DATABASE,
    port: process.env.PORT_DB
});

const listarUsuarios = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const resultado = await pool.query("SELECT * FROM skaters ORDER BY id");
            resolve(resultado.rows);
        } catch (error) {
            console.log(error.code);
            console.log(error.message);
            reject(error);
        }
    })
}

//recibo el email y password como datos.
const loginUsuario = (datos) => {
    return new Promise(async (resolve, reject) => {
        try {
            //tener cuidado al realizar un select, tratar de evitar devolver el campo de la contraseña, por eso no ocupar un * en consultas que tengan que ver con datos vitales del programa.
            const consulta = {
                //text: "SELECT id, email, nombre, anos_experiencia, foto, estado FROM skaters WHERE email = $1 AND password = $2",
                text: "SELECT * FROM skaters WHERE email = $1 AND password = $2",
                values: datos
            }
            const result = await pool.query(consulta);

            //creo una validacion, si el resultado no tiene filas que mostrar, es decir, la consulta se ejecuta pero no encuentra ninguna coincidencia, se rechaza.
            //en caso contrario, resuelve los datos del usuario.
            if (result.rows.length == 0) {
                reject("Usuario no encontrado en la base de datos.");
            } else {
                console.log("Usuario encontrado");
                resolve(result.rows[0]);
            }  
        } catch (error) {
            console.log(error.code);
            console.log(error.message);
            reject(error);
        }
    })
}

const registrarUsuario = (datos) => {
    return new Promise(async (resolve, reject) => {
        const consulta = {
            text: `INSERT INTO skaters(email, nombre, password, anos_experiencia, especialidad, foto)
                   VALUES($1, $2, $3, $4, $5, $6) RETURNING *;`,
            values: datos
        }
        try {
            const respuesta = await pool.query(consulta);
            console.log("Usuario creado");
            resolve(respuesta.rows[0])
        } catch (error) {
            console.log(error.code);
            console.log(error.message);
            reject(error)
        }
    })
}


const actualizarUsuario = (datos) => {
    return new Promise(async (resolve, reject) => {
        const consulta = {
            text: `UPDATE skaters SET nombre = $2, password =$3, anos_experiencia = $4, especialidad = $5 
                   WHERE id = $1 RETURNING *;`,
            values: datos
        }
        try {
            const respuesta = await pool.query(consulta);
            console.log("Usuario actualizado");
            resolve(respuesta.rows[0])
        } catch (error) {
            console.log(error.code);
            console.log(error.message);
            reject(error)
        }
    })
};

const eliminarUsuario = (datos) => {
    return new Promise(async (resolve, reject) => {
        const consulta = {
            text: "DELETE FROM skaters WHERE id = $1 RETURNING *;",
            values: datos
        }
        try {
            const respuesta = await pool.query(consulta);
            console.log("Usuario eliminado");
            resolve(respuesta.rows[0])
        } catch (error) {
            console.log(error.code);
            console.log(error.message);
            reject(error)
        }
    })
};

const actualizarEstado = (estado, id) => {
    return new Promise(async (resolve, reject) => {
        const consulta = {
            text: `UPDATE skaters SET estado = $1 WHERE id = $2 RETURNING *;`,
            values: [estado, id]
        }
        try {
            const respuesta = await pool.query(consulta);
            console.log("Estado actualizado");
            resolve(respuesta.rows[0])
        } catch (error) {
            console.log(error.code);
            console.log(error.message);
            reject(error) 
        }
    })
};


const buscarUsuarioPorId = async (id) => {
    const consulta = {
        text: `SELECT * FROM skaters WHERE id = '${id}'`
    };

    try {
        const {rows: [usuario]}  = await pool.query(consulta);
        console.log("Usuario encontrado")
        return usuario;
    } catch (error) {
        console.log(error.code);
        console.log(error.message);
        return error; 
    }
}




module.exports = {
    listarUsuarios, loginUsuario, registrarUsuario, actualizarUsuario, eliminarUsuario, actualizarEstado, buscarUsuarioPorId
}