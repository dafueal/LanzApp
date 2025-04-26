document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos de la página de detalles ---
    const beachContentDiv = document.getElementById('beach-content');
    const beachNameEl = document.getElementById('beach-detail-name');
    const beachPhotoEl = document.getElementById('beach-detail-photo');
    const beachDescEl = document.getElementById('beach-detail-description');
    const beachCharacteristicsDiv = document.getElementById('beach-detail-characteristics');
    const beachSandEl = document.getElementById('beach-detail-sand');
    const beachConcEl = document.getElementById('beach-detail-concurrency');
    const beachWaterEl = document.getElementById('beach-detail-water');
    const beachAmenitiesEl = document.getElementById('beach-detail-amenities');
    const beachAccessibilityEl = document.getElementById('beach-detail-accessibility');
    const errorPlaceholder = document.getElementById('error-placeholder');

    // --- Obtener el ID de la playa desde la URL ---
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');

    if (!beachId) {
        showError("No se especificó un ID de playa en la URL.");
        return;
    }

    // --- Cargar los datos de TODAS las playas ---
    fetch('beaches.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP al cargar beaches.json! estado: ${response.status}`);
            }
            return response.json();
        })
        .then(allBeaches => {
            // --- Encontrar la playa específica por su ID ---
            const beach = allBeaches.find(b => b.id === beachId);

            if (beach) {
                // --- Rellenar la página con los datos de la playa encontrada ---
                document.title = `Detalles: ${beach.name || 'Playa'}`; // Actualizar título de la página
                beachNameEl.textContent = beach.name || 'Nombre no disponible';

                if (beach.photoUrl) {
                    beachPhotoEl.src = beach.photoUrl;
                    beachPhotoEl.alt = `Foto de ${beach.name || 'la playa'}`;
                    beachPhotoEl.style.display = 'block'; // Mostrar imagen
                } else {
                     beachPhotoEl.style.display = 'none'; // Ocultar si no hay foto
                }

                beachDescEl.textContent = beach.description || '';

                // Rellenar características (si existen)
                const characteristics = beach.characteristics || {};
                beachSandEl.innerHTML = characteristics.sandType ? `<strong>Arena:</strong> ${characteristics.sandType}` : '';
                beachConcEl.innerHTML = characteristics.concurrency ? `<strong>Concurrencia:</strong> ${characteristics.concurrency}` : '';
                beachWaterEl.innerHTML = characteristics.waterQuality ? `<strong>Calidad del Agua:</strong> ${characteristics.waterQuality}` : '';
                beachAmenitiesEl.innerHTML = characteristics.amenities ? `<strong>Servicios:</strong> ${characteristics.amenities}` : '';
                beachAccessibilityEl.innerHTML = characteristics.accessibility ? `<strong>Accesibilidad:</strong> ${characteristics.accessibility}` : '';

                // Ocultar el div de características si no hay ninguna
                if (Object.keys(characteristics).length === 0) {
                     beachCharacteristicsDiv.style.display = 'none';
                }

            } else {
                // --- Playa no encontrada ---
                showError(`No se encontró ninguna playa con el ID "${beachId}".`);
            }
        })
        .catch(error => {
            console.error('Error al cargar o procesar datos de la playa:', error);
            showError("Ocurrió un error al cargar la información de la playa.");
        });


    function showError(message) {
        beachContentDiv.style.display = 'none'; // Ocultar contenido normal
        errorPlaceholder.textContent = message;
        errorPlaceholder.style.display = 'block'; // Mostrar mensaje de error
         document.title = "Error - Playa no encontrada";
    }

});
