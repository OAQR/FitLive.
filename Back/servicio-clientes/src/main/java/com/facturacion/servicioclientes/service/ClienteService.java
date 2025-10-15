package com.facturacion.servicioclientes.service;

import com.facturacion.servicioclientes.dto.ClienteResponse;
import com.facturacion.servicioclientes.dto.ConsultaDocumentoResponse;
import com.facturacion.servicioclientes.dto.DniResponse;
import java.util.Optional;

public interface ClienteService {

    /**
     * Busca un cliente por su número de RUC.
     * Puede obtenerlo de una fuente externa si no existe en la base de datos local.
     * @param ruc El número de RUC a buscar.
     * @return Un Optional que contiene el ClienteResponse si se encuentra, o vacío si no.
     */
    Optional<ClienteResponse> buscarPorRuc(String ruc);

    Optional<DniResponse> buscarPorDniSimple(String dni);
    Optional<ClienteResponse> buscarRucAsociadoADni(String dni);

    /**
     * Busca un documento que puede ser RUC o DNI y devuelve la información apropiada.
     * @param documento El número de documento (8 o 11 dígitos).
     * @return Un DTO contenedor con los datos de RUC o DNI.
     */
    Optional<ConsultaDocumentoResponse> buscarPorDocumento(String documento);
}