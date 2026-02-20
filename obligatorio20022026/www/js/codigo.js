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
    document.querySelector("#btnLogin").addEventListener("click", tomarDatos);
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

        loadingON("Iniciando...");
        let response = await fetch(`${URL_base}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objLogin),
        });

        let data = await response.json();
        
        if(data.codigo == 200){
            localStorage.setItem('token', data.token);
            armarMenu();
            ocultarPantallas();
            nav.push("page-home");
        }else{
            //mensaje de datos incorrectos
            loadingOFF();
            if (data.codigo == 409){
            let html = `<ion-item color="danger">${data.mensaje}</ion-item>`
            document.querySelector("#divLogin").innerHTML = html;
            }
        }
        loadingOFF();
}

async function Registrar(){
    let user = document.querySelector("#txtRegistroUser").value;
    let pass = document.querySelector("#txtRegistroPass").value;
    let pais = document.querySelector("#selectRegistroPais").value;
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
        }
    }else{
        Alertar("AVISO","Error:",data.mensaje)
    }    
}

async function tomarDatos() {
    let user = document.querySelector("#txtLoginUser").value;
    let pass = document.querySelector("#txtLoginPass").value;

    Loguear(user, pass);
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
        estads.style.display = "block";
    }else if(ruta == "/mapa"){
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
// TODO: Hacer funcion

    return true;
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
async function getPaises(){

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
    let data = await getPaises();
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
            if(fechaUy.getMonth() <= hoy.getMonth()){
                if(fechaUy.getDate() <= hoy.getDate()){
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
                    Alertar("AVISO","Agregar película: ","callo en el dia")
                }
            }else{
                //terminar
            }    
        }else{
            Alertar("AVISO","Agregar película: ","La fecha ingresada no puede ser posterior a la de hoy.")
        }
    }else[
         Alertar("AVISO","Agregar película: ","Campo/s vacios. Verifique")
    ]
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

                    
async function listarPeliculas(data, frecuencia) {
    //let lista = await filtroPorFecha(await getPeliculas());
        let html="";
        for(let p of data){
            html += `<ion-toolbar>
                        <ion-list>
                            <ion-item>
                                <ion-label>${p.nombre}</ion-label>
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
    
    // FALTA TERMINAR BIEN EL FILTRO
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

