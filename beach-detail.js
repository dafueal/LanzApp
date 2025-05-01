document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración de Firebase ---
    const firebaseConfig = { /* ... tus credenciales ... */ };

    // --- Variables Globales ---
    let db;
    const NOTES_COLLECTION = 'userBeachNotes';
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get('id');
    let currentUserId = null;
    let beachData = null;
    let currentNoteDocId = null;

    // --- ¡¡ASEGÚRATE DE QUE ESTA SECCIÓN EXISTE Y ES CORRECTA!! ---
    // --- Referencias a Elementos del DOM ---
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
    // --- FIN SECCIÓN DE DECLARACIONES ---


    // --- Inicialización Principal ---
    function initializeApp() {
        // ... (resto del código initializeApp) ...
    }

    // --- Lógica de Activación/Desactivación de Notas ---
    function activateNotesSection() { /* ... */ }
    function deactivateNotesSection() { /* ... */ }
    function disableNotesCompletely(reason = "...") { /* ... */ }


    // --- Carga de Datos de Playa (desde JSON) ---
     function loadBeachDetailsOnly() { /* ... */ }
     function loadBeachDetailsAndNotes() { /* ... */ }


    // --- Mostrar Detalles de Playa en el DOM ---
    // ¡IMPORTANTE! La función SÍ debe existir y ser llamada
    function displayBeachDetails(beach) {
         // ... (código interno de displayBeachDetails) ...
         // Ahora las variables como beachNameEl, beachPhotoEl sí deberían estar definidas
    }


    // --- Funciones de Notas con Firestore ---
    async function fetchNotesFromFirestore() { /* ... */ }
    async function saveNotesToFirestore() { /* ... */ }


    // --- Funciones de Error ---
     function handleFetchError(error) { /* ... */ }
     function showError(message) { /* ... */ }


     // --- Event Listener para Guardar Notas ---
    if (saveNotesButton) {
        saveNotesButton.addEventListener('click', saveNotesToFirestore);
    }


    // --- Iniciar la aplicación ---
    initializeApp(); // Esta llamada usa las funciones definidas arriba


}); // Fin DOMContentLoaded
