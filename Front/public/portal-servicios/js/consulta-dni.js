document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el formulario en lugar del botón por separado
    const formConsultaDni = document.getElementById('formConsultaDni');
    const inputDni = document.getElementById('inputDni');
    const resultadoDniDiv = document.getElementById('resultadoDni');

    // Escuchamos el evento 'submit' del formulario
    formConsultaDni.addEventListener('submit', (event) => {
        // Prevenimos el comportamiento por defecto del formulario (que es recargar la página)
        event.preventDefault();

        // Llamamos a nuestra función de búsqueda
        buscarDocumento();
    });

    async function buscarDocumento() {
        const dni = inputDni.value.trim();

        // --- VALIDACIÓN ROBUSTA CON EXPRESIÓN REGULAR ---
        // La expresión regular /^\d{8}$/ verifica que el string:
        // ^ - empiece
        // \d{8} - tenga exactamente 8 dígitos
        // $ - y termine.
        if (!/^\d{8}$/.test(dni)) {
            mostrarError("El DNI debe contener exactamente 8 dígitos numéricos.");
            return;
        }

        mostrarCargando();

        try {
            // Flujo 1: Intentar buscar RUC asociado
            const rucResponse = await fetch(`/api/v1/clientes/dni/${dni}/ruc-asociado`);
            if (rucResponse.ok) {
                const dataRuc = await rucResponse.json();
                mostrarResultado(dataRuc, 'RUC');
                return; // Importante: Salimos de la función si encontramos un RUC
            }

            // Flujo 2: Si no hay RUC (el status no fue 'ok'), buscar DNI simple
            const dniResponse = await fetch(`/api/v1/clientes/dni/${dni}`);
            if (dniResponse.ok) {
                const dataDni = await dniResponse.json();
                mostrarResultado(dataDni, 'DNI');
                return; // Salimos de la función si encontramos un DNI
            }

            // Si ninguna de las dos respuestas fue 'ok', lanzamos un error general
            throw new Error("No se encontró información para el DNI ingresado en ninguna de las fuentes.");

        } catch (error) {
            // Este bloque ahora atrapará tanto errores de red como el error que lanzamos manualmente
            mostrarError(error.message);
        }
    }

    function mostrarResultado(data, tipo) {
        resultadoDniDiv.style.display = 'block';
        resultadoDniDiv.classList.remove('error'); // Quitar la clase de error si existía
        let htmlContent = '';
        if (tipo === 'RUC') {
            htmlContent = `
                <h3>Datos del Contribuyente (RUC 10 asociado)</h3>
                <p><strong>RUC:</strong> ${data.ruc}</p>
                <p><strong>Razón Social:</strong> ${data.razon_social}</p>
                <p><strong>Estado:</strong> ${data.estado}</p>
                <p><strong>Dirección:</strong> ${data.direccion}</p>
            `;
        } else { // tipo === 'DNI'
            htmlContent = `
                <h3>Datos de la Persona</h3>
                <p><strong>Nombre Completo:</strong> ${data.nombreCompleto}</p>
                <p><strong>Nombres:</strong> ${data.nombres}</p>
                <p><strong>Apellido Paterno:</strong> ${data.apellidoPaterno}</p>
                <p><strong>Apellido Materno:</strong> ${data.apellidoMaterno}</p>
            `;
        }
        resultadoDniDiv.innerHTML = htmlContent;
    }

    function mostrarCargando() {
        resultadoDniDiv.style.display = 'block';
        resultadoDniDiv.classList.remove('error');
        resultadoDniDiv.innerHTML = '<p>Buscando...</p>';
    }

    function mostrarError(mensaje) {
        resultadoDniDiv.style.display = 'block';
        resultadoDniDiv.classList.add('error'); // Añadimos una clase para estilizar el error
        resultadoDniDiv.innerHTML = `<p>${mensaje}</p>`;
    }
});