const api = "https://apibeta.mvevip.com/api/v1/"

function Enviar(campos, modulo, callback, log=true){
    var call = $.ajax({
        url: api+modulo,
        headers: {
            'Authorization': localStorage.getItem("hash"),
            'Content-Type': 'application/json'
        },
        type: 'POST',
        data: campos,
		dataType: 'json',
		success: function(datos){
            if (log){
                console.log(datos);
            } 
            if (typeof callback === "function") {
                callback(datos);
            }
        },
		error: function(e){
            if (log){
                console.log(e);
            }
			if (typeof callback === "function") {
                callback(e);
            }
		}
    });  

}

function Enviar_Archivos(campos, modulo, callback, log=true){
    $.ajax({
        url: api+modulo,
        headers: {
            'Authorization': localStorage.getItem("hash")            
        },
        type: 'POST',
        data: campos,
        contentType: false,
        cache: false,
        processData:false,
		dataType: 'json',
		success: function(datos){
            if (log){
                console.log(datos);
            } 
            if (typeof callback === "function") {
                callback(datos);
            }
        },
		error: function(e){
            if (log){
                console.log(e);
            }
			if (typeof callback === "function") {
                callback(e);
            }
		}
    });
}

function Obtener(campos, modulo, callback, log=true){
    $.ajax({
        url: api+modulo,
        headers: {
            'Authorization': localStorage.getItem("hash"),
            'Content-Type': 'application/json'
        },
        type: 'GET',
        data: campos,
		dataType: 'json',
        async: true,
		success: function(datos){
            if (log){
                console.log(datos);
            }            
            if (typeof callback === "function") {
                callback(datos);
            }
        },
		error: function(e){
            if (log){
                console.log(e);
            }
			if (typeof callback === "function") {
                callback(e);
            }
		}
    });  
}

function Modificar(campos, modulo, callback){
    $.ajax({
        url: api+modulo,
        headers: {
            'Authorization': localStorage.getItem("hash"),
            'Content-Type': 'application/json'
        },
        type: 'PUT',
        data: campos,
		dataType: 'json',
		success: function(datos){
            console.log(datos);
            if (typeof callback === "function") {
                callback(datos);
            }
        },
		error: function(e){
            console.log(e);
			if (typeof callback === "function") {
                callback(e);
            }
		}
    });  
}

function Delete(campos, modulo, callback){
    $.ajax({
        url: api+modulo,
        headers: {
            'Authorization': localStorage.getItem("hash"),
            'Content-Type': 'application/json'
        },
        type: 'DELETE',
        data: campos,
		dataType: 'json',
		success: function(datos){
            console.log(datos);
            if (typeof callback === "function") {
                callback(datos);
            }
        },
		error: function(e){
            console.log(e);
			if (typeof callback === "function") {
                callback(e);
            }
		}
    });  
} 