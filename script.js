document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando script del mapa...");

    // --- Elementos de ID de Usuario ---
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    let currentUserId = null;

    // --- Inicialización del Mapa ---
    let map; // Variable para el mapa
    const lanzaroteCenter = [29.0469, -13.589];
    console.log("Intentando inicializar mapa en #map...");
    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) throw new Error("Contenedor #map no encontrado.");
        if (typeof L === 'undefined' || !L.map) throw new Error("Leaflet (L) no cargado.");

        map = L.map('map').setView(lanzaroteCenter, 10);
        console.log("Mapa Leaflet creado.");

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        console.log("Capa de teselas añadida.");

    } catch (e) {
         console.error("¡ERROR FATAL durante la inicialización básica del mapa!", e);
         const mapDivError = document.getElementById('map');
         if (mapDivError) mapDivError.innerHTML = `<p class="error-message">ERROR AL INICIALIZAR EL MAPA: ${e.message}</p>`;
         if (userIdStatus) userIdStatus.textContent = "Error al inicializar el mapa.";
         return; // Detener si el mapa falla
    }

    // --- Lógica de ID de Usuario ---
    function initializeUserId() {
        currentUserId = sessionStorage.getItem('beachExplorerUserId');
        if (currentUserId) {
            userIdInput.value = currentUserId;
            userIdStatus.textContent = `Identificador activo: ${currentUserId}`;
        } else {
             userIdStatus.textContent = `Introduce un identificador para ver/guardar notas personales en cada playa.`;
        }
    }

    if (confirmUserIdButton && userIdInput && userIdStatus) {
        confirmUserIdButton.addEventListener('click', () => {
            const inputId = userIdInput.value.trim();
            if (inputId) {
                currentUserId = inputId;
                sessionStorage.setItem('beachExplorerUserId', currentUserId);
                userIdStatus.textContent = `ID confirmado: ${currentUserId}`;
                // Opcional: feedback visual o quitar alert
                // alert(`Identificador "${currentUserId}" guardado para esta sesión.`);
            } else {
                alert("Por favor, introduce un identificador válido.");
                 userIdStatus.textContent = `Introduce un identificador para guardar notas.`;
                sessionStorage.removeItem('beachExplorerUserId');
                currentUserId = null;
            }
        });
         initializeUserId(); // Cargar ID guardado al inicio
    } else {
        console.warn("Elementos de ID de usuario no encontrados.");
    }


    // --- Cargar Datos de Playas y Añadir Marcadores ---
    console.log("Intentando fetch de beaches.json...");
    fetch('beaches.json')
      .then(response => {
          console.log("Respuesta fetch recibida para beaches.json. Estado:", response.status);
          if (!response.ok) {
              throw new Error(`HTTP error! estado: ${response.status} ${response.statusText}`);
          }
          return response.json();
      })
      .then(beachData => {
          console.log("Datos JSON procesados. Añadiendo marcadores...");
          addBeachMarkers(beachData); // Llamar a la función para añadir marcadores
      })
      .catch(error => {
          console.error('Error al cargar los datos de las playas (fetch catch):', error);
          // Mostrar error en la sección de ID en lugar de sobreescribir el mapa
          if(userIdStatus) {
              userIdStatus.innerHTML = `<span style="color: red; font-weight: bold;">Error: No se pudieron cargar los datos de las playas. (${error.message})</span>`;
          }
          // Opcional: Mostrar un mensaje discreto sobre el mapa si el div aún existe
          const mapDiv = document.getElementById('map');
          if (map && mapDiv && !mapDiv.querySelector('.fetch-error-overlay')) { // Evitar duplicados
                const errorOverlay = document.createElement('div');
                errorOverlay.className = 'fetch-error-overlay'; // Para posible estilo CSS
                errorOverlay.style.position = 'absolute';
                errorOverlay.style.top = '10px';
                errorOverlay.style.left = '50%';
                errorOverlay.style.transform = 'translateX(-50%)';
                errorOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
                errorOverlay.style.color = 'white';
                errorOverlay.style.padding = '5px 10px';
                errorOverlay.style.borderRadius = '3px';
                errorOverlay.style.zIndex = '1001'; // Encima del mapa
                errorOverlay.textContent = 'Error al cargar datos de playas';
                mapDiv.appendChild(errorOverlay);
          }
      });

    // --- Función para Añadir Marcadores ---
    function addBeachMarkers(beaches) {
      if (!map) { // Comprobar si el mapa existe
           console.error("No se puede añadir marcadores, el objeto 'map' no está definido.");
           return;
      }
      if (!beaches || !Array.isArray(beaches) || beaches.length === 0) {
        console.warn("No se proporcionaron datos válidos de playas para addBeachMarkers");
        return;
      }
       console.log(`Añadiendo ${beaches.length} marcadores.`);

      beaches.forEach(beach => {
        if (!beach || !beach.coordinates || !Array.isArray(beach.coordinates) || beach.coordinates.length !== 2) {
            console.warn(`Omitiendo playa (datos inválidos o sin coordenadas):`, beach && beach.name ? beach.name : 'Desconocido');
            return;
        }
        if (typeof L === 'undefined' || !L.marker) { // Comprobar si L.marker existe
            console.error("Leaflet (L.marker) no está disponible para crear marcador.");
            return; // Salir si Leaflet no está listo
        }

        try { // Añadir try-catch por si falla un marcador individual
            const marker = L.marker(beach.coordinates).addTo(map);
            marker.beachInfo = beach; // Guardar info completa
            if(beach.name) marker.bindTooltip(beach.name); // Añadir tooltip si hay nombre

            marker.on('click', function() {
              const beachId = this.beachInfo ? this.beachInfo.id : null;
              if (beachId) {
                  // Redirigir a la página de detalles
                  window.location.href = `beach.html?id=${encodeURIComponent(beachId)}`;
              } else {
                  console.error("El marcador clickeado no tiene un ID de playa asociado:", this.beachInfo);
                  alert("No se pudo obtener el identificador único de esta playa.");
              }
            });
        } catch(markerError) {
             console.error(`Error al crear marcador para playa ${beach.name || 'desconocida'}:`, markerError);
        }
      });
       console.log("Proceso de añadir marcadores completado.");
    }

    console.log("Script del mapa terminado de cargar (excepto operaciones asíncronas).");

}); // Fin DOMContentLoaded
