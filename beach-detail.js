function displayBeachDetails(beach) {
    // ... (código anterior para rellenar nombre, foto, desc, características) ...
    console.log("[DEBUG] Mostrando sección de características.");

    // === MOVER LA OBTENCIÓN AQUÍ ===
    const beachContentDiv = document.getElementById('beach-content');
    // === FIN MOVER ===

    // === Logs de depuración ===
    console.log("[DEBUG] Intentando mostrar #beach-content. Referencia:", beachContentDiv);
    if (beachContentDiv) {
        beachContentDiv.classList.remove('hidden');
        console.log("[DEBUG] Clase 'hidden' eliminada de #beach-content. Debería ser visible.");
        console.log("[DEBUG] Clases actuales de #beach-content:", beachContentDiv.className);
    } else {
        console.error("[DEBUG] ¡ERROR CRÍTICO! No se encontró #beach-content para hacerlo visible.");
    }
    // === FIN LOGS ===

    if (errorPlaceholder) errorPlaceholder.classList.add('hidden');
}
