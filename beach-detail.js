

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

    // --- Variables Globales y Referencias (Sin cambios) ---
    let db;
    const NOTES_COLLECTION = 'userBeachNotes';
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');
    let currentUserId = null;
    let beachData = null;
    let currentNoteDocId = null;

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

    // --- Inicialización Principal (Sin cambios) ---
    function initializeApp() {
        console.log("[DEBUG] Iniciando beach-detail.js...");
        if (!beachId) {
            showError("No se especificó un ID de playa en la URL.");
            return;
        }
        console.log(`[DEBUG] Beach ID from URL: ${beachId}`);

        try {
            if (typeof firebase === 'undefined' || !firebase.initializeApp) {
                 throw new Error("SDK de Firebase no cargado correctamente.");
            }
            if (!firebase.apps.length) {
                 firebase.initializeApp(firebaseConfig);
                 console.log("[DEBUG] Firebase inicializado.");
            } else {
                 console.log("[DEBUG] Firebase ya estaba inicializado.");
            }
            db = firebase.firestore();
            if(!db) throw new Error("Instancia de Firestore (db) no se pudo obtener.");
            console.log("[DEBUG] Instancia Firestore asignada.");
        } catch (e) {
            console.error("[DEBUG] Error inicializando Firebase:", e);
            showError("No se pudo conectar con el servicio de notas (Firebase). Verifica la configuración y las credenciales.");
            disableNotesCompletely("Firebase no disponible.");
            loadBeachDetailsOnly();
            return;
        }

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
    function activateNotesSection() { /* ... */ }
    function deactivateNotesSection() { /* ... */ }
    function disableNotesCompletely(reason = "...") { /* ... */ }

    // --- Carga de Datos de Playa (Sin cambios) ---
     function loadBeachDetailsOnly() {
         console.log("[DEBUG] Cargando solo detalles de la playa...");
         fetch('/LanzApp/beaches.json') // Usando ruta absoluta
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP cargando beaches.json: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
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
          fetch('/LanzApp/beaches.json') // Usando ruta absoluta
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP cargando beaches.json: ${response.status}`);
                return response.json();
            })
            .then(allBeaches => {
                beachData = allBeaches.find(b => b.id === beachId);
                if (beachData) {
                    displayBeachDetails(beachData);
                    if (currentUserId && db) {
                         fetchNotesFromFirestore();
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
         document.title = `Detalles: ${beach.name || 'Playa'}`;

         // Nombre
         if (beachNameEl) beachNameEl.textContent = beach.name || 'Nombre no disponible';
         else console.error("Elemento #beach-detail-name no encontrado");

         // Foto
         if (beachPhotoEl) {
             if (beach.photoUrl) {
                 beachPhotoEl.src = beach.photoUrl;
                 beachPhotoEl.alt = `Foto de ${beach.name || 'la playa'}`;
                 beachPhotoEl.style.display = 'block';
             } else {
                 beachPhotoEl.style.display = 'none';
             }
         } else console.error("Elemento #beach-detail-photo no encontrado");

         // Descripción
         if (beachDescEl) beachDescEl.textContent = beach.description || 'Descripción no disponible.';
         else console.error("Elemento #beach-detail-description no encontrado");

         // Características
         const characteristics = beach.characteristics || {};
         console.log("[DEBUG] Asignando Características:", characteristics);

         // === CORRECCIÓN AQUÍ ===
         if (beachSandEl) beachSandEl.innerHTML = characteristics.sandType ? `<strong>Arena:</strong> ${characteristics.sandType}` : '';
         else console.error("Elemento #beach-detail-sand no encontrado");

         if (beachConcEl) beachConcEl.innerHTML = characteristics.concurrency ? `<strong>Concurrencia:</strong> ${characteristics.concurrency}` : '';
         else console.error("Elemento #beach-detail-concurrency no encontrado");

         if (beachWaterEl) beachWaterEl.innerHTML = characteristics.waterQuality ? `<strong>Calidad del Agua:</strong> ${characteristics.waterQuality}` : '';
         else console.error("Elemento #beach-detail-water no encontrado");

         if (beachAmenitiesEl) beachAmenitiesEl.innerHTML = characteristics.amenities ? `<strong>Servicios:</strong> ${characteristics.amenities}` : '';
         else console.error("Elemento #beach-detail-amenities no encontrado");

         if (beachAccessibilityEl) beachAccessibilityEl.innerHTML = characteristics.accessibility ? `<strong>Accesibilidad:</strong> ${characteristics.accessibility}` : '';
         else console.error("Elemento #beach-detail-accessibility no encontrado");
         // === FIN CORRECCIÓN ===


         // Ocultar/Mostrar sección características
         if (beachCharacteristicsDiv) {
            if (Object.values(characteristics).every(val => !val)) {
                beachCharacteristicsDiv.style.display = 'none';
                console.log("[DEBUG] Ocultando sección de características (vacía).");
            } else {
                 beachCharacteristicsDiv.style.display = 'block';
                 console.log("[DEBUG] Mostrando sección de características.");
            }
         } else console.error("Elemento #beach-detail-characteristics no encontrado");


         // Mostrar contenido principal y ocultar errores
         if(beachContentDiv) beachContentDiv.classList.remove('hidden');
         else console.error("Elemento #beach-content no encontrado");

         if(errorPlaceholder) errorPlaceholder.classList.add('hidden');
    }

    // --- Funciones de Notas con Firestore (Sin cambios) ---
    async function fetchNotesFromFirestore() { /* ... */ }
    async function saveNotesToFirestore() { /* ... */ }

    // --- Funciones de Error (Sin cambios) ---
     function handleFetchError(error) { /* ... */ }
     function showError(message) { /* ... */ }

     // --- Event Listener para Guardar Notas (Sin cambios) ---
    if (saveNotesButton) {
        saveNotesButton.addEventListener('click', saveNotesToFirestore);
    }

    // --- Iniciar la aplicación ---
    initializeApp();

}); // Fin DOMContentLoaded
