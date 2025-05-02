document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración de Firebase (¡¡REEMPLAZA CON TUS VALORES!!) ---
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyAvtAh8dWsqLXLwtohdHJT4bm2fkH73Tg4",
      authDomain: "lanzapp-10b86.firebaseapp.com",
      projectId: "lanzapp-10b86",
      storageBucket: "lanzapp-10b86.firebasestorage.app",
      messagingSenderId: "977850801417",
      appId: "1:977850801417:web:9c086bc6f85a6e66f447d8"
    };

    // --- Variables Globales y Referencias a Elementos ---
    let db; // Instancia Firestore
    const NOTES_COLLECTION = 'userBeachNotes';
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');
    let currentUserId = null;
    let beachData = null;
    let currentNoteDocId = null;

    // Obtener referencias a TODOS los elementos del DOM necesarios
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
    const currentUserIdSpan = document.getElementById('current-user-id');
    const notesSectionWrapper = document.getElementById('notes-section-wrapper');
    const notesContentDiv = document.getElementById('notes-content');
    const userNotesTextarea = document.getElementById('user-notes');
    const saveNotesButton = document.getElementById('save-notes-button');
    const notesStatusSpan = document.getElementById('notes-status');
    const notesDisabledMessage = document.getElementById('notes-disabled-message');

    // Verificar si se encontraron elementos críticos (opcional pero útil)
    if (!beachContentDiv || !errorPlaceholder) {
        console.error("Error crítico: No se encontraron elementos base del DOM (#beach-content o #error-placeholder).");
        return; // No continuar si falta lo básico
    }


    // --- Inicialización Principal ---
    function initializeApp() {
        console.log("[DEBUG] Iniciando beach-detail.js...");
        if (!beachId) {
            showError("No se especificó un ID de playa en la URL.");
            return;
        }
        console.log(`[DEBUG] Beach ID from URL: ${beachId}`);

        // Inicializar Firebase
        try {
            if (typeof firebase === 'undefined' || !firebase.initializeApp) {
                 throw new Error("SDK de Firebase no cargado correctamente.");
            }
            // Evitar inicializar múltiples veces
            if (!firebase.apps.length) {
                 firebase.initializeApp(firebaseConfig);
                 console.log("[DEBUG] Firebase inicializado.");
            } else {
                 firebase.app(); // Obtener la app por defecto si ya está inicializada
                 console.log("[DEBUG] Firebase ya estaba inicializado.");
            }
            db = firebase.firestore();
            if(!db) throw new Error("Instancia de Firestore (db) no se pudo obtener.");
            console.log("[DEBUG] Instancia Firestore asignada.");
        } catch (e) {
            console.error("[DEBUG] Error inicializando Firebase:", e);
            showError("No se pudo conectar con el servicio de notas (Firebase). Verifica la configuración y las credenciales.");
            disableNotesCompletely("Firebase no disponible.");
            loadBeachDetailsOnly(); // Intentar cargar playa aunque fallen notas
            return;
        }

        // Obtener User ID de sessionStorage
        currentUserId = sessionStorage.getItem('beachExplorerUserId');
        console.log(`[DEBUG] User ID from Session Storage: ${currentUserId}`);

        if (currentUserId) {
            activateNotesSection();
            loadBeachDetailsAndNotes();
        } else {
            deactivateNotesSection();
            loadBeachDetailsOnly();
        }
    }

    // --- Lógica de Activación/Desactivación de Notas ---
    function activateNotesSection() {
        console.log("[DEBUG] Activando sección de notas.");
        if (!currentUserIdSpan || !notesDisabledMessage || !notesContentDiv || !userNotesTextarea || !saveNotesButton || !notesSectionWrapper) {
             console.warn("[DEBUG] Faltan elementos DOM para activar sección de notas.");
             return;
        }
        currentUserIdSpan.textContent = currentUserId;
        notesDisabledMessage.classList.add('hidden');
        notesContentDiv.classList.remove('hidden');
        userNotesTextarea.disabled = false;
        userNotesTextarea.placeholder = "Escribe tus notas aquí...";
        saveNotesButton.disabled = false;
        notesSectionWrapper.classList.remove('hidden');
    }

    function deactivateNotesSection() {
        console.log("[DEBUG] Desactivando sección de notas (no hay userId).");
         if (!currentUserIdSpan || !notesDisabledMessage || !notesContentDiv || !userNotesTextarea || !saveNotesButton || !notesSectionWrapper) {
             console.warn("[DEBUG] Faltan elementos DOM para desactivar sección de notas.");
             return;
         }
         currentUserIdSpan.textContent = "Usuario no identificado";
         notesDisabledMessage.classList.remove('hidden');
         notesContentDiv.classList.add('hidden');
         userNotesTextarea.disabled = true;
         userNotesTextarea.placeholder = "Introduce un ID en la página del mapa para activar las notas...";
         saveNotesButton.disabled = true;
         notesSectionWrapper.classList.remove('hidden'); // Mostrar wrapper para ver mensaje
    }

     function disableNotesCompletely(reason = "El servicio de notas no está disponible.") {
         console.log(`[DEBUG] Deshabilitando notas completamente: ${reason}`);
         if (!notesSectionWrapper || !notesContentDiv || !notesDisabledMessage) {
             console.warn("[DEBUG] Faltan elementos DOM para deshabilitar notas completamente.");
             return;
         };
         notesSectionWrapper.classList.remove('hidden');
         notesContentDiv.classList.add('hidden');
         notesDisabledMessage.textContent = reason;
         notesDisabledMessage.classList.remove('hidden');
         if (currentUserIdSpan) currentUserIdSpan.textContent = "-";
     }


    // --- Carga de Datos de Playa (desde JSON) ---
     function loadBeachDetailsOnly() {
         console.log("[DEBUG] Cargando solo detalles de la playa...");
         fetch('beaches.json') // Usar ruta relativa
            .then(response => {
                console.log("[DEBUG] Respuesta fetch beaches.json (details only):", response.status);
                if (!response.ok) throw new Error(`Error HTTP cargando beaches.json: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                console.log("[DEBUG] Datos JSON cargados (details only). Buscando playa...");
                console.log("[DEBUG] Buscando ID:", beachId, "en", allBeaches);
                beachData = allBeaches.find(b => b.id === beachId);
                console.log("[DEBUG] Playa encontrada (details only):", beachData);
                if (beachData) {
                    displayBeachDetails(beachData);
                } else {
                    // Usar handleFetchError o showError directamente
                    showError(`No se encontró ninguna playa con el ID "${beachId}" en los datos cargados.`);
                }
            })
            .catch(handleFetchError); // Usar el manejador de errores general
     }

     function loadBeachDetailsAndNotes() {
         console.log("[DEBUG] Cargando detalles de playa y preparando para notas...");
         fetch('beaches.json') // Usar ruta relativa
            .then(response => {
                 console.log("[DEBUG] Respuesta fetch beaches.json (details+notes):", response.status);
                if (!response.ok) throw new Error(`Error HTTP cargando beaches.json: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                console.log("[DEBUG] Datos JSON cargados (details+notes). Buscando playa...");
                 console.log("[DEBUG] Buscando ID:", beachId, "en", allBeaches);
                beachData = allBeaches.find(b => b.id === beachId);
                 console.log("[DEBUG] Playa encontrada (details+notes):", beachData);
                if (beachData) {
                    displayBeachDetails(beachData);
                    // Llamar a cargar notas DESPUÉS de mostrar detalles
                    if (currentUserId && db) {
                         console.log("[DEBUG] Hay userId y db, procediendo a buscar notas en Firestore...");
                         fetchNotesFromFirestore();
                    } else {
                         console.log("[DEBUG] No se buscarán notas (falta userId o db no está lista).");
                    }
                } else {
                     showError(`No se encontró ninguna playa con el ID "${beachId}" en los datos cargados.`);
                }
            })
            .catch(handleFetchError); // Usar el manejador de errores general
     }

    // --- Mostrar Detalles de Playa en el DOM ---
    function displayBeachDetails(beach) {
         // Verificar si los elementos necesarios existen antes de usarlos
         if (!beachNameEl || !beachPhotoEl || !beachDescEl || !beachCharacteristicsDiv ||
             !beachSandEl || !beachConcEl || !beachWaterEl || !beachAmenitiesEl ||
             !beachAccessibilityEl || !beachContentDiv) {
             console.error("[DEBUG] displayBeachDetails: Faltan uno o más elementos del DOM para mostrar detalles.");
             showError("Error al mostrar los detalles de la playa en la página.");
             return;
         }

         console.log(`[DEBUG] Mostrando detalles para: ${beach.name}`);
         document.title = `Detalles: ${beach.name || 'Playa'}`;

         // Asignar contenido
         beachNameEl.textContent = beach.name || 'Nombre no disponible';

         if (beach.photoUrl) {
             beachPhotoEl.src = beach.photoUrl;
             beachPhotoEl.alt = `Foto de ${beach.name || 'la playa'}`;
             beachPhotoEl.style.display = 'block';
         } else {
             beachPhotoEl.style.display = 'none';
         }

         beachDescEl.textContent = beach.description || 'Descripción no disponible.';

         // Asignar Características (con corrección de <strong>)
         const characteristics = beach.characteristics || {};
         console.log("[DEBUG] Asignando Características:", characteristics);
         beachSandEl.innerHTML = characteristics.sandType ? `<strong>Arena:</strong> ${characteristics.sandType}` : '';
         beachConcEl.innerHTML = characteristics.concurrency ? `<strong>Concurrencia:</strong> ${characteristics.concurrency}` : '';
         beachWaterEl.innerHTML = characteristics.waterQuality ? `<strong>Calidad del Agua:</strong> ${characteristics.waterQuality}` : '';
         beachAmenitiesEl.innerHTML = characteristics.amenities ? `<strong>Servicios:</strong> ${characteristics.amenities}` : '';
         beachAccessibilityEl.innerHTML = characteristics.accessibility ? `<strong>Accesibilidad:</strong> ${characteristics.accessibility}` : '';

         // Mostrar u ocultar sección de características
         if (Object.values(characteristics).every(val => !val)) {
             beachCharacteristicsDiv.style.display = 'none';
             console.log("[DEBUG] Ocultando sección de características (vacía).");
         } else {
              beachCharacteristicsDiv.style.display = 'block';
              console.log("[DEBUG] Mostrando sección de características.");
         }

        // Hacer visible el contenedor principal
        beachContentDiv.classList.remove('hidden');
        console.log("[DEBUG] Contenedor #beach-content hecho visible.");
        console.log("[DEBUG] Clases actuales de #beach-content:", beachContentDiv.className);

        // Ocultar placeholder de errores si estaba visible
        if(errorPlaceholder) errorPlaceholder.classList.add('hidden');
    }


    // --- Funciones de Notas con Firestore ---
    async function fetchNotesFromFirestore() {
        if (!currentUserId || !beachId || !db) {
             console.warn("fetchNotesFromFirestore: Faltan datos (userId, beachId o db)");
             // Asegurarse de que el textarea esté habilitado si hay userID pero falla aquí
             if (userNotesTextarea) userNotesTextarea.disabled = false;
             return;
        }
        console.log(`[DEBUG] Buscando notas para userId: ${currentUserId}, beachId: ${beachId}`);
        if (notesStatusSpan) {
            notesStatusSpan.textContent = 'Cargando notas...';
            notesStatusSpan.style.color = 'orange';
        }
        if (userNotesTextarea) userNotesTextarea.disabled = true;
        currentNoteDocId = null;

        try {
            const querySnapshot = await db.collection(NOTES_COLLECTION)
                .where("userId", "==", currentUserId)
                .where("beachId", "==", beachId)
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                console.log("[DEBUG] No se encontraron notas previas en Firestore.");
                if (userNotesTextarea) userNotesTextarea.value = '';
                if (notesStatusSpan) {
                    notesStatusSpan.textContent = 'No hay notas guardadas.';
                    setTimeout(() => { if (notesStatusSpan.textContent === 'No hay notas guardadas.') notesStatusSpan.textContent = ''; }, 3000);
                }
            } else {
                const doc = querySnapshot.docs[0];
                currentNoteDocId = doc.id;
                const notesText = doc.data().notesText || '';
                if (userNotesTextarea) userNotesTextarea.value = notesText;
                console.log(`[DEBUG] Notas cargadas desde Firestore (Doc ID: ${currentNoteDocId}).`);
                if (notesStatusSpan) {
                    notesStatusSpan.textContent = 'Notas cargadas.';
                    setTimeout(() => { if (notesStatusSpan.textContent === 'Notas cargadas.') notesStatusSpan.textContent = ''; }, 2000);
                }
            }
        } catch (error) {
            console.error('[DEBUG] Error al obtener notas de Firestore:', error);
            if (notesStatusSpan) {
                notesStatusSpan.textContent = 'Error al cargar notas.';
                notesStatusSpan.style.color = 'red';
            }
            if (userNotesTextarea) userNotesTextarea.value = 'Error al cargar las notas.';
        } finally {
            if (userNotesTextarea) userNotesTextarea.disabled = false;
        }
    }

    async function saveNotesToFirestore() {
        if (!currentUserId || !beachId || !db || !userNotesTextarea || !saveNotesButton) {
             console.warn("saveNotesToFirestore: Faltan datos o elementos (userId, beachId, db, textarea, button)");
             return;
        }

        const notesToSave = userNotesTextarea.value;
        console.log(`[DEBUG] Guardando notas para userId: ${currentUserId}, beachId: ${beachId}`);
        saveNotesButton.disabled = true;
        if (notesStatusSpan) {
            notesStatusSpan.textContent = 'Guardando...';
            notesStatusSpan.style.color = 'orange';
        }

        const noteData = {
            userId: currentUserId,
            beachId: beachId,
            notesText: notesToSave,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            let operation;
            if (currentNoteDocId) {
                console.log(`[DEBUG] Actualizando documento Firestore: ${currentNoteDocId}`);
                const docRef = db.collection(NOTES_COLLECTION).doc(currentNoteDocId);
                operation = docRef.update(noteData);
            } else {
                console.log("[DEBUG] Creando nuevo documento en Firestore.");
                operation = db.collection(NOTES_COLLECTION).add(noteData);
            }
            await operation;

            console.log("[DEBUG] Notas guardadas/actualizadas correctamente.");
            if (notesStatusSpan) {
                notesStatusSpan.textContent = '¡Notas guardadas!';
                notesStatusSpan.style.color = 'green';
                setTimeout(() => { if (notesStatusSpan.textContent === '¡Notas guardadas!') notesStatusSpan.textContent = ''; }, 2500);
            }
             // Actualizar el ID local si se acaba de crear (opcional, si se usa await en add)
             // if (!currentNoteDocId && operation && operation.id) { // 'operation' sería la docRef devuelta por add
             //    currentNoteDocId = operation.id;
             // }

        } catch (error) {
            console.error('[DEBUG] Error al guardar notas en Firestore:', error);
             if (notesStatusSpan) {
                notesStatusSpan.textContent = 'Error al guardar.';
                notesStatusSpan.style.color = 'red';
            }
        } finally {
            saveNotesButton.disabled = false;
        }
    }


    // --- Funciones de Error ---
     function handleFetchError(error) {
        console.error('[DEBUG] Error en handleFetchError (fetch beaches.json):', error);
        showError(`Ocurrió un error al cargar la información de la playa: ${error.message}`);
        disableNotesCompletely("Datos de playa no disponibles.");
      }
     function showError(message) {
         console.error("[DEBUG] Mostrando Error en página:", message);
         if(beachContentDiv) beachContentDiv.classList.add('hidden'); // Ocultar contenido si hay error
         if(errorPlaceholder) {
             errorPlaceholder.textContent = message;
             errorPlaceholder.classList.remove('hidden'); // Mostrar error
         } else {
              // Fallback si no hay placeholder
              alert(`Error: ${message}`);
         }
         document.title = "Error";
         if(notesSectionWrapper) notesSectionWrapper.classList.add('hidden'); // Ocultar notas en error
     }


     // --- Event Listener para Guardar Notas ---
    if (saveNotesButton) {
        saveNotesButton.addEventListener('click', saveNotesToFirestore);
    } else {
         console.warn("[DEBUG] Botón para guardar notas no encontrado.");
    }


    // --- Iniciar la aplicación ---
    initializeApp();

}); // Fin DOMContentLoaded
