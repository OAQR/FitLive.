package com.facturacion.serviciofacturacion.service;

import com.facturacion.serviciofacturacion.dto.CreacionFacturaRequest;
import com.facturacion.serviciofacturacion.dto.FacturaResponse;

public interface FacturaService {

    /**
     * Crea una nueva factura, la persiste en la base de datos y devuelve una respuesta.
     * @param request El DTO que contiene el RUC del cliente y los items.
     * @return Un DTO con la información de la factura creada.
     */
    FacturaResponse crearFactura(CreacionFacturaRequest request);
}