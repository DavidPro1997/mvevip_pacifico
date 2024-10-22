function recibirInformacion() {
    const urlParams = new URLSearchParams(window.location.search);
    const idVerificar = urlParams.get('idVerificar');
    if (idVerificar) {
        const id = parseInt(localStorage.getItem('idVerificar'))
        const datosCliente = JSON.parse(localStorage.getItem("datosCliente"))
        const ciudad = localStorage.getItem('lugarSalida')
        consultarFechas(ciudad, 5)
        verificarPago(id)
        armarDom(datosCliente)
        
    }
    else{
        scrollTop()
        escogerSalida('UIO - Quito - Mariscal Sucre - Ecuador',5)
    }
}


function armarDom(datosCLiente){
    const ciudad = localStorage.getItem('lugarSalida')
    document.getElementById("salida").value = ciudad
    document.getElementById("fechaSalida").value = localStorage.getItem('fechaSalida')
    document.getElementById("apellidos").value = datosCLiente.apellidos
    document.getElementById("nombres").value = datosCLiente.nombres
    document.getElementById("correo").value = datosCLiente.email
    document.getElementById("celular").value = datosCLiente.celular
    document.getElementById("numeroAdulto").value = datosCLiente.adultos
    document.getElementById("numeroNino").value = datosCLiente.ninos
    document.getElementById("numeroBebe").value = datosCLiente.infantes
    cargarPersonas()
}



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


function verificarPago(idPago){
    Obtener(null, 'leads/consulta-pago/'+idPago, datos => {
        if (datos.estado) {
            if(datos.pago.estado){
                Swal.fire({
                    icon: 'success',
                    title: 'Pago procesado con éxito',
                    text: datos.pago.mensaje
                }).then(() => {
                    recibirCotizacion()
                });
            }else{
                Swal.fire({
                    icon: 'info',
                    title: 'Procesando pago',
                    text: datos.pago.mensaje
                }).then(() => {
                    recibirCotizacion()
                });
            }
            
        }
        else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: datos.error
            }).then(() => {
                recibirCotizacion()
            });
        }
        
    })
}





function pagar(){
    $("#spinner").show()
    const fechaBuscada = document.getElementById("fechaSalida").value
    let objeto = fechasGlobales.find(item => item.fecha === fechaBuscada);
    const date = armarArrayDatosPago()
    Enviar(JSON.stringify(date), 'leads/registro-pago/'+objeto.id, datos => {
        if (datos.consulta) {
            $("#spinner").hide()
            window.open(datos.link, '_self');
            localStorage.setItem("idVerificar",datos.idPago)
            $('#standard-modal').modal('hide');
        }
        else{
            $("#spinner").hide()
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: datos.error
            }).then(() => {
                $('#standard-modal').modal('show');
            });
            
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
            disableMobile: true,
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
            disableMobile: true,
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
        "nombres": document.getElementById("apellidos").value +" "+ document.getElementById("nombres").value,
        "email": document.getElementById("correo").value,
        "celular": document.getElementById("celular").value,
        "adultos": personas.adultos,
        "ninos": personas.ninos,
        "infantes": personas.infante
    }
    localStorage.setItem("datosCliente",JSON.stringify(datos))
    return datos
}



function armarArrayDatosPago(){
    const datos = {
        "documento": document.getElementById("documento").value,
        "apellidos": document.getElementById("apellidos").value,
        "nombres": document.getElementById("nombres").value,
        "email": document.getElementById("correo").value,
        "celular": document.getElementById("celular").value,
        "valor": parseFloat(precio)
        // "valor": 3500
        
    }
    return datos
}


