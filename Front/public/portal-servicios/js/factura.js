
'use strict';

(() => {
  // --- CORRECCIÓN NECESARIA: Definir las URLs base para ambos microservicios ---
  const API_CLIENTES_URL = '';
  const API_FACTURACION_URL = '';

  /**
   * Construye la URL completa de la API a partir de un servicio y un path.
   * @param {'clientes'|'facturacion'} service
   * @param {string} path
   * @returns {string}
   */
  function apiUrl(service, path) {
    const base = service === 'clientes' ? API_CLIENTES_URL : API_FACTURACION_URL;
    return base + path;
  }

  // --- DOM (Sin cambios) ---
  const inputDocumento = document.getElementById('inputDocumento');
  const btnBuscarCliente = document.getElementById('btnBuscarCliente');
  const infoClienteDiv = document.getElementById('infoCliente');
  const inputProducto = document.getElementById('inputProducto');
  const inputCantidad = document.getElementById('inputCantidad');
  const inputPrecio = document.getElementById('inputPrecio');
  const btnAnadirItem = document.getElementById('btnAnadirItem');
  const tablaItemsBody = document.querySelector('#tablaItems tbody');
  const btnGenerarFactura = document.getElementById('btnGenerarFactura');
  const resultadoFacturaDiv = document.getElementById('resultadoFactura');

  let clienteEncontrado = null;
  let itemsFactura = [];

  // event listeners (Sin cambios)
  btnBuscarCliente.addEventListener('click', buscarCliente);
  btnAnadirItem.addEventListener('click', anadirItem);
  btnGenerarFactura.addEventListener('click', generarFactura);

  // --- Funciones de UI (Sin cambios) ---
  function actualizarEstadoBotonFactura() {
    btnGenerarFactura.disabled = !(clienteEncontrado && itemsFactura.length > 0);
  }

  function mostrarInfo(html) {
    infoClienteDiv.innerHTML = html;
    infoClienteDiv.style.display = 'block'; // Aseguramos que sea visible
  }
  function mostrarResultado(html) {
    resultadoFacturaDiv.innerHTML = html;
    resultadoFacturaDiv.style.display = 'block'; // Aseguramos que sea visible
  }

  // --- CORRECCIÓN NECESARIA: Lógica de `buscarCliente` adaptada ---
  async function buscarCliente() {
    const documento = inputDocumento.value.trim();
    if (documento.length !== 8 && documento.length !== 11) {
      mostrarInfo(`<p style="color:red">Ingrese DNI (8 dígitos) o RUC (11 dígitos).</p>`);
      return;
    }

    mostrarInfo(`<p>Buscando cliente...</p>`);
    clienteEncontrado = null;
    actualizarEstadoBotonFactura();

    // APUNTAR AL ENDPOINT INTELIGENTE DEL SERVICIO DE CLIENTES
    const url = apiUrl('clientes', `/api/v1/clientes/documento/${encodeURIComponent(documento)}`);
    console.log('Fetch GET', url);

    try {
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' }});
      if (!res.ok) {
        throw new Error(`No se encontró información para el documento. Código: ${res.status}`);
      }
      const data = await res.json();

      // MANEJAR LA RESPUESTA ESTRUCTURADA { tipo, datosRuc, datosDni }
      if (data.tipo === 'RUC' && data.datosRuc) {
        clienteEncontrado = data.datosRuc; // Guardamos el objeto RUC
        mostrarInfo(`
          <p><strong>Tipo:</strong> Cliente para FACTURA</p>
          <p><strong>Razón Social:</strong> ${escapeHtml(clienteEncontrado.razon_social || '—')}</p>
          <p><strong>RUC:</strong> ${escapeHtml(clienteEncontrado.ruc || '—')}</p>
        `);
      } else if (data.tipo === 'DNI' && data.datosDni) {
        // Creamos un objeto 'clienteEncontrado' compatible para la boleta
        clienteEncontrado = {
          ruc: documento, // El backend espera el DNI en este campo para boletas
          razon_social: data.datosDni.nombreCompleto
        };
        mostrarInfo(`
          <p><strong>Tipo:</strong> Cliente para BOLETA</p>
          <p><strong>Nombre:</strong> ${escapeHtml(data.datosDni.nombreCompleto || '—')}</p>
          <p><strong>DNI:</strong> ${escapeHtml(documento)}</p>
        `);
      } else {
        throw new Error("Respuesta inesperada del servidor.");
      }

      actualizarEstadoBotonFactura();
    } catch (err) {
      console.error('buscarCliente error', err);
      mostrarInfo(`<p style="color:red">${escapeHtml(err.message)}</p>`);
      clienteEncontrado = null;
      actualizarEstadoBotonFactura();
    }
  }

  // --- AÑADIR ITEM Y RENDERIZAR TABLA (Sin cambios, tu lógica original) ---
  function anadirItem() {
    const producto = inputProducto.value.trim();
    const cantidad = parseInt(inputCantidad.value, 10);
    const precio = parseFloat(inputPrecio.value);
    if (!producto || isNaN(cantidad) || isNaN(precio) || cantidad <= 0 || precio <= 0) {
      alert('Datos de producto inválidos.');
      return;
    }
    itemsFactura.push({ producto, cantidad, precioUnitario: precio });
    renderizarTablaItems();
    inputProducto.value = '';
    inputCantidad.value = '';
    inputPrecio.value = '';
    actualizarEstadoBotonFactura();
  }

  function renderizarTablaItems() {
    tablaItemsBody.innerHTML = '';
    let total = 0;
    itemsFactura.forEach(item => {
      const subtotal = item.cantidad * item.precioUnitario;
      total += subtotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(item.producto)}</td>
        <td>${item.cantidad}</td>
        <td>${item.precioUnitario.toFixed(2)}</td>
        <td>${subtotal.toFixed(2)}</td>
      `;
      tablaItemsBody.appendChild(tr);
    });
    if (itemsFactura.length > 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="3" style="text-align:right"><strong>Total</strong></td><td><strong>${total.toFixed(2)}</strong></td>`;
      tablaItemsBody.appendChild(tr);
    }
  }

  // --- CORRECCIÓN NECESARIA: Lógica de `generarFactura` adaptada ---
  async function generarFactura() {
    if (!clienteEncontrado || itemsFactura.length === 0) {
      alert('Debe buscar un cliente válido y añadir items.');
      return;
    }
    // El 'ruc' de clienteEncontrado ahora puede ser un RUC o un DNI.
    const rucValue = clienteEncontrado.ruc;
    if (!rucValue) { alert('No se determinó el RUC/DNI del cliente.'); return; }

    const datosFactura = { rucCliente: rucValue, items: itemsFactura };
    mostrarResultado('<p>Generando comprobante...</p>');
    btnGenerarFactura.disabled = true;

    try {
      // APUNTAR AL SERVICIO DE FACTURACIÓN
      const urlCrear = apiUrl('facturacion', '/api/v1/facturas/crear');
      console.log('POST', urlCrear, datosFactura);
      const resp = await fetch(urlCrear, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(datosFactura)
      });
      if (!resp.ok) {
        throw new Error(`Error al crear el comprobante (${resp.status})`);
      }

      const json = await resp.json();
      const id = json.id;
      if (!id) throw new Error("La respuesta de creación no incluyó un ID de factura.");

      mostrarResultado(`<p>Comprobante creado (ID ${id}). Descargando PDF...</p>`);

      // APUNTAR AL SERVICIO DE FACTURACIÓN PARA EL PDF
      const pdfUrl = apiUrl('facturacion', `/api/v1/facturas/${encodeURIComponent(id)}/pdf`);
      const pdfResp = await fetch(pdfUrl);
      if (!pdfResp.ok) {
        throw new Error(`No se pudo descargar el PDF (${pdfResp.status})`);
      }
      const blob = await pdfResp.blob();
      descargarBlob(blob, `comprobante-${id}.pdf`);
      mostrarResultado('<p style="color:green">PDF descargado.</p>');
    } catch (err) {
      console.error('generarFactura error', err);
      mostrarResultado(`<p style="color:red">${escapeHtml(err.message)}</p>`);
    } finally {
      btnGenerarFactura.disabled = false;
    }
  }

  // --- utilidades (Sin cambios) ---
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function descargarBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=> URL.revokeObjectURL(url), 1500);
  }
  async function safeText(resp) { try { return await resp.text(); } catch(e){ return ''; } }

  actualizarEstadoBotonFactura();
})();