const menu = document.querySelector("#menu");
const home = document.querySelector("#pantalla-home");
const login = document.querySelector("#pantalla-login");
const registro = document.querySelector("#pantalla-registro");
const router = document.querySelector("#ruteo");
const listar = document.querySelector("#pantalla-listar");
const estads = document.querySelector("#pantalla-estads");

const URL_base = "https://movielist.develotion.com";
const nav = document.querySelector("ion-nav");

Inicio();

/* ------------------------------------- COMPORAMIENTO DE LA APP ---------------------------------------- */

function Inicio(){
    Eventos();
    ArmarMenu();
}

function Eventos(){
    router.addEventListener("ionRouteDidChange", Navegar);
    document.querySelector("#btnLogin").addEventListener("click", TomarDatos);
    document.querySelector("#btnRegistro").addEventListener("click", Registrar);
}

function ArmarMenu(){

    let haytoken = localStorage.getItem("token");

    let html;

    if(haytoken){
        html= `<ion-item href="/home">Home</ion-item>
                <ion-item href="/listar">Peliculas vistas</ion-item>
                <ion-item href="/estads">Estadisticas</ion-item>
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

        LoadingON("Iniciando...");
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
            ArmarMenu();
            OcultarPantallas();
            nav.push("page-home");
        }else{
            //mensaje de datos incorrectos
            LoadingOFF();
            if (data.codigo == 409){
            let html = `<ion-item color="danger">${data.mensaje}</ion-item>`
            document.querySelector("#divLogin").innerHTML = html;
            }
        }
        LoadingOFF();
}

async function Registrar(){
    let user = document.querySelector("#txtRegistroUser").value;
    let pass = document.querySelector("#txtRegistroPass").value;
    let pais = document.querySelector("#selectRegistroPais").value;
    //Funcion validar datos

    if(ValidarRegistro(user,pass,pais)){
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
        }
    }else{
        Alertar("AVISO","Error:",data.mensaje)
    }    
}

async function TomarDatos() {
    let user = document.querySelector("#txtLoginUser").value;
    let pass = document.querySelector("#txtLoginPass").value;

    Loguear(user, pass);
}


function Navegar(evt){
    let ruta = evt.detail.to;
    OcultarPantallas();

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
        listar.style.display = "block";
    }else if(ruta == "/estads"){
        estads.style.display = "block";
    }else if (ruta == "/logout"){
        Logout();
        ArmarMenu();
        login.style.display = "block";
    }
    menu.close();
}

function Logout(){
    localStorage.removeItem("token");
}

function OcultarPantallas(){
    home.style.display = "none";
    registro.style.display = "none";
    login.style.display = "none";
    listar.style.display = "none";
    estads.style.display = "none";
}

function ValidarRegistro(user,pass,pais){
// TODO: Hacer funcion
    return true;
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
            "Token": token,
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

/* ------------------------------------------------ FIN LOGICA DE NEGOCIO--------------------------------------------------------------- */

















/* Funciones de UI */ 

const loading = document.createElement('ion-loading');
function LoadingON(texto) {
    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    //loading.duration = 2000;
    document.body.appendChild(loading);
    loading.present();
}

function LoadingOFF(){
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

