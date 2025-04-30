document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] DOM Cargado. Iniciando script del mapa...");

    // --- Elementos de ID de Usuario ---
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    let currentUserId = null;

    // --- Inicialización del Mapa (con try-catch detallado) ---
    let map;
    const lanzaroteCenter = [29.0469, -13.589];
    console.log("[DEBUG] Intentando inicializar mapa en #map...");
    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            throw new Error("El contenedor del mapa con id='map' no fue encontrado en el HTML.");
        }
        console.log("[DEBUG] Contenedor #map encontrado.");

        if (typeof L === 'undefined' || !L || !L.map) {
            throw new Error("La librería Leaflet (L) no parece estar cargada correctamente.");
        }
        console.log("[DEBUG] Objeto Leaflet (L) detectado.");

        map = L.map('map').setView(lanzaroteCenter, 10);
        console.log("[DEBUG] Objeto Mapa Leaflet creado:", map);

        console.log("[DEBUG] Intentando añadir capa de teselas...");
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        console.log("[DEBUG] Capa de teselas añadida.");

    } catch (e) {
         console.error("¡ERROR FATAL durante la inicialización básica del mapa!", e);
         const mapDiv = document.getElementById('map');
         if (mapDiv) {
            mapDiv.innerHTML = `<p class="error-message" style="color: purple; text-align: center; padding: 20px;">ERROR AL INICIALIZAR EL MAPA: ${e.message}</p>`;
         }
         if (userIdStatus) userIdStatus.textContent = "Error al inicializar el mapa.";
         return;
    }

    // --- Lógica de ID de Usuario ---
    function initializeUserId() {
        currentUserId = sessionStorage.getItem('beachExplorerUserId');
        if (currentUserId) {
            userIdInput.value = currentUserId;
            userIdStatus.textContent = `Identificador activo: ${currentUserId}`;
             console.log(`[DEBUG] ID de usuario recuperado de sessionStorage: ${currentUserId}`);
        } else {
             userIdStatus.textContent = `Introduce un identificador para guardar notas en las páginas de playas.`;
             console.log("[DEBUG] No se encontró ID de usuario en sessionStorage.");
        }
    }

    if (confirmUserIdButton && userIdInput && userIdStatus) {
        confirmUserIdButton.addEventListener('click', () => { /* ...código igual... */ });
         initializeUserId();
    } else {
        console.warn("[DEBUG] No se encontraron todos los elementos para la sección de ID de usuario.");
    }


    // --- FETCH HA SIDO COMPLETAMENTE ELIMINADO ---
    console.log("[DEBUG] El bloque Fetch está deshabilitado en esta versión.");
    /*
    fetch('test.txt')
      .then(response => { ... })
      .then(textData => { ... })
      .catch(error => { ... });
    */

    // --- La función addBeachMarkers todavía existe pero NO se llamará ---
    function addBeachMarkers(beaches) {
        console.warn("[DEBUG] addBeachMarkers NO debería llamarse en esta versión sin fetch.");
        // ... (resto de la función)
    }

    console.log("[DEBUG] Script del mapa terminado de cargar.");

}); // Fin DOMContentLoaded
