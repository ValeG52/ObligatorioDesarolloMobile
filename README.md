# ObligatorioDesarolloMobile

Dejemos aca los cambios que hagamos sobre el codigo
async function GetPeliculas(){
    let token = localStorage.getItem("token");
    let response = await fetch(`${URL_BASE}/peliculas`,{
        method: "GET",
        headers:{
            "Content-type":"application/json",
            "Authorization":token,
        }
    })
    let data = await response.json();
    return data.peliculas;

}

function ListarPelis(){
    let _pelis= GetPeliculas();
    let html = ``;
    for (let p of _pelis){
        html+= `<ion-card>
  <ion-card-header>
    <ion-card-title>${p.idCategoria}</ion-card-title>
    <ion-card-subtitle>${p.Nombre}</ion-card-subtitle>
  </ion-card-header>

  <ion-card-content>
    TREMENDA PELI LA TUYA 
  </ion-card-content>
</ion-card>`
    }
    document.querySelector("#listaPeliculas").innerHTML =html;
}
