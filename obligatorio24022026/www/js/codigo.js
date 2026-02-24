const menu = document.querySelector("#menu");
const home = document.querySelector("#pantalla-home");
const login = document.querySelector("#pantalla-login");
const registro = document.querySelector("#pantalla-registro");
const router = document.querySelector("#ruteo");
const listar = document.querySelector("#pantalla-listar");
const estads = document.querySelector("#pantalla-estads");
const mapa = document.querySelector("#pantalla-mapa");
const URL_base = "https://movielist.develotion.com";
const nav = document.querySelector("ion-nav");

Inicio();

/* ------------------------------------- COMPORAMIENTO DE LA APP ---------------------------------------- */

function Inicio(){
    Eventos();
    armarMenu();
    ocultarPantallas();
}

function Eventos(){
    router.addEventListener("ionRouteDidChange", Navegar);
    document.querySelector("#btnLogin").addEventListener("click", tomarDatosLogin);
    document.querySelector("#btnRegistro").addEventListener("click", Registrar);
    document.querySelector("#btnAgregarPelicula").addEventListener("click", agregarPelicula)
    
}

function armarMenu(){

    let haytoken = localStorage.getItem("token");

    let html;

    if(haytoken){
        html= `<ion-item href="/home">Agregar película</ion-item>
                <ion-item href="/listar">Peliculas registradas</ion-item>
                <ion-item href="/estads">Estadisticas</ion-item>
                <ion-item href="/mapa">Mapa</ion-item>
                <ion-item href="/logout">Logout</ion-item>`
    }else{
        html= `<ion-item href="/login">Login</ion-item>
                <ion-item href="/registro">Registro</ion-item>`
    }

    document.querySelector("#menuOpciones").innerHTML = html;
}

async function Loguear(user, pass){
    let objLogin = new Object();
    objLogin.usuario = user;
    objLogin.password = pass;
    let html = "";
    document.querySelector("#divLogin").innerHTML = html;

        let response = await fetch(`${URL_base}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objLogin),
        });

        let data = await response.json();
        
        if(data.codigo == 200){
            loadingON("Iniciando...");
            localStorage.setItem('token', data.token);
            armarMenu();
            ocultarPantallas();
            loadingOFF();
            nav.push("page-home");
        }else{
            //mensaje de datos incorrectos
            if (data.codigo == 409){
            html = `<ion-item color="danger">${data.mensaje}</ion-item>`
            document.querySelector("#divLogin").innerHTML = html;
            }
        }
        
}

async function Registrar(){
    let user = document.querySelector("#txtRegistroUser").value;
    let pass = document.querySelector("#txtRegistroPass").value;
    let pais = document.querySelector("#selectRegistroPais").value;
    let html = "";
    //Funcion validar datos

    if(validarRegistro(user,pass,pais)){
        let objRegistro= new Object();
        objRegistro.usuario = user;
        objRegistro.password = pass;
        objRegistro.idPais = pais;

        let response = await fetch(`${URL_base}/usuarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objRegistro),
        });

        let data = await response.json();

        if(data.codigo == 200){
            Loguear(user, pass);
        }else{
            Alertar("AVISO!","Error: ",data.mensaje)
            document.querySelector("#divRegistro").innerHTML = html;
        }
    }else{
        html = `<ion-item color="danger">Campo/s vacios</ion-item>`
        document.querySelector("#divRegistro").innerHTML = html;
    } 
}

async function tomarDatosLogin() {
    let user = document.querySelector("#txtLoginUser").value;
    let pass = document.querySelector("#txtLoginPass").value;
    if( user !== "" && user !== " " && user !== undefined && pass !== "" && pass !== " " && pass !== undefined){
        Loguear(user, pass);
    }else{
        let html = `<ion-item color="danger">Campo/s vacios</ion-item>`
        document.querySelector("#divLogin").innerHTML = html;
    }
}


function Navegar(evt){
    let ruta = evt.detail.to;
    ocultarPantallas();

    if( ruta == "/"){
        login.style.display = "block";
    }else if( ruta == "/registro"){
        listarPaises();
        registro.style.display = "block";
    }else if (ruta == "/login"){
        login.style.display = "block";
    }else if (ruta == "/home"){
        listarCategorias();
        home.style.display = "block";
    }else if(ruta == "/listar"){
        mostrarPeliculas();
        listar.style.display = "block";
    }else if(ruta == "/estads"){
        contarCategorias();
        calcularPorcentaje();
        estads.style.display = "block";
    }else if(ruta == "/mapa"){
        cargarMapa();
        mapa.style.display = "block";
    }else if (ruta == "/logout"){
        Logout();
        armarMenu();
        //login.style.display = "block";
    }
    menu.close();
}

