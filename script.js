/* global L */ // <-- Indica a JSHint que L es global
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando script del mapa...");

    // --- Elementos DOM ---
    // ¡Estas variables DEBEN usarse después!
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    const editModeToggle = document.getElementById('edit-mode-toggle');
    const coordinateUpdateInfoDiv = document.getElementById('coordinate-update-info');

    // --- Variables Globales ---
    let currentUserId = null; // ¡Esta variable DEBE usarse después!
    let map;
    let isEditMode = false;
    const markers = [];

    // --- Inicialización del Mapa ---
    // ... (código de inicialización del mapa como antes) ...
    try {
        map = L.map('map').setView([29.0469, -13.589], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { /* ... */ }).addTo(map);
        console.log("Mapa inicializado.");
    } catch (e) {
        console.error("¡ERROR FATAL inicializando mapa!", e);
        // ... (manejo de error) ...
        return;
    }


    // --- Lógica de ID de Usuario ---
    function initializeUserId() {
        // ¡Asegúrate que estas líneas NO están comentadas!
        currentUserId = sessionStorage.getItem('beachExplorerUserId'); // <-- Uso de currentUserId
        if (userIdInput && userIdStatus) { // Comprobar si existen los elementos
            if (currentUserId) {
                userIdInput.value = currentUserId; // <-- Uso de userIdInput
                userIdStatus.textContent = `Identificador activo: ${currentUserId}`; // <-- Uso de userIdStatus
            } else {
                 userIdStatus.textContent = `Introduce un identificador...`; // <-- Uso de userIdStatus
            }
        } else {
             console.warn("Elementos de User ID no encontrados al inicializar.")
        }
         console.log(`[DEBUG] initializeUserId completado. currentUserId: ${currentUserId}`);
    }

    // ¡Asegúrate que este bloque y su contenido NO están comentados!
    if (confirmUserIdButton && userIdInput && userIdStatus) {
        confirmUserIdButton.addEventListener('click', () => {
            console.log("[DEBUG] Clic en botón Confirmar ID detectado!");
            const inputId = userIdInput.value.trim(); // <-- Uso de userIdInput
            console.log("[DEBUG] Valor del input:", inputId);

            if (inputId) {
                currentUserId = inputId; // <-- Uso de currentUserId
                try {
                    sessionStorage.setItem('beachExplorerUserId', currentUserId); // <-- Uso de currentUserId
                    console.log("[DEBUG] ID guardado en sessionStorage.");
                    userIdStatus.textContent = `ID confirmado: ${currentUserId}`; // <-- Uso de userIdStatus
                    console.log(`[DEBUG] Mensaje de estado actualizado.`);
                } catch (e) {
                    console.error("[DEBUG] ERROR al guardar en sessionStorage:", e);
                    userIdStatus.textContent = `Error al guardar ID.`; // <-- Uso de userIdStatus
                    alert("Hubo un error al intentar guardar el identificador.");
                }
            } else {
                console.log("[DEBUG] Input ID está vacío.");
                alert("Por favor, introduce un identificador válido.");
                 userIdStatus.textContent = `Introduce un identificador...`; // <-- Uso de userIdStatus
                try {
                     sessionStorage.removeItem('beachExplorerUserId');
                     console.log("[DEBUG] ID borrado de sessionStorage.");
                } catch (e) {
                     console.error("[DEBUG] ERROR al borrar de sessionStorage:", e);
                }
                currentUserId = null; // <-- Uso de currentUserId
            }
        });
         // ¡Asegúrate que esta llamada NO está comentada!
         console.log("[DEBUG] Llamando a initializeUserId...");
         initializeUserId();

    } else {
        console.error("[DEBUG] ¡ERROR! No se encontró el botón, input o status de User ID. Listeners no añadidos.");
    }


    // --- Cargar Datos de Playas ---
    // ... (código fetch y addBeachMarkers como antes) ...
     fetch('beaches.json')
        .then(response => { /* ... */ })
        .then(beachData => { addBeachMarkers(beachData); })
        .catch(error => { /* ... */ });


    // --- Función addBeachMarkers (MODIFICADA para edición) ---
    function addBeachMarkers(beaches) { /* ... código como antes ... */ }

    // --- Lógica para Modo Edición ---
    function handleMarkerDragEnd(event) { /* ... código como antes ... */ }
    function toggleEditMode() { /* ... código como antes ... */ }

    // ¡Asegúrate que este bloque y su contenido NO están comentados!
    console.log("[DEBUG] Buscando checkbox #edit-mode-toggle:", editModeToggle);
    if (editModeToggle) {
        editModeToggle.addEventListener('change', toggleEditMode);
    } else {
         console.warn("Checkbox #edit-mode-toggle no encontrado.");
    }

    console.log("Script del mapa terminado de cargar.");

}); // Fin DOMContentLoaded
