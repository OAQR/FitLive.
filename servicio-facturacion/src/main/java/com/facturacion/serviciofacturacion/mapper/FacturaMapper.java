package com.facturacion.serviciofacturacion.mapper;

import com.facturacion.serviciofacturacion.dto.CreacionFacturaRequest;
import com.facturacion.serviciofacturacion.dto.FacturaResponse;
import com.facturacion.serviciofacturacion.entity.FacturaEntity;
import com.facturacion.serviciofacturacion.entity.ItemFacturaEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class FacturaMapper {

    /**
     * Convierte un DTO de creación a una Entidad.
     * No calcula totales, solo mapea los datos de entrada.
     * @param request El DTO de la petición.
     * @return Una FacturaEntity parcialmente construida.
     */
    public FacturaEntity toEntity(CreacionFacturaRequest request) {
        if (request == null) {
            return null;
        }

        FacturaEntity entity = new FacturaEntity();
        entity.setRucCliente(request.getRucCliente());

        for (CreacionFacturaRequest.ItemRequest itemDto : request.getItems()) {
            ItemFacturaEntity itemEntity = new ItemFacturaEntity();
            itemEntity.setProducto(itemDto.getProducto());
            itemEntity.setCantidad(itemDto.getCantidad());
            itemEntity.setPrecioUnitario(itemDto.getPrecioUnitario());

            entity.addItem(itemEntity); // Usa el helper para mantener la relación
        }

        return entity;
    }

    /**
     * Convierte una Entidad ya guardada a un DTO de respuesta.
     * @param entity La entidad que viene de la base de datos.
     * @param mensaje Un mensaje adicional para la respuesta.
     * @return El DTO que se expondrá en la API.
     */
    public FacturaResponse toResponse(FacturaEntity entity, String mensaje) {
        if (entity == null) {
            return null;
        }

        FacturaResponse response = new FacturaResponse();
        response.setId(entity.getId());
        response.setSerieCorrelativo(entity.getSerie() + "-" + entity.getCorrelativo());
        response.setFechaEmision(entity.getFechaEmision());
        response.setImporteTotal(entity.getImporteTotal());
        response.setRucCliente(entity.getRucCliente());
        response.setMensaje(mensaje);

        return response;
    }
}