function escogerSalida(ciudadEscogida, tipo){
    document.getElementById("salida").value = ciudadEscogida.toUpperCase()
    document.getElementById("salida").style.fontSize = "15px"        
    document.getElementById("salida").style.textAlign = "center"        
    document.getElementById("dropdownSalida").classList.remove("show");
    consultarFechas(ciudadEscogida, tipo)
}

function consultarFechas(ciudad, tipo){
    const salida = ciudad.substring(0, 3)
    Obtener(null, 'leads/consulta-fechas/'+salida+'/CTG', datos => {
        if (datos.estado) {
           armarArrayFechas(datos.consulta, tipo)
        }
        else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: datos.error
            })
        }
        
    })
}


var fechasGlobales =[]
function armarArrayFechas(fechas,tipo){
    fechasGlobales = []
    let fechasDisponibles = {}
    let disponibles = []
    fechas.forEach(element => {
        let dato = {
            id: element.id,
            fecha : element.salida,
        }
        fechasGlobales.push(dato)
        fechasDisponibles[element.salida] = "$"+ Math.ceil(element.precio.porPersona.valor)
        disponibles.push(element.salida)
    });
    const fechaInicio = fechas[0].salida
    const fechaFin = fechas[fechas.length -1 ].salida
    const fechasNoIncluidas = obtenerFechasNoIncluidas(fechaInicio,fechaFin,disponibles)
    iniciarCalendario(fechaInicio,fechaFin,fechasDisponibles, fechasNoIncluidas,tipo)
}



function obtenerFechasNoIncluidas(fechaInicio, fechaFin, fechaArray) {
    const fechasNoDisponibles = fechaArray.map(fecha => new Date(fecha));
    let fechasNoIncluidas = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
        if (!fechasNoDisponibles.some(fechaNoDisponible => fechaNoDisponible.getTime() === fecha.getTime())) {
            fechasNoIncluidas.push(fecha.toISOString().split('T')[0]);
        }
    }
    return fechasNoIncluidas 
}



function iniciarCalendario(fechaInicio,fechaFin,fechasDisponibles, fechaNoDisponible, tipo) {

    if(tipo){
        flatpickr("#fechaSalida", {
            dateFormat: "Y-m-d", // Formato de fecha
            minDate: fechaInicio,
            maxDate: fechaFin,
            disable: fechaNoDisponible,
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                const fecha = dayElem.dateObj.toISOString().split('T')[0];
                if (fechasDisponibles[fecha]) {
                    const precioElem = document.createElement("span");
                    precioElem.className = "precio-calendario";
                    precioElem.textContent = fechasDisponibles[fecha];
                    dayElem.appendChild(precioElem);
                    dayElem.style.position = 'relative'; // Permite la posición absoluta del precio
                }
            },
            defaultDate: fechaInicio
        });
    }
    else{
        flatpickr("#fechaSalida", {
            dateFormat: "Y-m-d", // Formato de fecha
            minDate: fechaInicio,
            maxDate: fechaFin,
            disable: fechaNoDisponible,
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                const fecha = dayElem.dateObj.toISOString().split('T')[0];
                if (fechasDisponibles[fecha]) {
                    const precioElem = document.createElement("span");
                    precioElem.className = "precio-calendario";
                    precioElem.textContent = fechasDisponibles[fecha];
                    dayElem.appendChild(precioElem);
                    dayElem.style.position = 'relative'; // Permite la posición absoluta del precio
                }
            },
            onReady: function(selectedDates, dateStr, instance) {
                instance.open(); 
            },
            defaultDate: fechaInicio
        });
    }
    
}


function scrollTop() {
    window.scrollTo(0, 0);
}


