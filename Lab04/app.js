// 1. ESTADO Y REFERENCIAS AL DOM
const formTarea = document.getElementById('form-tarea');
const tituloInput = document.getElementById('tituloInput');
const cursoSelect = document.getElementById('cursoSelect');
const fechaInputLimit = document.getElementById('fechaInputLimit');
const alertaContainer = document.getElementById('alerta-error');
const listaTareasContenedor = document.getElementById('lista-tareas');
const botonesFiltros = document.querySelectorAll('#filtros .nav-link');

// Carga las tareas guardadas de LocalStorage o inicia un arreglo vacío
let tareas = JSON.parse(localStorage.getItem('tareas_academicas')) || [];
let filtroActual = 'todas';

// 2. PERSISTENCIA DE DATOS
function guardarEnLocalStorage() {
    localStorage.setItem('tareas_academicas', JSON.stringify(tareas));
}
// 3. ALERTAS DINÁMICAS
function mostrarAlerta(mensaje, tipo = 'danger') {
    alertaContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show my-2" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// 4. RENDERIZADO EN EL DOM
function renderizarTareas() {
    listaTareasContenedor.innerHTML = '';

    // Filtrar el arreglo según la pestaña activa
    const tareasFiltradas = tareas.filter(tarea => {
        if (filtroActual === 'pendientes') return !tarea.completada;
        if (filtroActual === 'completadas') return tarea.completada;
        return true; // 'todas'
    });

    // Mensaje en caso de que no haya tareas
    if (tareasFiltradas.length === 0) {
        listaTareasContenedor.innerHTML = `
            <div class="text-center text-muted p-4 bg-white rounded border shadow-sm">
                No hay tareas para mostrar en esta categoría.
            </div>
        `;
        return;
    }

    // Dibujar tarjetas de Bootstrap
    tareasFiltradas.forEach(tarea => {
        const tarjeta = document.createElement('div');
        tarjeta.className = `card shadow-sm border-${tarea.completada ? 'success' : 'light'}`;

        tarjeta.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title mb-1 ${tarea.completada ? 'text-decoration-line-through text-muted' : ''}">
                        ${tarea.titulo}
                    </h5>
                    <h6 class="card-subtitle mb-2 text-muted small">
                        Curso: ${tarea.curso || 'No especificado'}
                    </h6>
                    <p class="card-text mb-0 small text-secondary">
                        Fecha límite: ${tarea.fechaEntrega || 'Sin fecha'}
                    </p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-${tarea.completada ? 'secondary' : 'success'}" onclick="cambiarEstadoTarea(${tarea.id})">
                        ${tarea.completada ? 'Desmarcar' : 'Completar'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarTarea(${tarea.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `;

        listaTareasContenedor.appendChild(tarjeta);
    });
}

// 5. ACCIONES (Completar / Eliminar)
window.cambiarEstadoTarea = function(id) {
    tareas = tareas.map(tarea => 
        tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea
    );
    guardarEnLocalStorage();
    renderizarTareas();
};

window.eliminarTarea = function(id) {
    tareas = tareas.filter(tarea => tarea.id !== id);
    guardarEnLocalStorage();
    mostrarAlerta('Tarea eliminada correctamente.', 'info');
    renderizarTareas();
};

// 6. EVENTO DEL FORMULARIO (Agregar Tarea)
formTarea.addEventListener('submit', (evento) => {
    evento.preventDefault(); 

    const titulo = tituloInput.value.trim();
    const curso = cursoSelect.value;
    const fechaEntrega = fechaInputLimit.value;
    const hoy = new Date().toISOString().split('T')[0];

    // Validaciones
    if (!titulo || !curso || !fechaEntrega) {
        mostrarAlerta('¡Error! Por favor completa todos los campos.', 'danger');
        return; 
    }

    if (fechaEntrega < hoy) {
        mostrarAlerta('¡Error! La fecha de entrega no puede ser anterior a la actual.', 'danger');
        return;
    }

    // Crear y guardar objeto
    const nuevaTarea = {
        id: Date.now(),                          
        titulo,        
        curso,                
        fechaEntrega,     
        completada: false                        
    };

    tareas.push(nuevaTarea);
    guardarEnLocalStorage();
    
    // Limpieza e interfaz
    formTarea.reset();
    alertaContainer.innerHTML = '';
    renderizarTareas();
});

// 7. MANEJO DE FILTROS E INICIALIZACIÓN
botonesFiltros.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesFiltros.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        filtroActual = e.target.getAttribute('data-filtro');
        renderizarTareas();
    });
});

// Cargar tareas guardadas al iniciar la página
document.addEventListener('DOMContentLoaded', renderizarTareas);