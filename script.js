document.addEventListener('DOMContentLoaded', () => {
    // --- Inicialización del Mapa ---
    const lanzaroteCenter = [29.0469, -13.589];
    const map = L.map('map').setView(lanzaroteCenter, 10);

    // Añadir Capa de Teselas (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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
          mapDiv.innerHTML = `<p class="error-message">No se pudieron cargar los datos de las playas. Por favor, revisa la consola para ver errores o asegúrate de que 'beaches.json' esté accesible.</p>`;
      });

    // --- Funciones ---

    /**
     * Añade marcadores al mapa para cada playa.
     * Al hacer clic, redirige a la página de detalles.
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
        marker.beachInfo = beach; // Guardamos la info por si acaso, aunque solo usemos el id
        marker.bindTooltip(beach.name);

        marker.on('click', function() {
          // Redirigir a la página de detalles pasando el ID como parámetro
          const beachId = this.beachInfo.id;
          if (beachId) {
              window.location.href = `beach.html?id=${encodeURIComponent(beachId)}`;
          } else {
              console.error("El marcador no tiene un ID de playa asociado.");
              alert("No se pudo obtener el identificador de esta playa.");
          }
        });
      });
    }

    // LA FUNCIÓN displayBeachInfo Y LOS LISTENERS DEL PANEL HAN SIDO ELIMINADOS

}); // Fin DOMContentLoaded
