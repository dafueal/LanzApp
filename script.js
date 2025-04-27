document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando script del mapa...");

    // --- Elementos de ID de Usuario (NUEVO en este script) ---
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    let currentUserId = null; // Variable local para el ID

    // --- Inicialización del Mapa ---
    const lanzaroteCenter = [29.0469, -13.589];
    console.log("Intentando inicializar mapa en #map...");
    try {
        const map = L.map('map').setView(lanzaroteCenter, 10);
        console.log("Objeto Mapa Leaflet creado:", map);

        // Añadir Capa de Teselas (OpenStreetMap)
        console.log("Intentando añadir capa de teselas...");
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        console.log("Capa de teselas añadida.");

    } catch (e) {
         console.error("¡ERROR durante la inicialización básica del mapa!", e);
         // Podrías mostrar un error en la sección de ID de usuario si el mapa falla
         if(userIdStatus) userIdStatus.textContent = "Error al inicializar el mapa.";
    }

    // --- Lógica de ID de Usuario (NUEVO en este script) ---
    function initializeUserId() {
        currentUserId = sessionStorage.getItem('beachExplorerUserId');
        if (currentUserId) {
            userIdInput.value = currentUserId;
            userIdStatus.textContent = `Identificador activo: ${currentUserId}`;
        } else {
             userIdStatus.textContent = `Introduce un identificador para guardar notas en las páginas de playas.`;
        }
    }

    if (confirmUserIdButton) {
        confirmUserIdButton.addEventListener('click', () => {
            const inputId = userIdInput.value.trim();
            if (inputId) {
                currentUserId = inputId;
                sessionStorage.setItem('beachExplorerUserId', currentUserId); // Guardar en session storage
                userIdStatus.textContent = `ID confirmado: ${currentUserId}`;
                alert(`Identificador "${currentUserId}" guardado para esta sesión.`); // Feedback visual rápido
            } else {
                alert("Por favor, introduce un identificador válido.");
                 userIdStatus.textContent = `Introduce un identificador para guardar notas.`;
                sessionStorage.removeItem('beachExplorerUserId'); // Limpiar si se introduce vacío
                currentUserId = null;
            }
        });
    }

    // Inicializar el estado del User ID al cargar
    if(userIdInput && userIdStatus) { // Asegurarse que los elementos existen
       initializeUserId();
    }


    // --- Cargar Datos de Playas y Añadir Marcadores ---
    console.log("Intentando fetch de beaches.json...");
    fetch('beaches.json')
      .then(response => {
          console.log("Respuesta fetch recibida:", response.status);
          if (!response.ok) {
              throw new Error(`Error HTTP! estado: ${response.status}`);
          }
          return response.json();
      })
      .then(beachData => {
          console.log("Datos JSON procesados. Añadiendo marcadores...");
          addBeachMarkers(beachData);
      })
      .catch(error => {
          console.error('Error al cargar los datos de las playas (fetch catch):', error);
          const mapDiv = document.getElementById('map');
          if (mapDiv && !mapDiv.querySelector('.error-message')) {
               mapDiv.innerHTML = `<p class="error-message" style="color: red; text-align: center; padding: 20px;">No se pudieron cargar los datos de las playas. Revisa la consola.</p>`;
          }
          // Mostrar error también en la sección de ID
          if(userIdStatus) userIdStatus.textContent = "Error al cargar datos de playas.";
      });

    // --- Funciones ---
    function addBeachMarkers(beaches) {
      if (!beaches || beaches.length === 0) {
        console.warn("No se proporcionaron datos de playas para addBeachMarkers");
        return;
      }
       console.log(`Añadiendo ${beaches.length} marcadores.`);

      beaches.forEach(beach => {
        if (!beach.coordinates || beach.coordinates.length !== 2) {
            console.warn(`Omitiendo playa "${beach.name}" por coordenadas inválidas.`);
            return;
        }

        const marker = L.marker(beach.coordinates).addTo(map);
        marker.beachInfo = beach;
        marker.bindTooltip(beach.name);

        marker.on('click', function() {
          const beachId = this.beachInfo.id;
          if (beachId) {
              // La redirección no cambia, beach.html leerá el ID de sessionStorage
              window.location.href = `beach.html?id=${encodeURIComponent(beachId)}`;
          } else {
              console.error("El marcador no tiene un ID de playa asociado.");
              alert("No se pudo obtener el identificador de esta playa.");
          }
        });
      });
    }

}); // Fin DOMContentLoaded
