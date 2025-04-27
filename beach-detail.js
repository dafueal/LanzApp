document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración de Firebase (¡RECUERDA PONER TUS VALORES!) ---
    const firebaseConfig = {
        apiKey: "TU_API_KEY",
        authDomain: "TU_PROJECT_ID.firebaseapp.com",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_PROJECT_ID.appspot.com",
        messagingSenderId: "TU_SENDER_ID",
        appId: "TU_APP_ID"
    };

    // --- Inicializar Firebase ---
    try { // Añadir try-catch para la inicialización
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const NOTES_COLLECTION = 'userBeachNotes';
         console.log("Firebase inicializado correctamente.");
    } catch (e) {
        console.error("Error inicializando Firebase:", e);
        showError("No se pudo conectar con el servicio de notas (Firebase).");
        // Deshabilitar toda la funcionalidad de notas si Firebase falla
         disableNotesCompletely();
        return; // Detener ejecución si Firebase no inicializa
    }


    // --- Elementos de la página ---
    const beachContentDiv = document.getElementById('beach-content');
    const beachNameEl = document.getElementById('beach-detail-name');
    const beachPhotoEl = document.getElementById('beach-detail-photo');
    // ... (otros elementos de detalles) ...
    const errorPlaceholder = document.getElementById('error-placeholder');
    const currentUserIdSpan = document.getElementById('current-user-id'); // Span para mostrar ID
    const notesSectionWrapper = document.getElementById('notes-section-wrapper');
    const notesContentDiv = document.getElementById('notes-content'); // Contenedor real de notas
    const userNotesTextarea = document.getElementById('user-notes');
    const saveNotesButton = document.getElementById('save-notes-button');
    const notesStatusSpan = document.getElementById('notes-status');
    const notesDisabledMessage = document.getElementById('notes-disabled-message');

    // --- Variables Globales ---
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');
    let currentUserId = null; // Se leerá de sessionStorage
    let beachData = null;
    let currentNoteDocId = null;


    // --- Inicialización ---
    if (!beachId) {
        showError("No se especificó un ID de playa en la URL.");
        return;
    }

    // Obtener User ID directamente de sessionStorage
    currentUserId = sessionStorage.getItem('beachExplorerUserId');

    if (currentUserId) {
        currentUserIdSpan.textContent = currentUserId; // Mostrar ID en el título de notas
        notesDisabledMessage.classList.add('hidden');
        notesContentDiv.classList.remove('hidden');
        userNotesTextarea.disabled = false;
        saveNotesButton.disabled = false;
        loadBeachDetailsAndNotes(); // Cargar todo (playa + notas)
    } else {
        // No hay User ID en la sesión
        currentUserIdSpan.textContent = "Usuario no identificado";
        notesDisabledMessage.classList.remove('hidden'); // Mostrar mensaje para ir al mapa
        notesContentDiv.classList.add('hidden'); // Ocultar textarea y botón
        userNotesTextarea.disabled = true;
        saveNotesButton.disabled = true;
        loadBeachDetailsOnly(); // Cargar solo info de la playa
    }


    // --- Event Listener (Solo para Guardar Notas) ---
    saveNotesButton.addEventListener('click', () => {
        // La comprobación de currentUserId ya se hizo al habilitar el botón
        saveNotesToFirestore();
    });


    // --- Funciones de Carga de Datos (La lógica interna no cambia) ---
     function loadBeachDetailsOnly() { /* ... */
         fetch('beaches.json')
            .then(response => { /* ... */ })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
                if (beachData) {
                    displayBeachDetails(beachData);
                    // NO cargamos notas aquí
                } else { /* ... */ }
            })
            .catch(handleFetchError);
     }
     function loadBeachDetailsAndNotes() { /* ... */
         fetch('beaches.json')
            .then(response => { /* ... */ })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
                if (beachData) {
                    displayBeachDetails(beachData);
                    // Ahora sí llamamos a cargar notas porque sabemos que hay userId
                    showNotesSection(); // Asegurarse que el wrapper es visible
                    fetchNotesFromFirestore();
                } else { /* ... */ }
            })
            .catch(handleFetchError);
     }
     function displayBeachDetails(beach) { /* ...código igual que antes... */
        // ... rellenar nombre, foto, desc, características ...
        beachContentDiv.classList.remove('hidden'); // Mostrar contenido principal
        errorPlaceholder.classList.add('hidden');
    }
    function showNotesSection() {
         notesSectionWrapper.classList.remove('hidden');
         // La visibilidad del contenido interno (textarea/botón vs mensaje)
         // se controla basado en si hay currentUserId o no.
    }


    // --- Funciones de Notas con Firestore (La lógica interna no cambia mucho) ---
    async function fetchNotesFromFirestore() {
        if (!currentUserId || !beachId || typeof db === 'undefined') return; // Añadida comprobación db

        // ... (resto del código de fetchNotesFromFirestore igual que antes)
        notesStatusSpan.textContent = 'Cargando notas desde Firebase...';
        notesStatusSpan.style.color = 'orange';
        userNotesTextarea.disabled = true;
        currentNoteDocId = null;

        try {
            const querySnapshot = await db.collection(NOTES_COLLECTION)
                .where("userId", "==", currentUserId)
                .where("beachId", "==", beachId)
                .limit(1)
                .get();
            // ... (manejo de querySnapshot.empty y doc.data() igual)
             if (querySnapshot.empty) {
                userNotesTextarea.value = '';
                notesStatusSpan.textContent = 'No hay notas guardadas en Firebase.';
                setTimeout(() => { notesStatusSpan.textContent = ''; }, 3000);
            } else {
                const doc = querySnapshot.docs[0];
                currentNoteDocId = doc.id;
                userNotesTextarea.value = doc.data().notesText || '';
                notesStatusSpan.textContent = 'Notas cargadas desde Firebase.';
                setTimeout(() => { notesStatusSpan.textContent = ''; }, 2000);
            }
        } catch (error) { /* ... manejo de error igual ... */
             console.error('Error al obtener notas de Firestore:', error);
            notesStatusSpan.textContent = 'Error al cargar notas.';
            notesStatusSpan.style.color = 'red';
            userNotesTextarea.value = 'Error al cargar las notas.';
        } finally {
            userNotesTextarea.disabled = false;
        }
    }

    async function saveNotesToFirestore() {
        if (!currentUserId || !beachId || typeof db === 'undefined') return; // Añadida comprobación db

        // ... (resto del código de saveNotesToFirestore igual que antes)
         const notesToSave = userNotesTextarea.value;
        saveNotesButton.disabled = true;
        notesStatusSpan.textContent = 'Guardando notas en Firebase...';
        notesStatusSpan.style.color = 'orange';

        const noteData = { /* ... */ }; // userId, beachId, notesText, lastUpdated

        try {
            if (currentNoteDocId) {
                // ... (update)
                 const docRef = db.collection(NOTES_COLLECTION).doc(currentNoteDocId);
                await docRef.update(noteData);
                notesStatusSpan.textContent = '¡Notas actualizadas en Firebase!';
            } else {
                // ... (add)
                 const docRef = await db.collection(NOTES_COLLECTION).add(noteData);
                currentNoteDocId = docRef.id;
                notesStatusSpan.textContent = '¡Notas guardadas en Firebase!';
            }
            // ... (manejo de éxito igual)
        } catch (error) { /* ... manejo de error igual ... */
             console.error('Error al guardar notas en Firestore:', error);
            notesStatusSpan.textContent = 'Error al guardar notas.';
            notesStatusSpan.style.color = 'red';
        } finally {
             saveNotesButton.disabled = false;
        }
    }

    // --- Funciones de Error ---
     function handleFetchError(error) { /* ... */ }
     function showError(message) { /* ... */
         // ... (ocultar beachContent, mostrar errorPlaceholder)
         notesSectionWrapper.classList.add('hidden'); // Ocultar también notas en error general
     }
     // Nueva función para deshabilitar notas si falla Firebase
     function disableNotesCompletely() {
         notesSectionWrapper.classList.remove('hidden'); // Mostrar el wrapper
         notesContentDiv.classList.add('hidden');      // Ocultar contenido
         notesDisabledMessage.textContent = "El servicio de notas no está disponible.";
         notesDisabledMessage.classList.remove('hidden'); // Mostrar mensaje de error
     }

}); // Fin DOMContentLoaded
