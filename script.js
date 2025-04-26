document.addEventListener('DOMContentLoaded', () => {
    // --- Inicialización del Mapa ---
    const lanzaroteCenter = [29.0469, -13.589];
    const map = L.map('map').setView(lanzaroteCenter, 10);

    // Añadir Capa de Teselas (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- Elementos del Panel de Información ---
    const infoPanel = document.getElementById('beach-info-panel');
    const beachNameEl = document.getElementById('beach-name');
    const beachPhotoEl = document.getElementById('beach-photo');
    const beachDescEl = document.getElementById('beach-description');
    const beachSandEl = document.getElementById('beach-sand');
    const beachConcEl = document.getElementById('beach-concurrency');
    const beachWaterEl = document.getElementById('beach-water');
    const beachAmenitiesEl = document.getElementById('beach-amenities');
    const beachAccessibilityEl = document.getElementById('beach-accessibility');
    const closeButton = document.getElementById('close-info-panel');

    // --- Cargar Datos de Playas y Añadir Marcadores ---
    fetch('beaches.json')
      .then(response => {
          if (!response.ok) {
              throw new Error(`Error HTTP! estado: ${response.status}`);
          }
          return response.json();
      })
      .then(beachData => {
          addBeachMarkers(beachData);
      })
      .catch(error => {
          console.error('Error al cargar los datos de las playas:', error);
          const mapDiv = document.getElementById('map');
          // Mensaje de error para el usuario
          mapDiv.innerHTML = `<p style="text-align:center; padding: 20px; color: red;">No se pudieron cargar los datos de las playas. Por favor, revisa la consola para ver errores o asegúrate de que 'beaches.json' esté accesible.</p>`;
      });

    // --- Funciones ---

    /**
     * Añade marcadores al mapa para cada playa.
     * @param {Array} beaches - Array de objetos de playa del JSON.
     */
    function addBeachMarkers(beaches) {
      if (!beaches || beaches.length === 0) {
        console.warn("No se proporcionaron datos de playas para addBeachMarkers");
        return;
      }

      beaches.forEach(beach => {
        if (!beach.coordinates || beach.coordinates.length !== 2) {
            console.warn(`Omitiendo playa "${beach.name}" por coordenadas inválidas.`);
            return;
        }

        const marker = L.marker(beach.coordinates).addTo(map);
        marker.beachInfo = beach;
        marker.bindTooltip(beach.name);

        marker.on('click', function() {
          displayBeachInfo(this.beachInfo);
          map.setView(this.getLatLng(), map.getZoom());
        });
      });
    }

    /**
     * Rellena y muestra el panel de información para una playa seleccionada.
     * @param {Object} beach - El objeto de datos de la playa.
     */
    function displayBeachInfo(beach) {
        if (!beach) return;

        beachNameEl.textContent = beach.name || 'Nombre no disponible';
        beachPhotoEl.src = beach.photoUrl || 'images/placeholder.jpg';
        beachPhotoEl.alt = `Foto de ${beach.name || 'la playa'}`;
        beachDescEl.textContent = beach.description || 'No hay descripción disponible.';

        // Características
        const characteristics = beach.characteristics || {};
        beachSandEl.innerHTML = `<strong>Arena:</strong> ${characteristics.sandType || 'N/D'}`;
        beachConcEl.innerHTML = `<strong>Concurrencia:</strong> ${characteristics.concurrency || 'N/D'}`;
        beachWaterEl.innerHTML = `<strong>Calidad del Agua:</strong> ${characteristics.waterQuality || 'N/D'}`;
        beachAmenitiesEl.innerHTML = `<strong>Servicios:</strong> ${characteristics.amenities || 'N/D'}`;
        beachAccessibilityEl.innerHTML = `<strong>Accesibilidad:</strong> ${characteristics.accessibility || 'N/D'}`;

        infoPanel.style.display = 'block';
    }

    /**
     * Oculta el panel de información.
     */
    function hideInfoPanel() {
        infoPanel.style.display = 'none';
    }

    // --- Event Listeners ---
    closeButton.addEventListener('click', hideInfoPanel);
    map.on('click', hideInfoPanel);
    infoPanel.addEventListener('click', (event) => {
        event.stopPropagation();
    });

}); // Fin DOMContentLoaded