package com.facturacion.servicioclientes.service;

import com.facturacion.servicioclientes.dto.ClienteResponse;
import com.facturacion.servicioclientes.dto.ConsultaDocumentoResponse;
import com.facturacion.servicioclientes.dto.DniResponse;
import com.facturacion.servicioclientes.entity.ClienteEntity;
import com.facturacion.servicioclientes.external.PeruDevsAdapter;
import com.facturacion.servicioclientes.mapper.ClienteMapper; // <-- IMPORTAR
import com.facturacion.servicioclientes.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final PeruDevsAdapter peruDevsAdapter;
    private final ClienteMapper clienteMapper;

    @Autowired
    public ClienteServiceImpl(ClienteRepository clienteRepository,
                              PeruDevsAdapter peruDevsAdapter,
                              ClienteMapper clienteMapper) {
        this.clienteRepository = clienteRepository;
        this.peruDevsAdapter = peruDevsAdapter;
        this.clienteMapper = clienteMapper;
    }

    @Override
    public Optional<ClienteResponse> buscarPorRuc(String ruc) {
        Optional<ClienteEntity> clienteDesdeDb = clienteRepository.findByRuc(ruc);

        if (clienteDesdeDb.isPresent()) {
            System.out.println("Cliente encontrado en la base de datos local.");
            ClienteResponse dto = clienteMapper.toResponse(clienteDesdeDb.get());
            return Optional.of(dto);
        }

        System.out.println("Cliente no encontrado en BD. Consultando servicio externo...");
        return peruDevsAdapter.consultarRuc(ruc).map(datosExternos -> {
            ClienteEntity nuevaEntidad = clienteMapper.toEntity(datosExternos);

            ClienteEntity entidadGuardada = clienteRepository.save(nuevaEntidad);
            System.out.println("Nuevo cliente guardado en la base de datos.");

            return clienteMapper.toResponse(entidadGuardada);
        });
    }

    @Override
    public Optional<DniResponse> buscarPorDniSimple(String dni) {
        return peruDevsAdapter.consultarDniSimple(dni)
                .map(clienteMapper::toDniResponse);
    }

    @Override
    public Optional<ClienteResponse> buscarRucAsociadoADni(String dni) {
        return peruDevsAdapter.consultarRucAsociadoADni(dni)
                .map(datosExternos -> {
                    ClienteResponse dto = new ClienteResponse();
                    dto.setRuc(datosExternos.getRuc());
                    dto.setRazon_social(datosExternos.getRazonSocial());
                    dto.setDireccion(datosExternos.getDireccion());
                    return dto;
                });
    }

    @Override
    public Optional<ConsultaDocumentoResponse> buscarPorDocumento(String documento) {
        if (documento == null || (documento.length() != 8 && documento.length() != 11)) {
            return Optional.empty();
        }

        if (documento.length() == 11) {
            // --- Flujo para RUC ---
            return this.buscarPorRuc(documento).map(clienteRuc -> {
                ConsultaDocumentoResponse response = new ConsultaDocumentoResponse();
                response.setTipo(ConsultaDocumentoResponse.TipoDocumento.RUC);
                response.setDatosRuc(clienteRuc);
                return response;
            });
        } else { // documento.length() == 8

            // intentar buscar si el DNI tiene un RUC 10 asociado
            Optional<ClienteResponse> rucAsociadoOpt = this.buscarRucAsociadoADni(documento);

            // El DNI tiene RUC?
            if (rucAsociadoOpt.isPresent()) {

                ConsultaDocumentoResponse response = new ConsultaDocumentoResponse();
                response.setTipo(ConsultaDocumentoResponse.TipoDocumento.RUC);
                response.setDatosRuc(rucAsociadoOpt.get());
                return Optional.of(response);
            } else {
                // Buscar los datos de la persona para la boleta
                return this.buscarPorDniSimple(documento).map(clienteDni -> {
                    ConsultaDocumentoResponse response = new ConsultaDocumentoResponse();
                    response.setTipo(ConsultaDocumentoResponse.TipoDocumento.DNI);
                    response.setDatosDni(clienteDni);
                    return response;
                });
            }
        }
    }
}