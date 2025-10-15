package com.facturacion.servicioclientes.mapper;

import com.facturacion.servicioclientes.dto.ClienteResponse;
import com.facturacion.servicioclientes.dto.DniResponse;
import com.facturacion.servicioclientes.entity.ClienteEntity;
import com.facturacion.servicioclientes.external.PeruDevsResponse;
import com.facturacion.servicioclientes.external.PeruDevsDniResponse;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    /**
     * Convierte una Entidad de Cliente a un DTO de Respuesta.
     * @param entity El objeto que viene de la base de datos.
     * @return El DTO que se expondrá en la API.
     */
    public ClienteResponse toResponse(ClienteEntity entity) {
        if (entity == null) {
            return null;
        }
        ClienteResponse dto = new ClienteResponse();
        dto.setRuc(entity.getRuc());
        dto.setRazon_social(entity.getRazonSocial());
        dto.setDireccion(entity.getDireccion());
        dto.setEstado(entity.getEstado());
        dto.setDepartamento(entity.getDepartamento());
        return dto;
    }

    /**
     * Convierte los datos de la API externa a nuestra Entidad de Cliente.
     * @param externalData El objeto DTO que viene de la respuesta de PeruDevs.
     * @return La Entidad lista para ser guardada en la base de datos.
     */
    public ClienteEntity toEntity(PeruDevsResponse.ClienteData externalData) {
        if (externalData == null) {
            return null;
        }
        ClienteEntity entity = new ClienteEntity();
        entity.setRuc(externalData.getRuc());
        entity.setRazonSocial(externalData.getRazonSocial());
        entity.setDireccion(externalData.getDireccion());
        entity.setEstado(externalData.getEstado());
        entity.setDepartamento(externalData.getDepartamento());
        return entity;
    }


    /**
     * Convierte los datos de DNI de la API externa a nuestro DTO de respuesta de DNI.
     * @param externalData El objeto DTO que viene de la respuesta de PeruDevs.
     * @return El DTO que se expondrá en nuestra API.
     */
    public DniResponse toDniResponse(PeruDevsDniResponse.DniData externalData) {
        if (externalData == null) {
            return null;
        }
        DniResponse dto = new DniResponse();
        dto.setNombres(externalData.getNombres());
        dto.setApellidoPaterno(externalData.getApellidoPaterno());
        dto.setApellidoMaterno(externalData.getApellidoMaterno());
        dto.setNombreCompleto(externalData.getNombreCompleto());
        return dto;
    }
}