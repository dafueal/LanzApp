function displayBeachDetails(beach) {
    console.log(`[DEBUG] Mostrando detalles para: ${beach.name}`);
    document.title = `Detalles: ${beach.name || 'Playa'}`;

    // Nombre
    if (beachNameEl) beachNameEl.textContent = beach.name || 'Nombre no disponible';
    else console.error("Elemento #beach-detail-name no encontrado");

    // Foto
    if (beachPhotoEl) { /* ...código igual... */ }
    else console.error("Elemento #beach-detail-photo no encontrado");

    // Descripción
    if (beachDescEl) beachDescEl.textContent = beach.description || 'Descripción no disponible.';
    else console.error("Elemento #beach-detail-description no encontrado");

    // === INICIO BLOQUE COMENTADO ===
    /*
    const characteristics = beach.characteristics || {};
    console.log("[DEBUG] Asignando Características:", characteristics);

    if (beachSandEl) beachSandEl.innerHTML = characteristics.sandType ? `<strong>Arena:</strong> ${characteristics.sandType}` : '';
    else console.error("Elemento #beach-detail-sand no encontrado");

    if (beachConcEl) beachConcEl.innerHTML = characteristics.concurrency ? `<strong>Concurrencia:</strong> ${characteristics.concurrency}` : '';
    else console.error("Elemento #beach-detail-concurrency no encontrado");

    // ... (comentar las otras asignaciones de características: water, amenities, accessibility) ...

    if (beachCharacteristicsDiv) {
       if (Object.values(characteristics).every(val => !val)) {
           beachCharacteristicsDiv.style.display = 'none';
           console.log("[DEBUG] Ocultando sección de características (vacía).");
       } else {
            beachCharacteristicsDiv.style.display = 'block';
            console.log("[DEBUG] Mostrando sección de características."); // <-- Este era el último log que veías
       }
    } else console.error("Elemento #beach-detail-characteristics no encontrado");
    */
    // === FIN BLOQUE COMENTADO ===


    // Forzar la visualización del contenedor principal
    console.log("[DEBUG] Forzando visualización de #beach-content...");
    const beachContentDiv = document.getElementById('beach-content');
    if (beachContentDiv) {
        beachContentDiv.classList.remove('hidden');
        console.log("[DEBUG] Clase 'hidden' eliminada de #beach-content. Debería ser visible.");
        console.log("[DEBUG] Clases actuales de #beach-content:", beachContentDiv.className);
    } else {
        console.error("[DEBUG] ¡ERROR CRÍTICO! No se encontró #beach-content para hacerlo visible.");
    }

    if (errorPlaceholder) errorPlaceholder.classList.add('hidden');
}