function Logout(){
    localStorage.removeItem("token");
    nav.push("page-login");
}

async function ocultarPantallas(){

    login.style.display = "none";
    home.style.display = "none";
    registro.style.display = "none";
    listar.style.display = "none";
    estads.style.display = "none";
    mapa.style.display = "none";
}

function validarRegistro(user,pass,pais){
    return (user !== "" && user !== " " && user !== undefined && pass !== "" && pass !== " " && pass !== undefined && pais !== undefined);
}

async function tokenValido(){

    let data = await getCategorias();
    if(data.codigo == 200){
        return true;
    }else{
        return false;
    }
}

/* ------------------------------------------------------------- LOGICA DE NEGOCIO ---------------------------------------------------- */ 
async function getPaisesReg(){

    let response = await fetch(`${URL_base}/paises`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    let data = await response.json();
    return data;
}

async function listarPaises() {
    let data = await getPaisesReg();
    if(data.codigo == 200){
        let html;
        for(let pais of data.paises){
            html += `<ion-select-option value="${pais.id}">${pais.nombre}</ion-select-option>` ;
        }
        document.querySelector("#selectRegistroPais").innerHTML = html;
    }
}

async function getCategorias(){
    let token = localStorage.getItem("token");
    let response = await fetch(`${URL_base}/categorias`, {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "AUTHORIZATION":"Bearer "+token,
        },
    });
    let data = await response.json();
    return data;
}


async function contarCategorias(){
    let data = await getPeliculas();
    let accion = 0;
    let comedia = 0; 
    let drama = 0;
    let cienciaFiccion = 0;
    let terror = 0;
    let animacion = 0;
    let documental = 0;
    let romance = 0;
    let aventura = 0;
    let fantasia = 0;
    for(let p of data.peliculas){
        if(p.idCategoria == 1){
            accion+= 1;
        }else if(p.idCategoria == 2){
            comedia+= 1;
        }else if(p.idCategoria == 3){
            drama+= 1;
        }else if(p.idCategoria == 4){
            cienciaFiccion+= 1;
        }else if(p.idCategoria == 5){
            terror+= 1;
        }else if(p.idCategoria == 6){
            animacion+= 1;
        }else if(p.idCategoria == 7){
            documental+= 1;
        }else if(p.idCategoria == 8){
            romance+= 1;
        }else if(p.idCategoria == 9){
            aventura+= 1;
        }else if(p.idCategoria == 10){
            fantasia+= 1;
        }
        
    }
    document.querySelector("#accion").innerHTML = "Acción " + accion;
    document.querySelector("#comedia").innerHTML = "Comedia " + comedia;
    document.querySelector("#drama").innerHTML = "Drama " + drama;
    document.querySelector("#cienciaFiccion").innerHTML = "Ciencia Ficción " + cienciaFiccion;
    document.querySelector("#terror").innerHTML = "Terror " + terror;
    document.querySelector("#animacion").innerHTML = "Animación " + animacion;
    document.querySelector("#documental").innerHTML = "Documental "  + documental;
    document.querySelector("#romance").innerHTML = "Romance " + romance;
    document.querySelector("#aventura").innerHTML = "Aventura " + aventura;
    document.querySelector("#fantasia").innerHTML = "Fantasía " + fantasia;
}

async function calcularPorcentaje(){
    let data = await getPeliculas();
    let total = data.peliculas.length;
    let num = 0;
    for(let p of data.peliculas){
        if(p.idCategoria == 1 || p.idCategoria == 4 || p.idCategoria == 5 ){
            num+=1;
        }
    } 
    let porcentaje = (num*100)/total;
    document.querySelector("#porcentajeMayores").innerHTML = `Porcentaje ${porcentaje.toFixed(0)}%`;
    document.querySelector("#porcentajeResto").innerHTML = `Porcentaje ${100-porcentaje.toFixed(0)}%`;
}
 

