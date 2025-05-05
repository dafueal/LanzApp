/* global L */ // <-- Indica a JSHint que L es global
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando script del mapa...");

    // --- Elementos DOM ---
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    const editModeToggle = document.getElementById('edit-mode-toggle');
    const coordinateUpdateInfoDiv = document.getElementById('coordinate-update-info');

    // --- Variables Globales ---
    let currentUserId = null;
    let map;
    let isEditMode = false;
    const beachMarkers = {}; // Usar un objeto para acceder fácilmente por ID

    // --- Inicialización del Mapa ---
    console.log("Intentando inicializar mapa en #map...");
    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) throw new Error("Contenedor #map no encontrado.");
        if (typeof L === 'undefined' || !L.map) throw new Error("Leaflet (L) no cargado.");

        map = L.map('map').setView([29.0469, -13.589], 10);
        console.log("Mapa Leaflet creado.");

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        console.log("Capa de teselas añadida.");

    } catch (e) {
         console.error("¡ERROR FATAL inicializando mapa!", e);
         const mapDivError = document.getElementById('map');
         if (mapDivError) mapDivError.innerHTML = `<p class="error-message">ERROR AL INICIALIZAR EL MAPA: ${e.message}</p>`;
         if (userIdStatus) userIdStatus.textContent = "Error al inicializar el mapa.";
         return;
    }

    // --- Lógica de ID de Usuario ---
    function initializeUserId() {
        currentUserId = sessionStorage.getItem('beachExplorerUserId');
        if (userIdInput && userIdStatus) {
            if (currentUserId) {
                userIdInput.value = currentUserId;
                userIdStatus.textContent = `Identificador activo: ${currentUserId}`;
            } else {
                 userIdStatus.textContent = `Introduce un identificador para ver/guardar notas.`;
            }
        } else {
             console.warn("Elementos de User ID no encontrados al inicializar.")
        }
         console.log(`[DEBUG] initializeUserId completado. currentUserId: ${currentUserId}`);
    }

    if (confirmUserIdButton && userIdInput && userIdStatus) {
        confirmUserIdButton.addEventListener('click', () => {
            console.log("[DEBUG] Clic en botón Confirmar ID detectado!");
            const inputId = userIdInput.value.trim();
            if (inputId) {
                currentUserId = inputId;
                try {
                    sessionStorage.setItem('beachExplorerUserId', currentUserId);
                    userIdStatus.textContent = `ID confirmado: ${currentUserId}`;
                } catch (e) {
                    console.error("[DEBUG] ERROR al guardar en sessionStorage:", e);
                    userIdStatus.textContent = `Error al guardar ID.`;
                    alert("Hubo un error al intentar guardar el identificador.");
                }
            } else {
                alert("Por favor, introduce un identificador válido.");
                 userIdStatus.textContent = `Introduce un identificador...`;
                try {
                     sessionStorage.removeItem('beachExplorerUserId');
                } catch (e) { console.error("[DEBUG] ERROR al borrar de sessionStorage:", e); }
                currentUserId = null;
            }
        });
         console.log("[DEBUG] Llamando a initializeUserId...");
         initializeUserId();
    } else {
        console.error("[DEBUG] ¡ERROR! No se encontró el botón, input o status de User ID.");
    }

    // --- Cargar Datos de Playas ---
    console.log("Intentando fetch de beaches.json...");
    fetch('beaches.json') // Asegúrate que beaches.json está en la raíz
      .then(response => {
          console.log("Respuesta fetch beaches.json. Estado:", response.status);
          if (!response.ok) {
              throw new Error(`HTTP error! estado: ${response.status} ${response.statusText}`);
          }
          return response.json();
      })
      .then(beachData => {
          console.log("Datos JSON procesados. Añadiendo marcadores...");
          if (!Array.isArray(beachData)) {
              throw new Error("Los datos de playas recibidos no son un array válido.");
          }
          addBeachMarkers(beachData); // Llamar a la función para añadir marcadores
      })
      .catch(error => {
          console.error('Error al cargar o procesar datos de playas:', error);
          if(userIdStatus) {
              userIdStatus.innerHTML = `<span style="color: red; font-weight: bold;">Error: No se pudieron cargar datos de playas. (${error.message})</span>`;
          }
          // Opcional: Mostrar overlay de error en mapa
          const mapDiv = document.getElementById('map');
          if (map && mapDiv && !mapDiv.querySelector('.fetch-error-overlay')) {
                // ... (código para añadir overlay de error) ...
                const errorOverlay = document.createElement('div');
                // ... (estilos y contenido del overlay) ...
                errorOverlay.textContent = 'Error al cargar datos de playas';
                mapDiv.appendChild(errorOverlay);
          }
      });


    // --- Función para Añadir Marcadores (¡CÓDIGO COMPLETO!) ---
    function addBeachMarkers(beaches) {
      if (!map) {
           console.error("Mapa no inicializado, no se pueden añadir marcadores.");
           return;
      }
      if (!Array.isArray(beaches)) { // Doble verificación
            console.error("Los datos para añadir marcadores no son un array.");
            return;
      }
      console.log(`Añadiendo ${beaches.length} marcadores.`);

      // Limpiar marcadores previos si se llama de nuevo (poco probable aquí, pero buena práctica)
      Object.values(beachMarkers).forEach(marker => map.removeLayer(marker));
      for (const id in beachMarkers) { delete beachMarkers[id]; } // Vaciar objeto

      beaches.forEach(beach => {
        if (!beach || !beach.id || !beach.coordinates || !Array.isArray(beach.coordinates) || beach.coordinates.length !== 2) {
            console.warn(`Omitiendo playa (datos inválidos, sin ID o sin coordenadas):`, beach && beach.name ? beach.name : JSON.stringify(beach));
            return;
        }
        if (typeof L === 'undefined' || !L.marker) {
            console.error("Leaflet (L.marker) no está disponible.");
            return;
        }

        try {
            // Crear marcador. Draggable depende del estado inicial de isEditMode (false)
            const marker = L.marker(beach.coordinates, {
                 draggable: isEditMode // Usar el estado actual
                 // title: beach.name // Alternativa al tooltip
                 }).addTo(map);

            marker.beachInfo = beach; // Guardar info completa
            if(beach.name) marker.bindTooltip(beach.name);

            // Listener para click (redirigir)
            marker.on('click', function() {
              // No permitir click si estamos arrastrando (evita doble evento)
              if (this.isDragging && this.isDragging()) return;

              const beachId = this.beachInfo ? this.beachInfo.id : null;
              if (beachId) {
                  window.location.href = `beach.html?id=${encodeURIComponent(beachId)}`;
              } else {
                  console.error("El marcador clickeado no tiene ID:", this.beachInfo);
                  alert("No se pudo obtener el ID de esta playa.");
              }
            });

            // Listener para fin de arrastre (dragend) - se añade siempre, se activa si es draggable
            marker.on('dragend', handleMarkerDragEnd);

            // Guardar referencia al marcador usando el ID de la playa
            beachMarkers[beach.id] = marker;

        } catch(markerError) {
             console.error(`Error al crear marcador para playa ${beach.name || beach.id || 'desconocida'}:`, markerError);
        }
      });
       console.log("Proceso de añadir marcadores completado.");
    }

    // --- Lógica para Modo Edición (¡CÓDIGO COMPLETO!) ---

    // Se ejecuta cuando se termina de arrastrar un marcador
    function handleMarkerDragEnd(event) {
        const marker = event.target;
        const beachId = marker.beachInfo ? marker.beachInfo.id : null;
        const position = marker.getLatLng();
        const newCoords = [position.lat.toFixed(6), position.lng.toFixed(6)]; // 6 decimales

        console.log(`Marcador '${beachId}' movido a: Lat ${newCoords[0]}, Lng ${newCoords[1]}`);

        if (coordinateUpdateInfoDiv) {
             coordinateUpdateInfoDiv.innerHTML = `Nuevas coordenadas para <strong>${marker.beachInfo.name || beachId}</strong>:<br><code>[${newCoords[0]}, ${newCoords[1]}]</code><br><i>(Recuerda actualizar beaches.json manualmente)</i>`;
        }

        // Aquí es donde, en una aplicación más avanzada,
        // llamarías a una API para guardar las nuevas coordenadas en el backend/DB.
        // Ejemplo: saveNewCoordinates(beachId, newCoords);
    }

    // Se ejecuta cuando cambia el estado del checkbox
    function toggleEditMode() {
        isEditMode = editModeToggle.checked; // Actualizar estado global
        console.log(`Modo Edición ${isEditMode ? 'Activado' : 'Desactivado'}`);

        // Actualizar el estado 'draggable' de TODOS los marcadores existentes
        for (const beachId in beachMarkers) {
            const marker = beachMarkers[beachId];
            if (isEditMode) {
                if (marker.dragging) marker.dragging.enable(); // Habilitar arrastre
                 console.log(`Habilitando drag para ${beachId}`);
            } else {
                if (marker.dragging) marker.dragging.disable(); // Deshabilitar arrastre
                 console.log(`Deshabilitando drag para ${beachId}`);
            }
        }

        // Actualizar mensaje de ayuda
        if (coordinateUpdateInfoDiv) {
            if (isEditMode) {
                 coordinateUpdateInfoDiv.innerHTML = '<i>Modo Edición Activado: Arrastra un marcador para ver sus nuevas coordenadas aquí.</i>';
            } else {
                coordinateUpdateInfoDiv.innerHTML = '<i>Modo Edición Desactivado. Actívalo para poder arrastrar marcadores.</i>';
            }
        }
    }

    // --- Añadir Listener al Checkbox de Edición ---
    console.log("[DEBUG] Buscando checkbox #edit-mode-toggle:", editModeToggle);
    if (editModeToggle && coordinateUpdateInfoDiv) { // Asegurarse que ambos existen
        // Establecer estado inicial del checkbox (debería ser false)
        editModeToggle.checked = isEditMode;
        // Añadir listener
        editModeToggle.addEventListener('change', toggleEditMode);
         // Establecer mensaje inicial
         coordinateUpdateInfoDiv.innerHTML = '<i>Modo Edición Desactivado. Actívalo para poder arrastrar marcadores.</i>';
    } else {
         console.warn("Checkbox #edit-mode-toggle o div #coordinate-update-info no encontrado. Modo Edición no funcionará.");
         // Opcional: ocultar toda la sección de edición si falta algo
         const editSection = document.getElementById('edit-mode-section');
         if(editSection) editSection.style.display = 'none';
    }

    console.log("Script del mapa terminado de cargar (excepto operaciones asíncronas).");

}); // Fin DOMContentLoaded