var precio = 0
function recibirCotizacion(id){
    let fechaBuscada = ""
    if(id){
        fechaBuscada = document.getElementById("fechaSalida").value
    }else{
        fechaBuscada = localStorage.getItem('fechaSalida')
        document.getElementById("fechaSalida").value = fechaBuscada
    }
    const lugarSalida = document.getElementById("salida").value
    localStorage.setItem("fechaSalida",fechaBuscada)
    localStorage.setItem("lugarSalida",lugarSalida)
    let objeto = fechasGlobales.find(item => item.fecha === fechaBuscada);
    const date = armarArrayDatos()
    Enviar(JSON.stringify(date), 'leads/consulta-itinerario/'+objeto.id, datos => {
        if (datos.estado) {
            precio = datos.consulta.precio.totalPaquete.valor
            ponerCosto(datos.consulta.precio)
            armarVuelos(datos.consulta.origen, datos.consulta.destino,datos.consulta.salida,datos.consulta.retorno)
            $("#detalles").show()
            if(id){
                Swal.fire({
                    icon: 'success',
                    title: 'Consulta realizada',
                    text: '¡Revisa tu paquete!'
                })
            }
            
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
                    <strong style="color:#99c21c;">PAQUETE COMPLETO</strong>
                </div>
                <div class="col">
                    <strong>Precio</strong>
                </div>
                <div class="col">
                    <strong>Cantidad</strong>
                </div>
                <div class="col">
                    <strong>Total</strong>
                </div>
            </li>`
            if(precio.adulto.valor > 0){
                lista += `
                    <li class="clearfix">
                        <div class="col" style="text-transform:none;">
                            <i class="icon-adult" style="font-size: 25px; color:#99c21c;"></i> 
                            Adulto(s)
                        </div>
                        <div class="col" style="text-transform:none;">
                            $`+(precio.adulto.valor/personas.adultos).toFixed(2)+`
                        </div>
                        <div class="col" style="text-transform:none; text-align:center;">
                            `+personas.adultos+` 
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
                            <i class="icon-child" style="font-size: 25px; color:#99c21c;"></i> 
                            Niño(s)
                        </div>
                        <div class="col">
                            $`+(precio.nino.valor/personas.ninos).toFixed(2)+`
                        </div>
                        <div class="col" style="text-transform:none; text-align:center;">
                            `+personas.ninos+` 
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
                            <i class="icon-child" style="font-size: 25px; color:#99c21c;"></i>  
                            Infante(s)
                        </div>
                        <div class="col second">
                            $`+(precio.infante.valor/personas.infante).toFixed(2)+`
                        </div>
                        <div class="col" style="text-transform:none; text-align:center;">
                            `+personas.infante+` 
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
                    <div class="col"></div>
                    <div class="col"></div>
                    <div class="col second">
                        <strong>$`+precio.totalPaquete.valor.toFixed(2)+`</strong>
                    </div>
                </li>
    `
    if(precio.totalPaquete.valor>=3500){
        $("#botonPagarAhora2").hide()
        $("#botonPagarAhora1").hide()
    }
    else{
        $("#botonPagarAhora2").show()
        $("#botonPagarAhora1").show()
    }
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
                                <img src="`+sacarLogoAereolina("2K")+`" style=" margin-right: 15px;" alt="" height="30" >
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
                                `+plasmarVuelosDom(salida,0)+`
                                <br>
                                `+plasmarVuelosDom(retorno,1)+`
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
   
    $("#detalleVuelos").html(lista)
}



function plasmarVuelosDom(vuelo, tipo){
    let lista = ""
    if(tipo == 0){
        lista = ` 
            <div class="row mx-2">
                <div class="col-12" style="display: flex; align-items: center;">
                    <i class="icon-plane" style="transform: rotate(45deg); margin-right: 10px; font-size: 20px;"></i>
                    <h5 style="margin-right: 20px; font-size: 16px;">IDA</h5>
                    <h5 style="font-size: 16px;"> `+vuelo.fecha+`</h5>
                </div>
            </div>
        `
    }else if (tipo == 1){
        lista = ` 
            <div class="col-12" style="display: flex; align-items: center;">
                <i class="icon-plane" style="transform: rotate(315deg); margin-right: 10px; font-size: 20px;"></i>
                <h5 style="margin-right: 20px; font-size: 16px;">VUELTA</h5>
                <h5 style="font-size: 16px;"> `+vuelo.fecha+`</h5>
            </div>
        `
    }
    lista =` 
        
        <hr style="margin-top: 0; margin-bottom: 0;">
        <div class="row mx-1" style="align-items: center;">
            <div class="col-6">
                <span>
                    <strong>`+vuelo.escalas[0].desde+`</strong>
                    <i class="icon-left" style="font-size: 22px;"></i>
                    <strong>`+vuelo.escalas[vuelo.escalas.length-1].hasta+`</strong>`
                    if(compararHoras(vuelo.escalas[0].desde, vuelo.escalas[vuelo.escalas.length-1].hasta)){
                        lista += `<span style="color: #99c21c;"> <strong>+1</strong></span>`
                    }
                    lista += ` 
                </span>
            </div>
            <div class="col-3">
                <span>`+diferenciaHoras(vuelo.escalas[0].desde, vuelo.escalas[vuelo.escalas.length-1].hasta)+`</span>
            </div>
            <div class="col-3" style="text-align: end; justify-content: end; display: flex; flex-direction: column;">`
                if(vuelo.escalas.length<2){
                    lista += `<span>Directo</span>`
                }
                else {
                    lista += `<span>`+(vuelo.escalas.length-1)+` Escala(s)</span>`
                }
                lista +=`
            </div>
            <div> 
                

            <hr style="margin:0;">
            `
            vuelo.escalas.forEach((element,index) => {
                lista += `
                <div class="row" >
                    <div class="col-1">
                    </div>
                    <div class="col-3" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                        <span style="font-size:12px;">`+element.desde+`</span>
                    </div>
                    <div class="col-4" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                        <i class="icon-plane" style="transform: rotate(90deg); margin-right: 10px; font-size: 30px;"></i>
                        <span style="font-size:12px;">`+element.duracion+`</span>
                    </div>
                    <div class="col-3" style="text-align: center; justify-content: center; display: flex; flex-direction: column;">
                        <span style="font-size:12px;">`+element.hasta+`</span>
                    </div>
                    <div class="col-1">
                    </div>
                </div>
                <hr style="margin:0;">`
                if(vuelo.escalas[index+1]){
                    lista +=` 
                        <div class="row" style="background-color:#f9f9f9">
                            <div class="col-12" style="text-align: center; justify-content: center;">
                                <i class="icon-clock" style="margin-right: 10px; font-size: 20px;"></i>
                                <span style="font-size:12px;">Escala `+element.hasta.split(' ')[0]+`: `+diferenciaHoras(element.hasta,vuelo.escalas[index+1].desde)+`</span>
                            </div>
                        </div>
                    `
                }   
            });
            lista +=
            `

            </div>
            <hr style="font-size: 16px;">
        </div>
    `
    return lista
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

function compararHoras(hora1, hora2) {
    // Extraer solo la parte dentro de los paréntesis
    let h1 = hora1.match(/\((\d{2}:\d{2})\)/)[1];
    let h2 = hora2.match(/\((\d{2}:\d{2})\)/)[1];

    // Convertir las horas a formato de objeto Date para comparar
    let time1 = new Date(`1970-01-01T${h1}:00`);
    let time2 = new Date(`1970-01-01T${h2}:00`);

    // Devolver true si la hora2 es menor que hora1
    return time2 < time1;
}


function diferenciaHoras(hora1, hora2) {
    // Extraer solo la parte dentro de los paréntesis
    let h1 = hora1.match(/\((\d{2}:\d{2})\)/)[1];
    let h2 = hora2.match(/\((\d{2}:\d{2})\)/)[1];

    // Convertir las horas a objetos Date
    let time1 = new Date(`1970-01-01T${h1}:00`);
    let time2 = new Date(`1970-01-01T${h2}:00`);

    // Si la hora2 es menor que hora1, asumimos que la hora2 es del día siguiente
    if (time2 < time1) {
        time2.setDate(time2.getDate() + 1);
    }

    // Calcular la diferencia en milisegundos
    let diferenciaMs = time2 - time1;

    // Convertir a horas y minutos
    let diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
    let diferenciaMinutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

    // Devolver el resultado en el formato XH:XXMIN
    return `${diferenciaHoras}h:${diferenciaMinutos}min`;
}


function masInformacion(){
    window.open("https://bit.ly/CTG_TC_PCFC", '_blank');
}

function validarDiezDigitos(input){
    if (input.value.length > 10) {
        input.value = input.value.slice(0, 10); // Limita a 10 caracteres
    }
}