async function listarCategorias() {
    let data = await getCategorias();
    if(data.codigo == 200){
        let html;
        for(let c of data.categorias){
            html += `<ion-select-option value="${c.id}">${c.nombre}</ion-select-option>` ;
        }
        document.querySelector("#selectCatPelicula").innerHTML = html;
    }
}

async function evaluarComentario(coment) {
    // let coment = document.querySelector("#txtComPelicula").value;

    let objComent= new Object();
        objComent.prompt = coment;
    let response = await fetch(`${URL_base}/genai`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objComent),
        });
    let data = await response.json();
    console.log(data);
    return data.sentiment;
}


async function agregarPelicula(){
    let idCat = document.querySelector("#selectCatPelicula").value;
    let nom = document.querySelector("#txtNomPelicula").value;
    let fecha1 = document.querySelector("#datetime").value?.split("T")[0];
    let coment = document.querySelector("#txtComPelicula").value;
    
    if(idCat !== undefined && nom !== "" && nom !== " " && nom !== undefined && fecha1 !== undefined && coment !== "" && coment !== " " && coment !== undefined){
        let hoy = new Date();
        let [year, month, day] = fecha1.split("-"); 
        let fechaUy = new Date(year, month-1, day);
        if(fechaUy.getFullYear() <= hoy.getFullYear()){
            if((fechaUy.getMonth() < hoy.getMonth()) || (fechaUy.getMonth() == hoy.getMonth() && fechaUy.getDate() <= hoy.getDate() )){
                if( await evaluarComentario(coment) == "Neutro" || await evaluarComentario(coment) == "Positivo" ){
                    let objPelicula= new Object();
                    objPelicula.idCategoria = idCat;
                    objPelicula.nombre = nom;
                    objPelicula.fecha = fecha1;
                    let token = localStorage.getItem("token");

                    let response = await fetch(`${URL_base}/peliculas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'AUTHORIZATION':'Bearer '+token,                        
                    },
                        body: JSON.stringify(objPelicula),
                        });
                        Alertar("AVISO","","Película agregada con exito.")
                        nav.push("page-listar");
                }else{
                    Alertar("AVISO","Agregar película: ","El comentario no cumple con los requisitos.")
                }
            }else{
                Alertar("AVISO","Agregar película: ","La fecha ingresada no puede ser posterior a la de hoy. Verifique la fecha.")
            }    
        }else{
            Alertar("AVISO","Agregar película: ","La fecha ingresada no puede ser posterior a la de hoy. Verifique el año.")
        }
    }else{
         Alertar("AVISO","Agregar película: ","Campo/s vacios. Verifique")
    }
}

function funPrueba(){

    let fecha1 = document.querySelector("#datetime").value?.split("T")[0];
    
    let [year, month, day] = fecha1.split("-");
    let fechaUy = new Date(year, month-1, day);

    // //let hoy = new Date().toLocaleDateString('es-UY');
    let hoy = new Date();
    
    // //console.log(fecha1 instanceof Date);

    // // console.log(fechaUy.getFullYear());

    // // console.log(fechaUy.getDate());

    // if(fechaUy.getFullYear() <= hoy.getFullYear() && fechaUy.getMonth() <= hoy.getMonth() && fechaUy.getDay() <= hoy.getDay()){
        
    // }

    //let nom = document.querySelector("#txtNomPelicula").value;
    
    console.log(fechaUy.getDate())

    console.log( fechaUy.getDate() >= (hoy.getDate() - 7));
    console.log(hoy.getDate() - 7)

}

async function getPeliculas() {
    let token = localStorage.getItem("token");
    let response = await fetch(`${URL_base}/peliculas`, {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "AUTHORIZATION":"Bearer "+token,
        },
    });
    let data = await response.json();
    return data;
}

async function getEmojiById(id){
    let data = await getCategorias();
    for(let c of data.categorias){
        if(c.id == id){
            return c.emoji;
        }
    }    
}
                    
async function listarPeliculas(data, frecuencia) {
    //let lista = await filtroPorFecha(await getPeliculas());
    
        let html="";
        for(let p of data){
            html += `<ion-toolbar>
                        <ion-list>
                            <ion-item>
                                <ion-label>${p.nombre +" "+ await getEmojiById(p.idCategoria)}</ion-label>
                            <ion-buttons slot="end">
                                <ion-button color="danger" onclick="eliminarPelicula('${p.id}')">Delete</ion-button>
                            </ion-buttons>
                            </ion-item>
                        </ion-list>
                    </ion-toolbar>`
            //      `<ion-item-sliding>
            //          <ion-item>
            //              <ion-label>${p.nombre}</ion-label>
            //          </ion-item>
            //          <ion-item-options side="end">
            //              <ion-item-option color="danger" onclick="eliminarPelicula('${p.id}')">Delete</ion-item-option>
            //          </ion-item-options>
            //      </ion-item-sliding>` ;
        }
        if(frecuencia == 1){
            document.querySelector("#peliculasSemana").innerHTML = html;
        }else if(frecuencia == 2){
            document.querySelector("#peliculasMes").innerHTML = html;
        }else if(frecuencia == 3){
            document.querySelector("#peliculasTodas").innerHTML = html;
        }
}



async function filtroPorFecha (){
    let data = await getPeliculas();
    let filtradasSemana = [];
    let filtradasMes = [];
    
    if(data.codigo == 200){
        let hoy = new Date();
        for(let p of data.peliculas){
            let [year, month, day] = p.fechaEstreno.split("-");
            let fechaVista = new Date(year, month-1, day);
            if(fechaVista.getFullYear() == hoy.getFullYear() && fechaVista.getMonth() == hoy.getMonth() && fechaVista.getDate() >= (hoy.getDate() - 7)){
                filtradasSemana.push(p);
            }else if(fechaVista.getFullYear() == hoy.getFullYear() && fechaVista.getMonth() >= (hoy.getMonth() - 1)){
                filtradasMes.push(p);
            }
        }
        listarPeliculas(filtradasSemana, 1);
        listarPeliculas(filtradasMes, 2);
        listarPeliculas(data.peliculas, 3);
    }
}

async function mostrarPeliculas(){
    filtroPorFecha();
}

async function eliminarPelicula(idPelicula){

    let token = localStorage.getItem("token");
    let response = await fetch(`${URL_base}/peliculas/${idPelicula}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": 'application/json',
            "AUTHORIZATION":"Bearer "+token,
        },
    });
    let data = await response.json();

    if(data.codigo == 200){
        Alertar("AVISO","",data.mensaje);
        mostrarPeliculas();
    }else{
        Alertar("AVISO","",data.mensaje);
    }
}

async function getListaPaises(){

    let token = localStorage.getItem("token");
    let response = await fetch(`${URL_base}/usuariosPorPais`, {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "AUTHORIZATION":"Bearer "+token,
        },
    });
    let data = await response.json();

    return data.paises;
}



//recorrer 
async function listaCantUserXPais(){
    let data = await getPaisesReg();
    let listaUsuariosXPais = await getListaPaises();
    let res = [];
    for(let p of data.paises){
        res.push(getCantUsuarios(p, listaUsuariosXPais));
    }
    return res;
}

function getCantUsuarios(p, listaUsuariosXPais){
    let objMarker = new Object();
    for(let lu of listaUsuariosXPais){
        if(lu.id === p.id){
            objMarker.id = p.id;
            objMarker.latitud = p.latitud;
            objMarker.longitud = p.longitud;
            objMarker.nombre = p.nombre;
            objMarker.cantidadDeUsuarios = lu.cantidadDeUsuarios;
            return objMarker;
        }
    }
}


var map = null;
function crearMapa(){

    if(map != null){
        map.remove();
    }
    map = L.map('map').setView([-33, -56], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'})
    .addTo(map);
    crearMarkers(L);

}


async function crearMarkers(L){
    for(let o of await listaCantUserXPais()){
        var marker = L.marker([o.latitud, o.longitud]).addTo(map).bindTooltip("<b>"+ o.nombre +"</b><br>Usuarios: "+o.cantidadDeUsuarios);
    }
    //Muevo el centro del mapa a uruguay
    map.setView([-33, -56], 3);
}

function cargarMapa(){
    setTimeout(function(){crearMapa(), 100});
}


/* ------------------------------------------------ FIN LOGICA DE NEGOCIO--------------------------------------------------------------- */



/* Funciones de UI */ 

const loading = document.createElement('ion-loading');
function loadingON(texto) {
    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    //loading.duration = 2000;
    document.body.appendChild(loading);
    loading.present();
}

function loadingOFF(){
    loading.dismiss();
}

function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = titulo;
    alert.subHeader = subtitulo;
    alert.message = mensaje;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
}

