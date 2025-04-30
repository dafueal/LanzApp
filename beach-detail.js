document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración de Firebase (¡¡REEMPLAZA CON TUS VALORES!!) ---
    const firebaseConfig = {
      apiKey: "AIzaSyAvtAh8dWsqLXLwtohdHJT4bm2fkH73Tg4",
      authDomain: "lanzapp-10b86.firebaseapp.com",
      projectId: "lanzapp-10b86",
      storageBucket: "lanzapp-10b86.firebasestorage.app",
      messagingSenderId: "977850801417",
      appId: "1:977850801417:web:9c086bc6f85a6e66f447d8"
    };

    // --- Variables Globales y Referencias a Elementos ---
    let db;
    const NOTES_COLLECTION = 'userBeachNotes';
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');
    let currentUserId = null;
    let beachData = null;
    let currentNoteDocId = null;

    // ... (obtener referencias a elementos: beachContentDiv, beachNameEl, etc. como antes) ...
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
            // Evitar inicializar múltiples veces si ya existe
            if (!firebase.apps.length) {
                 firebase.initializeApp(firebaseConfig);
                 console.log("[DEBUG] Firebase inicializado.");
            } else {
                 console.log("[DEBUG] Firebase ya estaba inicializado.");
            }
            db = firebase.firestore(); // Asignar instancia Firestore
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

    // --- Lógica de Activación/Desactivación de Notas (Sin cambios) ---
    function activateNotesSection() { console.log("[DEBUG] Activando sección de notas."); /* ... */ }
    function deactivateNotesSection() { console.log("[DEBUG] Desactivando sección de notas (no hay userId)."); /* ... */ }
    function disableNotesCompletely(reason = "...") { console.log(`[DEBUG] Deshabilitando notas completamente: ${reason}`); /* ... */ }


    // --- Carga de Datos de Playa (desde JSON) ---
     function loadBeachDetailsOnly() {
         console.log("[DEBUG] Cargando solo detalles de la playa...");
         // Intenta con ruta absoluta como prueba
         fetch('/LanzApp/beaches.json')
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
                    showError(`No se encontró ninguna playa con el ID "${beachId}" en los datos cargados.`);
                }
            })
            .catch(handleFetchError);
     }
     function loadBeachDetailsAndNotes() {
         console.log("[DEBUG] Cargando detalles de playa y preparando para notas...");
         // Intenta con ruta absoluta como prueba
         fetch('/LanzApp/beaches.json')
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
            .catch(handleFetchError);
     }

    // --- Mostrar Detalles de Playa en el DOM ---
    function displayBeachDetails(beach) {
         console.log(`[DEBUG] Mostrando detalles para: ${beach.name}`);
         // ... (resto del código para rellenar nombre, foto, etc. IGUAL QUE ANTES) ...
         document.title = `Detalles: ${beach.name || 'Playa'}`;
         beachNameEl.textContent = beach.name || 'Nombre no disponible';
         // ... etc ...

         // Asegúrate que el contenedor se muestra
         if(beachContentDiv) {
             beachContentDiv.classList.remove('hidden');
             console.log("[DEBUG] Contenedor #beach-content hecho visible.");
         } else {
              console.error("[DEBUG] El contenedor #beach-content no se encontró para hacerlo visible.");
         }
         if(errorPlaceholder) errorPlaceholder.classList.add('hidden');
    }


    // --- Funciones de Notas con Firestore (Sin cambios en la lógica interna) ---
    async function fetchNotesFromFirestore() { /* ... código igual que antes ... */ }
    async function saveNotesToFirestore() { /* ... código igual que antes ... */ }


    // --- Funciones de Error (Sin cambios) ---
     function handleFetchError(error) {
         console.error('[DEBUG] Error en handleFetchError (fetch beaches.json):', error);
         showError(`Ocurrió un error al cargar la información de la playa: ${error.message}`);
         disableNotesCompletely("Datos de playa no disponibles.");
      }
     function showError(message) {
         console.error("[DEBUG] Mostrando Error en página:", message);
         // ... (código igual que antes para mostrar error) ...
     }

     // --- Event Listener para Guardar Notas (Sin cambios) ---
    if (saveNotesButton) {
        saveNotesButton.addEventListener('click', saveNotesToFirestore);
    }

    // --- Iniciar la aplicación ---
    initializeApp();

}); // Fin DOMContentLoaded