var personas = {
    adultos: 4,
    ninos: 0,
    infante: 0
    
};
function cargarPersonas() {
    let adultos = document.getElementById("numeroAdulto").value
    let ninos = document.getElementById("numeroNino").value
    let bebes = document.getElementById("numeroBebe").value

    if(parseInt(adultos,0) <= 0 || !adultos){
        adultos = 1
        document.getElementById("numeroAdulto").value = 1
    }
    if(!ninos){
        ninos=0
        document.getElementById("numeroNino").value = 0
    }
    if(!bebes){
        bebes=0
        document.getElementById("numeroBebe").value = 0
    }
    personas.adultos = adultos
    personas.ninos = ninos
    personas.infante = bebes
    var total = parseInt(adultos,10) + parseInt(ninos) + parseInt(bebes)
    document.getElementById("personas").value = total+" PERSONA(S)"
    cerrarDropdown("dropdownPersonasContent")
}

function validarRango(input) {
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    let value = input.value;
    if (value === "") {
        input.value = min;
        return;
    }
    value = parseInt(value, 10); // Esto elimina los ceros a la izquierda
    if (value < min) {
        input.value = min;
    } 
    else if (value > max) {
        input.value = max;
    } 
    else {
        input.value = value;
    }
}

function cerrarDropdown(id) {
    const dropdown = document.getElementById(id);
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}




function armarArrayDatos(){
    const datos = {
        "documento": document.getElementById("documento").value,
        "apellidos": document.getElementById("apellidos").value,
        "nombres": document.getElementById("nombres").value,
        "email": document.getElementById("correo").value,
        "celular": document.getElementById("celular").value,
        "adultos": personas.adultos,
        "ninos": personas.ninos,
        "infantes": personas.infante
    }
    return datos
}



function recibirCotizacion(){
    const fechaBuscada = document.getElementById("fechaSalida").value
    let objeto = fechasGlobales.find(item => item.fecha === fechaBuscada);
    const date = armarArrayDatos()
    Enviar(JSON.stringify(date), 'leads/consulta-itinerario/'+objeto.id, datos => {
        if (datos.estado) {
            ponerCosto(datos.consulta.precio)
            armarVuelos(datos.consulta.origen, datos.consulta.destino,datos.consulta.salida,datos.consulta.retorno)
            Swal.fire({
                icon: 'success',
                title: 'Bien',
                text: 'Se ha enviado su cotización a su número y correo registrados'
            })
        }
        else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: datos.error
            })
        }
        
    })
}




function ponerCosto(precio){
    let lista = ""
    lista += `
            <li class="table-header clearfix">
                <div class="col">
                    <strong>Cartagena</strong>
                </div>
                <div class="col">
                    <strong>Total</strong>
                </div>
            </li>`
            if(precio.adulto.valor > 0){
                lista += `
                    <li class="clearfix">
                        <div class="col" style="text-transform:none;">
                            <img src="img/products/thumb-1.jpg" width="50" height="50" alt=""> `+personas.adultos+` Adulto(s)
                        </div>
                        <div class="col second">
                            $`+precio.adulto.valor.toFixed(2)+`
                        </div>
                    </li>
                `

            }
            if(precio.nino.valor > 0){
                lista += `
                    <li class="clearfix">
                        <div class="col" style="text-transform:none;">
                            <img src="img/products/thumb-1.jpg" width="50" height="50" alt=""> `+personas.ninos+` Niño(s)
                        </div>
                        <div class="col second">
                            $`+precio.nino.valor.toFixed(2)+`
                        </div>
                    </li>
                `

            }
            if(precio.infante > 0){
                lista += `
                    <li class="clearfix">
                        <div class="col" style="text-transform:none;">
                            <img src="img/products/thumb-1.jpg" width="50" height="50" alt=""> `+personas.infante+` Infante(s)
                        </div>
                        <div class="col second">
                            $`+precio.infante.valor.toFixed(2)+`
                        </div>
                    </li>
                `

            }
            lista +=`
                <li class="clearfix total">
                    <div class="col">
                        <strong>Total</strong>
                    </div>
                    <div class="col second">
                        <strong>$`+precio.totalPaquete.valor.toFixed(2)+`</strong>
                    </div>
                </li>
    `
    $("#costos").html(lista)
}


