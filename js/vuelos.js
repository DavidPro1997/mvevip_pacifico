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
            precio: element.precio
        }
        fechasGlobales.push(dato)
        fechasDisponibles[element.salida] = "$"+ Math.ceil(element.precio.porPersona.valor)
        disponibles.push(element.salida)
    });
    const fechaInicio = fechas[0].salida
    const fechaFin = fechas[fechas.length -1 ].salida
    const fechasNoIncluidas = obtenerFechasNoIncluidas(fechaInicio,fechaFin,disponibles)
    iniciarCalendario(fechaInicio,fechaFin,fechasDisponibles, fechasNoIncluidas,tipo)
    ponerCosto()
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
    ponerCosto()
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
        "celular": document.getElementById("celular").value
    }
    return datos
}



function recibirCotizacion(){
    const fechaBuscada = document.getElementById("fechaSalida").value
    let objeto = fechasGlobales.find(item => item.fecha === fechaBuscada);
    const date = armarArrayDatos()
    Enviar(JSON.stringify(date), 'leads/consulta-itinerario/'+objeto.id, datos => {
        if (datos.estado) {
            $("#detalle").html(datos.consulta.detalle)
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




function ponerCosto(){
    const fechaBuscada = document.getElementById("fechaSalida").value
    let objeto = fechasGlobales.find(item => item.fecha === fechaBuscada);
    let lista = ""
    let total = 0
    lista += `
            <li class="table-header clearfix">
                <div class="col">
                    <strong>Cartagena</strong>
                </div>
                <div class="col">
                    <strong>Total</strong>
                </div>
            </li>`
            if(personas.adultos > 0){
                total = total + objeto.precio.adulto.valor
                lista += `
                    <li class="clearfix">
                        <div class="col" style="text-transform:none;">
                            <img src="img/products/thumb-1.jpg" width="50" height="50" alt=""> `+personas.adultos+` Adulto(s)
                        </div>
                        <div class="col second">
                            $`+objeto.precio.adulto.valor.toFixed(2)+`
                        </div>
                    </li>
                `

            }
            if(personas.ninos > 0){
                total = total + objeto.precio.nino.valor
                lista += `
                    <li class="clearfix">
                        <div class="col" style="text-transform:none;">
                            <img src="img/products/thumb-1.jpg" width="50" height="50" alt=""> `+personas.ninos+` Niño(s)
                        </div>
                        <div class="col second">
                            $`+objeto.precio.nino.valor.toFixed(2)+`
                        </div>
                    </li>
                `

            }
            if(personas.infante > 0){
                total = total + objeto.precio.infante.valor
                lista += `
                    <li class="clearfix">
                        <div class="col" style="text-transform:none;">
                            <img src="img/products/thumb-1.jpg" width="50" height="50" alt=""> `+personas.infante+` Infante(s)
                        </div>
                        <div class="col second">
                            $`+objeto.precio.infante.valor.toFixed(2)+`
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
                        <strong>$`+total.toFixed(2)+`</strong>
                    </div>
                </li>
    `
    $("#costos").html(lista)
}