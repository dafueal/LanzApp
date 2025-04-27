// Comenta la línea original
// fetch('beaches.json')
fetch('test.txt') // <-- Intenta cargar el archivo de prueba
   .then(response => {
      if (!response.ok) { throw new Error('Error fetch test.txt'); }
      return response.text(); // Leer como texto plano
    })
   .then(textData => {
      console.log("CONTENIDO DE TEST.TXT:", textData); // Ver si carga "Hola Mundo"
      // Aquí no llames a addBeachMarkers, solo es para ver si el fetch funciona
      // addBeachMarkers(...);
    })
   .catch(error => {
      console.error('Error al cargar test.txt:', error);
      // ... (código de error) ...
    });
