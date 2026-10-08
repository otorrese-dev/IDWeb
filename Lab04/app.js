
// 1. REFERENCIAS AL DOM Y ESTADO GLOBAL
const formTarea = document.getElementById('form-tarea');
const tituloInput = document.getElementById('tituloInput');
const cursoSelect = document.getElementById('cursoSelect');
const fechaInputLimit = document.getElementById('fechaInputLimit');
const alertaError = document.getElementById('alerta-error');
const listaTareas = document.getElementById('lista-tareas');
const botonesFiltros = document.querySelectorAll('#filtros .nav-link');

// Arreglo global de objetos tarea (Carga desde LocalStorage si existe)
let tareas = JSON.parse(localStorage.getItem('tareas_academicas')) || [];
let filtroActual = 'todas';


// 2. FUNCION DE PERSISTENCIA EN LOCALSTORAGE
function guardarEnLocalStorage() {
    // Convierte el arreglo de objetos a un texto JSON
    localStorage.setItem('tareas_academicas', JSON.stringify(tareas));
}


// 3. FUNCION PARA ACTUALIZAR CONTADORES DE LAS PESTAÑAS
function actualizarContadores() {
    document.getElementById('cant-todas').textContent = tareas.length;
    document.getElementById('cant-pendientes').textContent = tareas.filter(t => !t.completada).length;
    document.getElementById('cant-completadas').textContent = tareas.filter(t => t.completada).length;
}

// 4. FUNCION PARAMOSTRAR ALERTAS DINÁMICAS 
function mostrarAlerta(mensaje, tipo = 'danger') {
    alertaError.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// 5. FUNCION PARA RENDERIZAR TARJETAS EN PANTALLA
function renderizarTareas() {
    // Limpiamos el contenedor antes de dibujar
    listaTareas.innerHTML = '';

    // 5.1 Filtramos el arreglo según la pestaña activa
    const tareasFiltradas = tareas.filter(tarea => {
        if (filtroActual === 'pendientes') return !tarea.completada;
        if (filtroActual === 'completadas') return tarea.completada;
        return true; // 'todas'
    });

    // 5.2 Si no hay tareas en esta categoría, mostramos un aviso
    if (tareasFiltradas.length === 0) {
        listaTareas.innerHTML = `
            <div class="text-center text-muted p-4 bg-white rounded border shadow-sm">
                No hay tareas registradas en esta sección.
            </div>
        `;
        actualizarContadores();
        return;
    }

    // 5.3 Recorremos con .forEach() e inyectamos cada tarjeta
    tareasFiltradas.forEach(tarea => {
        const tarjeta = document.createElement('div');
        tarjeta.className = `card shadow-sm border-${tarea.completada ? 'success' : 'light'}`;

        tarjeta.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title mb-1 ${tarea.completada ? 'tarea-completada' : ''}">
                    ${tarea.titulo}
                    </h5>
                    <h6 class="card-subtitle mb-2 text-muted small">
                        Curso: ${tarea.curso}
                    </h6>
                    <p class="card-text mb-0 small text-secondary">
                        Fecha límite: ${tarea.fechaEntrega}
                    </p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-${tarea.completada ? 'secondary' : 'success'}" onclick="cambiarEstado(${tarea.id})">
                        ${tarea.completada ? 'Desmarcar' : 'Completar'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarTarea(${tarea.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `;

        listaTareas.appendChild(tarjeta);
    });

    // Actualizamos las cifras de las pestañas
    actualizarContadores();
}

// 6. ACCION DE COMPLETAR TAREA
window.cambiarEstado = function(id) {
    tareas = tareas.map(tarea => 
        tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea
    );
    guardarEnLocalStorage();
    renderizarTareas();
};
// 6.1 ACCION DE ELIMINAR TAREA
window.eliminarTarea = function(id) {
    tareas = tareas.filter(tarea => tarea.id !== id);
    guardarEnLocalStorage();
    mostrarAlerta('Tarea eliminada correctamente.', 'info');
    renderizarTareas();
};

// 7. EVENTO SUBMIT DEL FORMULARIO
formTarea.addEventListener('submit', (event) => {
    event.preventDefault(); // Detiene el refresco de la página

    const titulo = tituloInput.value.trim();
    const curso = cursoSelect.value;
    const fecha = fechaInputLimit.value;
    const hoy = new Date().toISOString().split('T')[0];

    alertaError.innerHTML = ''; // Limpiar alertas anteriores

    // Validaciones
    if (!titulo) {
        mostrarAlerta('¡Error! El título de la tarea es obligatorio.', 'danger');
        return;
    }

    if (!fecha || fecha < hoy) {
        mostrarAlerta('¡Error! La fecha límite no puede ser anterior a la fecha actual.', 'danger');
        return;
    }

    // Advertencia opcional de curso
    if (!curso) {
        mostrarAlerta('Aviso: Registraste la tarea sin un curso asignado.', 'warning');
    }

    // Crear el objeto de la tarea
    const nuevaTarea = {
        id: Date.now(),
        titulo: titulo,
        curso: curso || 'Sin curso asignado',
        fechaEntrega: fecha,
        completada: false
    };

    // Agregar al arreglo, guardar y pintar
    tareas.push(nuevaTarea);
    guardarEnLocalStorage();
    renderizarTareas();

    // Limpiar campos del formulario
    formTarea.reset();
});

// 8. EVENTO DE FILTROS E INICIALIZACIÓN
botonesFiltros.forEach(boton => {
    boton.addEventListener('click', (event) => {
        botonesFiltros.forEach(btn => btn.classList.remove('active'));
        
        // Marcamos la pestaña activa
        const botonSeleccionado = event.target.closest('.nav-link');
        botonSeleccionado.classList.add('active');

        // Cambiamos el estado del filtro
        filtroActual = botonSeleccionado.getAttribute('data-filtro');
        renderizarTareas();
    });
});

// Al cargar la página, pintamos el estado guardado
document.addEventListener('DOMContentLoaded', renderizarTareas);

// 9. FUNCION PARA LIMPIAR BORRAR TODAS LAS TAREAS
// Borra el arreglo global y limpia el almacenamiento persistente
window.vaciarTodasLasTareas = function() {
    if (tareas.length === 0) {
        mostrarAlerta('No hay tareas para eliminar.', 'warning');
        return;
    }

    // Confirmación estándar del navegador
    if (confirm('¿Estás seguro de que deseas eliminar TODAS las tareas?')) {
        tareas = []; // Vacía el arreglo en memoria
        guardarEnLocalStorage(); // Sincroniza el cambio en LocalStorage
        mostrarAlerta('Se han borrado todas las tareas con éxito.', 'info');
        renderizarTareas(); // Actualiza la pantalla y los contadores
    }
};