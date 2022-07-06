const btnCerrar = document.getElementById("btnCerrar");

btnCerrar.addEventListener("click", (e) => {
    e.preventDefault();

    /* la sintaxis para utilizar sweetalert2 es Swal.fire(titulo, subtitulo, tipoDeMensaje); */
    /* href propiedad que me permite redirigir la página a donde quiera, en este caso a la raíz del programa. */
    Swal.fire(
        'Su sesión ha sido cerrada correctamente.',
        'Que tenga un buen día.',
        'success'
    ).then(() => {
        window.location.reload()
        location.href = '/'
        //document.getElementById("btnLogin").className = "nav-link d-block";
        //document.getElementById("btnCerrar").className = "nav-item d-block";
    });
})