document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración de Firebase (¡REEMPLAZA CON TUS VALORES!) ---
    // Obtén esto de la consola de Firebase al añadir una app web a tu proyecto
    const firebaseConfig = {
      apiKey: "AIzaSyAvtAh8dWsqLXLwtohdHJT4bm2fkH73Tg4",
      authDomain: "lanzapp-10b86.firebaseapp.com",
      projectId: "lanzapp-10b86",
      storageBucket: "lanzapp-10b86.firebasestorage.app",
      messagingSenderId: "977850801417",
      appId: "1:977850801417:web:9c086bc6f85a6e66f447d8"
    };

    // --- Inicializar Firebase ---
    // Usaremos la API compatibilidad (v8) porque es un poco más sencilla para empezar
    // con Firestore que la API modular (v9+), aunque ambas funcionan.
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore(); // Obtener instancia de Firestore

    // --- Elementos de la página (sin cambios) ---
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
    const userIdSection = document.getElementById('user-id-section');
    const userIdInput = document.getElementById('user-id-input');
    const confirmUserIdButton = document.getElementById('confirm-user-id-button');
    const userIdStatus = document.getElementById('user-id-status');
    const currentUserIdSpan = document.getElementById('current-user-id');
    const notesSectionWrapper = document.getElementById('notes-section-wrapper');
    const userNotesTextarea = document.getElementById('user-notes');
    const saveNotesButton = document.getElementById('save-notes-button');
    const notesStatusSpan = document.getElementById('notes-status');

    // --- Variables Globales ---
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');
    let currentUserId = null;
    let beachData = null;
    let currentNoteDocId = null; // Guardará el ID del documento de nota existente

    // --- Nombre de la colección en Firestore ---
    const NOTES_COLLECTION = 'userBeachNotes';

    // --- Inicialización ---
    if (!beachId) {
        showError("No se especificó un ID de playa en la URL.");
        userIdSection.classList.add('hidden');
        return;
    }
    currentUserId = sessionStorage.getItem('beachExplorerUserId');
    if (currentUserId) {
        userIdInput.value = currentUserId;
        userIdStatus.textContent = `Usando ID: ${currentUserId}`;
        currentUserIdSpan.textContent = currentUserId;
        loadBeachDetailsAndNotes();
    } else {
         userIdStatus.textContent = `Introduce un identificador para ver/guardar notas.`;
         loadBeachDetailsOnly();
    }

    // --- Event Listeners (sin cambios en la lógica, solo llaman a las nuevas funciones) ---
    confirmUserIdButton.addEventListener('click', () => {
        const inputId = userIdInput.value.trim();
        if (inputId) {
            currentUserId = inputId;
            sessionStorage.setItem('beachExplorerUserId', currentUserId);
            userIdStatus.textContent = `ID confirmado: ${currentUserId}`;
            currentUserIdSpan.textContent = currentUserId;
            if (beachData) {
                showNotesSection();
                fetchNotesFromFirestore(); // <--- LLAMA A LA NUEVA FUNCIÓN
            } else {
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
        saveNotesToFirestore(); // <--- LLAMA A LA NUEVA FUNCIÓN
    });

    // --- Funciones de Carga de Datos (sin cambios) ---
    function loadBeachDetailsOnly() { /* ...código igual que antes... */
         fetch('beaches.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP al cargar beaches.json! estado: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
                if (beachData) {
                    displayBeachDetails(beachData);
                } else {
                    showError(`No se encontró ninguna playa con el ID "${beachId}".`);
                }
            })
            .catch(handleFetchError);
    }
    function loadBeachDetailsAndNotes() { /* ...código igual que antes... */
         fetch('beaches.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP al cargar beaches.json! estado: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
                if (beachData) {
                    displayBeachDetails(beachData);
                    if (currentUserId) {
                        showNotesSection();
                        fetchNotesFromFirestore(); // <--- LLAMA A LA NUEVA FUNCIÓN
                    }
                } else {
                    showError(`No se encontró ninguna playa con el ID "${beachId}".`);
                }
            })
            .catch(handleFetchError);
    }
    function displayBeachDetails(beach) { /* ...código igual que antes... */
        document.title = `Detalles: ${beach.name || 'Playa'}`;
        beachNameEl.textContent = beach.name || 'Nombre no disponible';
        if (beach.photoUrl) {
            beachPhotoEl.src = beach.photoUrl;
            beachPhotoEl.alt = `Foto de ${beach.name || 'la playa'}`;
            beachPhotoEl.style.removeProperty('display');
        } else {
            beachPhotoEl.style.display = 'none';
        }
        beachDescEl.textContent = beach.description || '';
        const characteristics = beach.characteristics || {};
        beachSandEl.innerHTML = characteristics.sandType ? `<strong>Arena:</strong> ${characteristics.sandType}` : '';
        beachConcEl.innerHTML = characteristics.concurrency ? `<strong>Concurrencia:</strong> ${characteristics.concurrency}` : '';
        beachWaterEl.innerHTML = characteristics.waterQuality ? `<strong>Calidad del Agua:</strong> ${characteristics.waterQuality}` : '';
        beachAmenitiesEl.innerHTML = characteristics.amenities ? `<strong>Servicios:</strong> ${characteristics.amenities}` : '';
        beachAccessibilityEl.innerHTML = characteristics.accessibility ? `<strong>Accesibilidad:</strong> ${characteristics.accessibility}` : '';
        if (Object.keys(characteristics).length === 0) {
             beachCharacteristicsDiv.style.display = 'none';
        }
        beachContentDiv.classList.remove('hidden');
        errorPlaceholder.classList.add('hidden');
    }
    function showNotesSection() { /* ...código igual que antes... */
         notesSectionWrapper.classList.remove('hidden');
    }


    // --- NUEVAS Funciones de Notas con Firestore ---

    /**
     * Obtiene las notas desde Firestore para el usuario y playa actuales.
     */
    async function fetchNotesFromFirestore() {
        if (!currentUserId || !beachId) return;

        notesStatusSpan.textContent = 'Cargando notas desde Firebase...';
        notesStatusSpan.style.color = 'orange';
        userNotesTextarea.disabled = true;
        currentNoteDocId = null; // Reseteamos el ID del documento actual

        try {
            // Consultar Firestore
            const querySnapshot = await db.collection(NOTES_COLLECTION)
                .where("userId", "==", currentUserId)
                .where("beachId", "==", beachId)
                .limit(1) // Solo esperamos un documento por usuario/playa
                .get();

            if (querySnapshot.empty) {
                // No existen notas previas
                userNotesTextarea.value = '';
                notesStatusSpan.textContent = 'No hay notas guardadas en Firebase para esta playa.';
                setTimeout(() => { notesStatusSpan.textContent = ''; }, 3000);
            } else {
                // Notas encontradas
                const doc = querySnapshot.docs[0];
                currentNoteDocId = doc.id; // Guardamos el ID del documento para actualizarlo luego
                userNotesTextarea.value = doc.data().notesText || '';
                notesStatusSpan.textContent = 'Notas cargadas desde Firebase.';
                setTimeout(() => { notesStatusSpan.textContent = ''; }, 2000);
            }

        } catch (error) {
            console.error('Error al obtener notas de Firestore:', error);
            notesStatusSpan.textContent = 'Error al cargar notas.';
            notesStatusSpan.style.color = 'red';
            // Considera mostrar un mensaje más detallado o dejar el textarea vacío
            userNotesTextarea.value = 'Error al cargar las notas.';
        } finally {
            userNotesTextarea.disabled = false; // Rehabilitar siempre
        }
    }

    /**
     * Guarda (crea o actualiza) las notas en Firestore.
     */
    async function saveNotesToFirestore() {
        if (!currentUserId || !beachId) return;

        const notesToSave = userNotesTextarea.value;
        saveNotesButton.disabled = true;
        notesStatusSpan.textContent = 'Guardando notas en Firebase...';
        notesStatusSpan.style.color = 'orange';

        const noteData = {
            userId: currentUserId,
            beachId: beachId,
            notesText: notesToSave,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp() // Marca de tiempo del servidor
        };

        try {
            if (currentNoteDocId) {
                // Si ya teníamos un ID de documento, actualizamos (update)
                const docRef = db.collection(NOTES_COLLECTION).doc(currentNoteDocId);
                await docRef.update(noteData);
                notesStatusSpan.textContent = '¡Notas actualizadas en Firebase!';
            } else {
                // Si no había ID, creamos un nuevo documento (add)
                const docRef = await db.collection(NOTES_COLLECTION).add(noteData);
                currentNoteDocId = docRef.id; // Guardamos el nuevo ID por si se vuelve a guardar
                notesStatusSpan.textContent = '¡Notas guardadas en Firebase!';
            }

            notesStatusSpan.style.color = 'green';
            setTimeout(() => { notesStatusSpan.textContent = ''; }, 2500);

        } catch (error) {
            console.error('Error al guardar notas en Firestore:', error);
            notesStatusSpan.textContent = 'Error al guardar notas.';
            notesStatusSpan.style.color = 'red';
        } finally {
            saveNotesButton.disabled = false; // Rehabilitar siempre
        }
    }

    // --- Funciones de Error (sin cambios) ---
     function handleFetchError(error) { /* ...código igual que antes... */
        console.error('Error al cargar datos:', error);
        showError("Ocurrió un error al cargar la información. Revisa la conexión o inténtalo más tarde.");
     }
    function showError(message) { /* ...código igual que antes... */
        beachContentDiv.classList.add('hidden');
        errorPlaceholder.textContent = message;
        errorPlaceholder.classList.remove('hidden');
        document.title = "Error";
        userIdSection.classList.add('hidden');
        notesSectionWrapper.classList.add('hidden');
    }

}); // Fin DOMContentLoaded
