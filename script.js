document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando script del mapa...");

    // --- Elementos DOM ---
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    const editModeToggle = document.getElementById('edit-mode-toggle'); // <-- NUEVO: Checkbox Edición
    const coordinateUpdateInfoDiv = document.getElementById('coordinate-update-info'); // <-- NUEVO: Div Info Coords

    // --- Variables Globales ---
    let currentUserId = null;
    let map; // Variable para el mapa
    let isEditMode = false; // <-- NUEVO: Estado de edición
    const markers = []; // <-- NUEVO: Array para guardar los marcadores

    // --- Inicialización del Mapa (igual que antes) ---
    const lanzaroteCenter = [29.0469, -13.589];
    try {
        // ... (inicialización de map y tileLayer igual que antes) ...
        map = L.map('map').setView(lanzaroteCenter, 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { /* ... */ }).addTo(map);
        console.log("Mapa inicializado.");
    } catch (e) { /* ... manejo de error igual ... */ }

    // --- Lógica de ID de Usuario (igual que antes) ---
    function initializeUserId() { /* ... */ }
    if (confirmUserIdButton) { confirmUserIdButton.addEventListener('click', () => { /* ... */ }); }
    initializeUserId();

    // --- Cargar Datos de Playas (igual que antes) ---
    fetch('beaches.json')
      .then(response => {
          if (!response.ok) throw new Error(`HTTP error! estado: ${response.status}`);
          return response.json();
      })
      .then(beachData => {
          addBeachMarkers(beachData);
      })
      .catch(error => { /* ... manejo de error igual ... */ });


    // --- Función para Añadir Marcadores (MODIFICADA) ---
    function addBeachMarkers(beaches) {
        if (!map) { console.error("Mapa no inicializado para añadir marcadores."); return; }
        if (!beaches || !Array.isArray(beaches)) return;

        console.log(`Añadiendo ${beaches.length} marcadores.`);
        beaches.forEach(beach => {
            if (!beach?.coordinates?.length === 2) return; // Simplificado

            try {
                const marker = L.marker(beach.coordinates, {
                    draggable: isEditMode // <-- NUEVO: Draggable según modo edición inicial
                }).addTo(map);

                marker.beachInfo = beach;
                if(beach.name) marker.bindTooltip(beach.name);

                // Listener para ir a detalles (si no estamos en modo edición)
                marker.on('click', function() {
                    if (!isEditMode) { // Solo redirigir si NO estamos editando
                        const beachId = this.beachInfo?.id;
                        if (beachId) {
                            window.location.href = `beach.html?id=${encodeURIComponent(beachId)}`;
                        } else {
                            console.error("Marcador sin ID de playa.");
                        }
                    } else {
                         // En modo edición, el click podría seleccionar para editar, pero por ahora no hace nada
                         console.log("Modo Edición: Click en marcador (no redirige). ID:", this.beachInfo?.id);
                    }
                });

                // Añadir listener dragend INICIALMENTE si editMode ya estuviera activo
                if (isEditMode) {
                    marker.on('dragend', handleMarkerDragEnd);
                }

                markers.push(marker); // <-- NUEVO: Guardar referencia al marcador

            } catch(markerError) {
                 console.error(`Error al crear marcador para ${beach.name || 'desconocida'}:`, markerError);
            }
        });
        console.log("Marcadores añadidos.");
    }

    // --- NUEVA LÓGICA PARA MODO EDICIÓN ---

    /**
     * Manejador para cuando se suelta un marcador después de arrastrarlo.
     * @param {LeafletEvent} event Evento de Leaflet
     */
    function handleMarkerDragEnd(event) {
        const marker = event.target; // El marcador que se movió
        const position = marker.getLatLng(); // Nuevas coordenadas
        const beachId = marker.beachInfo?.id;
        const beachName = marker.beachInfo?.name || 'Desconocido';

        if (!coordinateUpdateInfoDiv) return; // Salir si el div no existe

        const lat = position.lat.toFixed(6); // Formatear con 6 decimales
        const lng = position.lng.toFixed(6);

        console.log(`[EDIT] Marcador movido: ${beachName} (ID: ${beachId}) a [${lat}, ${lng}]`);

        // Mostrar la información en el div
        coordinateUpdateInfoDiv.innerHTML = `
            Marcador movido: <strong>${beachName}</strong> (ID: ${beachId})<br>
            Nuevas Coordenadas: <code>[${lat}, ${lng}]</code><br>
            <i>Actualiza manualmente estas coordenadas en beaches.json si son correctas.</i>`;
    }

    /**
     * Activa o desactiva el modo de edición para todos los marcadores.
     */
    function toggleEditMode() {
        isEditMode = editModeToggle.checked; // Actualizar estado global

        if (!coordinateUpdateInfoDiv) return;

        if (isEditMode) {
            console.log("Activando modo edición.");
            coordinateUpdateInfoDiv.innerHTML = '<i>Modo edición activado. Arrastra un marcador para ajustar su posición.</i>';
            markers.forEach(marker => {
                marker.dragging.enable(); // Habilitar arrastre
                marker.on('dragend', handleMarkerDragEnd); // Añadir listener
            });
            // Opcional: Cambiar cursor sobre el mapa o marcadores
            if (map?._container) map._container.style.cursor = 'grab';

        } else {
            console.log("Desactivando modo edición.");
             coordinateUpdateInfoDiv.innerHTML = '<i>Para corregir la posición de un marcador, activa el modo edición y arrástralo a su nueva ubicación...</i>'; // Mensaje original
            markers.forEach(marker => {
                marker.dragging.disable(); // Deshabilitar arrastre
                marker.off('dragend', handleMarkerDragEnd); // QUITAR listener
            });
             if (map?._container) map._container.style.cursor = ''; // Restaurar cursor
        }
    }

    // Añadir listener al checkbox de edición
    if (editModeToggle) {
        editModeToggle.addEventListener('change', toggleEditMode);
    } else {
         console.warn("Checkbox #edit-mode-toggle no encontrado.");
    }

    console.log("Script del mapa terminado de cargar.");

}); // Fin DOMContentLoaded