function armarVuelos(origen, destino, salida, retorno){
    const aux = 156
    let lista = ""
        lista += `
            <div class="strip_all_tour_list wow fadeIn" data-wow-delay="0.1s">
                <div class="row">
                        <div class="row my-1 mx-1">
                            <div class="col-lg-6 d-flex" style="align-items: center;">
                                <img src="`+sacarLogoAereolina("2K")+`" style=" margin-right: 15px;" alt="" height="30" width="30">
                                <small class="small-text" style="font-size: 1rem; align-items: center; display: flex;">Avianca</small>
                            </div>
                            <div class="col-lg-6" style="text-align: end; justify-content: end; display: flex; flex-direction: column;">
                                <span>`+origen.nombre+`-`+destino.nombre+`</span>
                                <span>`+destino.nombre+`-`+origen.nombre+`</span>
                            </div>
                        </div>
                  
                    <div>
                        <div class="row d-flex">
                            <div class="col-12">
                                <div class="row mx-2">
                                    <div class="col-12" style="display: flex; align-items: center;">
                                        <i class="icon-plane" style="transform: rotate(45deg); margin-right: 10px; font-size: 20px;"></i>
                                        <h5 style="margin-right: 20px; font-size: 16px;">IDA</h5>
                                        <h5 style="font-size: 16px;"> `+salida.fecha+`</h5>
                                    </div>
                                </div>
                                        <hr style="margin-top: 0; margin-bottom: 0;">
                                        <div class="row mx-1" style="align-items: center;">
                                            <div class="col-1">
                                                
                                            </div>
                                            <div class="col-4">
                                                <span>
                                                    <strong>`+salida.escalas[0].desde+`</strong>
                                                    <i class="icon-left" style="font-size: 22px;"></i>
                                                    <strong>`+salida.escalas[salida.escalas.length-1].hasta+`</strong>`
                                                    if(salida.escalas.length>1){
                                                        lista += `<span style="color: #99c21c;"> <strong>+1</strong></span>`
                                                    }
                                                    lista += ` 
                                                </span>
                                            </div>
                                            <div class="col-2">
                                                <span><strong>2h:30min</strong></span>
                                            </div>
                                            <div class="col-3">`
                                                if(aux){
                                                    lista += `<span>Directo</span>`
                                                }
                                                else{
                                                    lista += `<span>1 Escala(s)</span>`
                                                }
                                                lista +=`
                                            </div>
                                            <div class="col-1" style="text-align: end;">
                                            </div>
                                            <div> 
                                                

                                                            <hr style="margin:0;">
                                                            <div class="row" >
                                                                <div class="col-2" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <span style="font-size:12px;"><strong>Economy</strong></span>
                                                                    <span style="font-size:12px;"><strong>N°: La5415</strong></span>
                                                                </div>
                                                                <div class="col-4" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <span style="font-size:12px;"><strong>12:45</strong></span>
                                                                    <span style="font-size:12px;">UIO, BOG</span>
                                                                </div>
                                                                <div class="col-2" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <i class="icon-plane" style="transform: rotate(90deg); margin-right: 10px; font-size: 30px;"></i>
                                                                    <span style="font-size:12px;">3H:30min</span>
                                                                </div>
                                                                <div class="col-4" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <span style="font-size:12px;"><strong>16:21</strong></span>
                                                                    <span style="font-size:12px;">BOG, PAN</span>
                                                                </div>
                                                            </div>
                                                            <hr style="margin:0;">`
                                                            if(aux){
                                                                lista +=` 
                                                                    <div class="row" style="background-color:#f9f9f9">
                                                                        <div class="col-12" style="text-align: center; justify-content: center;">
                                                                            <i class="icon-clock" style="margin-right: 10px; font-size: 30px;"></i>
                                                                            <span style="font-size:12px;">Escala BOG: 4h56min</span>
                                                                        </div>
                                                                    </div>
                                                                `
                                                            }    

                                                    lista +=`


                                            </div>
                                            <hr style="font-size: 16px;">
                                        </div>



                                <br>
                                <div class="row">
                                    <div class="col-12" style="display: flex; align-items: center;">
                                        <i class="icon-plane" style="transform: rotate(315deg); margin-right: 10px; font-size: 20px;"></i>
                                        <h5 style="margin-right: 20px; font-size: 16px;">VUELTA</h5>
                                        <h5 style="font-size: 16px;"> 10/20/2024</h5>
                                    </div>
                                </div>



                                 <hr style="margin-top: 0; margin-bottom: 0;">
                                        <div class="row mx-1" style="align-items: center;">
                                            <div class="col-1">
                                                
                                            </div>
                                            <div class="col-4">
                                                <span>
                                                    UIO: <strong>5:00</strong>
                                                    <i class="icon-left" style="font-size: 22px;"></i>
                                                    BOG: <strong>12:00</strong>`
                                                    if(aux){
                                                        lista += `<span style="color: #99c21c;"> <strong>+1</strong></span>`
                                                    }
                                                    lista += ` 
                                                </span>
                                            </div>
                                            <div class="col-2">
                                                <span><strong>2h:30min</strong></span>
                                            </div>
                                            <div class="col-3">`
                                                if(aux){
                                                    lista += `<span>Directo</span>`
                                                }
                                                else{
                                                    lista += `<span>1 Escala(s)</span>`
                                                }
                                                lista +=`
                                            </div>
                                            <div class="col-1" style="text-align: end;">
                                            </div>
                                            <div> 
                                                

                                                            <hr style="margin:0;">
                                                            <div class="row" >
                                                                <div class="col-2" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <span style="font-size:12px;"><strong>Economy</strong></span>
                                                                    <span style="font-size:12px;"><strong>N°: La5415</strong></span>
                                                                </div>
                                                                <div class="col-4" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <span style="font-size:12px;"><strong>12:45</strong></span>
                                                                    <span style="font-size:12px;">UIO, BOG</span>
                                                                </div>
                                                                <div class="col-2" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <i class="icon-plane" style="transform: rotate(90deg); margin-right: 10px; font-size: 30px;"></i>
                                                                    <span style="font-size:12px;">3H:30min</span>
                                                                </div>
                                                                <div class="col-4" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                                                                    <span style="font-size:12px;"><strong>16:21</strong></span>
                                                                    <span style="font-size:12px;">BOG, PAN</span>
                                                                </div>
                                                            </div>
                                                            <hr style="margin:0;">`
                                                            if(aux){
                                                                lista +=` 
                                                                    <div class="row" style="background-color:#f9f9f9">
                                                                        <div class="col-12" style="text-align: center; justify-content: center;">
                                                                            <i class="icon-clock" style="margin-right: 10px; font-size: 30px;"></i>
                                                                            <span style="font-size:12px;">Escala BOG: 4h56min</span>
                                                                        </div>
                                                                    </div>
                                                                `
                                                            }    

                                                    lista +=`


                                            </div>
                                            <hr style="font-size: 16px;">
                                        </div>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
   
    $("#detalleVuelos").html(lista)
}




function sacarLogoAereolina(code){
    let lista = ""
    if(code == 'CM'){
        lista = "img/aereolinas_logos/copa.png"
    }
    else if(code == 'DL'){
        lista ="img/aereolinas_logos/delta.png"
    }
    else if(code == 'AV' || code == '2K'){
        lista = "img/aereolinas_logos/avianca.png"
    }
    else if(code == 'B6'){
        lista = "img/aereolinas_logos/jet.png"
    }
    else if(code == 'LA'){
        lista = "img/aereolinas_logos/latam.jpg"
    }
    else if(code == 'AA'){
        lista = "img/aereolinas_logos/american.png"
    }
    return lista
}