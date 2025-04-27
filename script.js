document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] DOM Cargado. Iniciando script del mapa...");

    // --- Elementos de ID de Usuario ---
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    let currentUserId = null;

    // --- Inicialización del Mapa (con try-catch detallado) ---
    let map; // Declarar fuera para acceso global en este scope
    const lanzaroteCenter = [29.0469, -13.589];
    console.log("[DEBUG] Intentando inicializar mapa en #map...");
    try {
        // Verificar si el div existe ANTES de inicializar
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            throw new Error("El contenedor del mapa con id='map' no fue encontrado en el HTML.");
        }
        console.log("[DEBUG] Contenedor #map encontrado.");

        // Verificar si Leaflet (L) está cargado
        if (typeof L === 'undefined' || !L || !L.map) {
            throw new Error("La librería Leaflet (L) no parece estar cargada correctamente.");
        }
        console.log("[DEBUG] Objeto Leaflet (L) detectado.");

        map = L.map('map').setView(lanzaroteCenter, 10);
        console.log("[DEBUG] Objeto Mapa Leaflet creado:", map);

        // Añadir Capa de Teselas (OpenStreetMap)
        console.log("[DEBUG] Intentando añadir capa de teselas...");
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        console.log("[DEBUG] Capa de teselas añadida.");

    } catch (e) {
         console.error("¡ERROR FATAL durante la inicialización básica del mapa!", e);
         // Escribir error en el div del mapa si falla la inicialización
         const mapDiv = document.getElementById('map');
         if (mapDiv) {
            mapDiv.innerHTML = `<p class="error-message" style="color: purple; text-align: center; padding: 20px;">ERROR AL INICIALIZAR EL MAPA: ${e.message}</p>`;
         }
         // También mostrar en sección ID si existe
         if (userIdStatus) userIdStatus.textContent = "Error al inicializar el mapa.";
         return; // Detener ejecución si el mapa no se puede crear
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
        confirmUserIdButton.addEventListener('click', () => {
            const inputId = userIdInput.value.trim();
            if (inputId) {
                currentUserId = inputId;
                sessionStorage.setItem('beachExplorerUserId', currentUserId);
                userIdStatus.textContent = `ID confirmado: ${currentUserId}`;
                console.log(`[DEBUG] ID de usuario confirmado y guardado: ${currentUserId}`);
                // alert(`Identificador "${currentUserId}" guardado para esta sesión.`);
            } else {
                alert("Por favor, introduce un identificador válido.");
                 userIdStatus.textContent = `Introduce un identificador para guardar notas.`;
                sessionStorage.removeItem('beachExplorerUserId');
                currentUserId = null;
                 console.log("[DEBUG] ID de usuario borrado de sessionStorage.");
            }
        });
         // Inicializar estado al cargar
         initializeUserId();
    } else {
        console.warn("[DEBUG] No se encontraron todos los elementos para la sección de ID de usuario.");
    }


    // --- Cargar DATOS DE PRUEBA (test.txt) ---
    console.log("[DEBUG] Intentando fetch de test.txt...");
    fetch('test.txt') // <-- Probando con test.txt
      .then(response => {
          console.log("[DEBUG] Respuesta fetch recibida para test.txt. Estado:", response.status);
          if (!response.ok) {
              // Lanzar error si el estado no es OK (ej. 404)
              throw new Error(`HTTP error! estado: ${response.status} - ${response.statusText}`);
          }
          console.log("[DEBUG] Respuesta OK. Leyendo como texto...");
          return response.text(); // Leer la respuesta como texto plano
      })// ... (Todo el código anterior: DOMContentLoaded, inicialización mapa, user ID, etc.) ...

    // --- Cargar DATOS DE PRUEBA (test.txt) ---
    console.log("[DEBUG] Intentando fetch de test.txt...");
    fetch('test.txt')
      .then(response => {
          console.log("[DEBUG] Respuesta fetch recibida para test.txt. Estado:", response.status);
          if (!response.ok) {
              throw new Error(`HTTP error! estado: ${response.status} - ${response.statusText}`);
          }
          console.log("[DEBUG] Respuesta OK. Leyendo como texto...");
          return response.text();
      })
      .then(textData => {
          // --- SIMPLIFICADO AL MÁXIMO ---
          // Solo registraremos éxito en la consola. NO tocaremos el DOM aquí.
          console.log("****************************************");
          console.log("[DEBUG] ÉXITO CARGANDO test.txt:", textData);
          console.log("[DEBUG] SI VES ESTO, EL FETCH FUNCIONÓ. NO SE TOCARÁ EL MAPA DESDE AQUÍ.");
          console.log("****************************************");
          // --- FIN SIMPLIFICADO ---

          // Código original comentado para esta prueba:
          // console.log("[DEBUG] CONTENIDO DE TEST.TXT:", textData);
          // console.log("[DEBUG] ¡Fetch de test.txt tuvo ÉXITO! El problema era probablemente beaches.json.");
          // const mapDiv = document.getElementById('map');
          // const errorMsgElement = mapDiv.querySelector('.error-message');
          // if (errorMsgElement) {
          //     console.log("[DEBUG] Eliminando mensaje de error previo del div del mapa.");
          //     mapDiv.removeChild(errorMsgElement);
          // }
      })
      .catch(error => {
          // El catch sigue igual para detectar si SÍ hay error en el fetch
          console.error('[DEBUG] ERROR en el bloque .catch del fetch de test.txt:', error);
          const mapDiv = document.getElementById('map');
          if (mapDiv) {
               mapDiv.innerHTML = `<p class="error-message" style="color: orange; text-align: center; padding: 20px;">ERROR DESDE EL CATCH DE TEST.TXT: ${error.message}</p>`;
          }
          if(userIdStatus) userIdStatus.textContent = "Error al cargar archivo de prueba.";
      });

    // ... (Función addBeachMarkers sigue existiendo pero no se llama) ...

    console.log("[DEBUG] Script del mapa terminado de cargar (excepto operaciones asíncronas).");

}); // Fin DOMContentLoaded
