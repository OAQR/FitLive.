document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el formulario
    const formConsultaRuc = document.getElementById('formConsultaRuc');
    const inputRuc = document.getElementById('inputRuc');
    const resultadoRucDiv = document.getElementById('resultadoRuc');

    // Escuchamos el evento 'submit' del formulario
    formConsultaRuc.addEventListener('submit', (event) => {
        // Prevenimos que la página se recargue
        event.preventDefault();

        // Llamamos a nuestra función de búsqueda
        buscarDocumento();
    });

    async function buscarDocumento() {
        const ruc = inputRuc.value.trim();

        // --- VALIDACIÓN ROBUSTA CON EXPRESIÓN REGULAR ---
        // La expresión regular /^\d{11}$/ verifica que el string
        // contenga exactamente 11 dígitos de principio a fin.
        if (!/^\d{11}$/.test(ruc)) {
            mostrarError("El RUC debe contener exactamente 11 dígitos numéricos.");
            return;
        }

        mostrarCargando();

        try {
            // Llamamos al endpoint específico para RUC
            const response = await fetch(`/api/v1/clientes/ruc/${ruc}`);

            if (response.status === 404) {
                throw new Error("No se encontró información para el RUC ingresado.");
            }
            if (!response.ok) {
                throw new Error(`Error en el servidor (Código: ${response.status})`);
            }

            const data = await response.json();
            mostrarResultado(data);
        } catch (error) {
            mostrarError(error.message);
        }
    }

    function mostrarResultado(data) {
        resultadoRucDiv.style.display = 'block';
        resultadoRucDiv.classList.remove('error');
        resultadoRucDiv.innerHTML = `
            <h3>Datos del Contribuyente</h3>
            <p><strong>RUC:</strong> ${data.ruc}</p>
            <p><strong>Razón Social:</strong> ${data.razon_social}</p>
            <p><strong>Estado:</strong> ${data.estado}</p>
            <p><strong>Dirección:</strong> ${data.direccion}</p>
            <p><strong>Departamento:</strong> ${data.departamento || 'No especificado'}</p>
        `;
    }

    function mostrarCargando() {
        resultadoRucDiv.style.display = 'block';
        resultadoRucDiv.classList.remove('error');
        resultadoRucDiv.innerHTML = '<p>Buscando...</p>';
    }

    function mostrarError(mensaje) {
        resultadoRucDiv.style.display = 'block';
        resultadoRucDiv.classList.add('error');
        resultadoRucDiv.innerHTML = `<p>${mensaje}</p>`;
    }
});