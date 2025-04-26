document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos de la página ---
    const beachContentDiv = document.getElementById('beach-content');
    const beachNameEl = document.getElementById('beach-detail-name');
    const beachPhotoEl = document.getElementById('beach-detail-photo');
    const beachDescEl = document.getElementById('beach-detail-description');
    const beachCharacteristicsDiv = document.getElementById('beach-detail-characteristics');
    const beachSandEl = document.getElementById('beach-detail-sand');
    // ... (otros elementos de características)
    const errorPlaceholder = document.getElementById('error-placeholder');

    // --- Elementos de ID de Usuario ---
    const userIdSection = document.getElementById('user-id-section');
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    const currentUserIdSpan = document.getElementById('current-user-id');

    // --- Elementos de Notas ---
    const notesSectionWrapper = document.getElementById('notes-section-wrapper');
    const userNotesTextarea = document.getElementById('user-notes');
    const saveNotesButton = document.getElementById('save-notes-button');
    const notesStatusSpan = document.getElementById('notes-status');

    // --- Variables Globales ---
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');
    let currentUserId = null; // El ID del usuario activo
    let beachData = null; // Guardará los datos de la playa una vez cargados

    // --- URL Base de tu API Backend (¡DEBES CAMBIAR ESTO!) ---
    const API_BASE_URL = '/api'; // Ejemplo: podría ser 'https://tu-backend.com/api'

    // --- Inicialización ---

    if (!beachId) {
        showError("No se especificó un ID de playa en la URL.");
        userIdSection.classList.add('hidden'); // Ocultar sección de user ID si no hay playa
        return;
    }

    // Intentar recuperar userId de sessionStorage al cargar
    currentUserId = sessionStorage.getItem('beachExplorerUserId');
    if (currentUserId) {
        userIdInput.value = currentUserId;
        userIdStatus.textContent = `Usando ID: ${currentUserId}`;
        currentUserIdSpan.textContent = currentUserId; // Mostrar en sección notas
        loadBeachDetailsAndNotes(); // Cargar detalles y notas si ya tenemos ID
    } else {
         userIdStatus.textContent = `Introduce un identificador para ver/guardar notas.`;
         // Solo cargar detalles de la playa, no notas aún
         loadBeachDetailsOnly();
    }


    // --- Event Listeners ---

    confirmUserIdButton.addEventListener('click', () => {
        const inputId = userIdInput.value.trim();
        if (inputId) {
            currentUserId = inputId;
            sessionStorage.setItem('beachExplorerUserId', currentUserId); // Guardar en session storage
            userIdStatus.textContent = `ID confirmado: ${currentUserId}`;
            currentUserIdSpan.textContent = currentUserId;
            // Si los detalles de la playa ya se cargaron, ahora carga/refresca las notas
            if (beachData) {
                showNotesSection(); // Asegura que la sección de notas sea visible
                fetchNotesFromAPI(); // Llama a la API para obtener notas
            } else {
                // Si aún no se cargaron los detalles (ej. error previo), intentar cargar todo
                loadBeachDetailsAndNotes();
            }
        } else {
            alert("Por favor, introduce un identificador.");
        }
    });

    saveNotesButton.addEventListener('click', () => {
        if (!currentUserId) {
            alert("Debes confirmar un identificador de usuario para guardar notas.");
            return;
        }
        saveNotesToAPI(); // Llama a la API para guardar
    });


    // --- Funciones ---

    function loadBeachDetailsOnly() {
        fetch('beaches.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP al cargar beaches.json! estado: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
                if (beachData) {
                    displayBeachDetails(beachData);
                    // NO mostrar sección de notas aún, porque no hay userId confirmado
                } else {
                    showError(`No se encontró ninguna playa con el ID "${beachId}".`);
                }
            })
            .catch(handleFetchError);
    }


    function loadBeachDetailsAndNotes() {
        fetch('beaches.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP al cargar beaches.json! estado: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
                if (beachData) {
                    displayBeachDetails(beachData);
                    // Si también tenemos un userId, mostramos sección y cargamos notas
                    if (currentUserId) {
                        showNotesSection();
                        fetchNotesFromAPI();
                    }
                } else {
                    showError(`No se encontró ninguna playa con el ID "${beachId}".`);
                }
            })
            .catch(handleFetchError);
    }

    function displayBeachDetails(beach) {
        document.title = `Detalles: ${beach.name || 'Playa'}`;
        beachNameEl.textContent = beach.name || 'Nombre no disponible';
        if (beach.photoUrl) {
            beachPhotoEl.src = beach.photoUrl;
            beachPhotoEl.alt = `Foto de ${beach.name || 'la playa'}`;
            beachPhotoEl.style.removeProperty('display'); // Mostrar imagen
        } else {
            beachPhotoEl.style.display = 'none'; // Ocultar si no hay foto
        }
        beachDescEl.textContent = beach.description || '';
        const characteristics = beach.characteristics || {};
        // ... (rellenar características como antes) ...
        beachSandEl.innerHTML = characteristics.sandType ? `<strong>Arena:</strong> ${characteristics.sandType}` : '';
        // ... resto características

        beachContentDiv.classList.remove('hidden'); // Mostrar contenido principal de la playa
        errorPlaceholder.classList.add('hidden'); // Ocultar errores previos
    }

    function showNotesSection() {
         notesSectionWrapper.classList.remove('hidden');
    }

    /**
     * Obtiene las notas desde la API del Backend.
     */
    async function fetchNotesFromAPI() {
        if (!currentUserId || !beachId) return; // Necesitamos ambos IDs

        notesStatusSpan.textContent = 'Cargando notas...';
        notesStatusSpan.style.color = 'orange';
        userNotesTextarea.disabled = true; // Deshabilitar mientras carga

        try {
            // ¡IMPORTANTE! Esta es la llamada a tu backend
            const response = await fetch(`${API_BASE_URL}/notes?userId=${encodeURIComponent(currentUserId)}&beachId=${encodeURIComponent(beachId)}`);

            if (response.ok) {
                const data = await response.json();
                userNotesTextarea.value = data.notes || ''; // Asume que la API devuelve { notes: "..." } o {}
                notesStatusSpan.textContent = 'Notas cargadas.';
                setTimeout(() => { notesStatusSpan.textContent = ''; }, 2000);
            } else if (response.status === 404) {
                // 404 significa que no hay notas guardadas para esta combinación
                userNotesTextarea.value = '';
                notesStatusSpan.textContent = 'No hay notas guardadas para esta playa.';
                 setTimeout(() => { notesStatusSpan.textContent = ''; }, 3000);
            } else {
                // Otro error del servidor
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error al obtener notas de la API:', error);
            notesStatusSpan.textContent = 'Error al cargar notas.';
            notesStatusSpan.style.color = 'red';
            // Podrías querer dejar el textarea vacío o mostrar el error de alguna forma
        } finally {
             userNotesTextarea.disabled = false; // Rehabilitar siempre
        }
    }

    /**
     * Guarda las notas en la API del Backend.
     */
    async function saveNotesToAPI() {
        if (!currentUserId || !beachId) return;

        const notesToSave = userNotesTextarea.value;
        saveNotesButton.disabled = true;
        notesStatusSpan.textContent = 'Guardando notas...';
        notesStatusSpan.style.color = 'orange';

        try {
            // ¡IMPORTANTE! Esta es la llamada POST a tu backend
            const response = await fetch(`${API_BASE_URL}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    beachId: beachId,
                    notes: notesToSave
                }),
            });

            if (response.ok) {
                notesStatusSpan.textContent = '¡Notas guardadas en la nube!';
                notesStatusSpan.style.color = 'green';
                setTimeout(() => { notesStatusSpan.textContent = ''; }, 2500);
            } else {
                 const errorData = await response.text(); // Leer cuerpo del error si existe
                 throw new Error(`Error del servidor: ${response.status} ${response.statusText}. ${errorData}`);
            }
        } catch (error) {
            console.error('Error al guardar notas en la API:', error);
            notesStatusSpan.textContent = 'Error al guardar notas.';
            notesStatusSpan.style.color = 'red';
        } finally {
            saveNotesButton.disabled = false; // Rehabilitar siempre
        }
    }

     function handleFetchError(error) {
        console.error('Error al cargar datos:', error);
        showError("Ocurrió un error al cargar la información. Revisa la conexión o inténtalo más tarde.");
     }

    function showError(message) {
        beachContentDiv.classList.add('hidden'); // Ocultar contenido normal
        errorPlaceholder.textContent = message;
        errorPlaceholder.classList.remove('hidden'); // Mostrar mensaje de error
        document.title = "Error";
        // Ocultar o deshabilitar secciones dependientes
        userIdSection.classList.add('hidden');
        notesSectionWrapper.classList.add('hidden');
    }

}); // Fin DOMContentLoaded
