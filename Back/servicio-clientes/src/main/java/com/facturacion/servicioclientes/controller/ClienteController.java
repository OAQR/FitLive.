package com.facturacion.servicioclientes.controller;

import com.facturacion.servicioclientes.dto.ClienteResponse;
import com.facturacion.servicioclientes.dto.ConsultaDocumentoResponse;
import com.facturacion.servicioclientes.dto.DniResponse;
import com.facturacion.servicioclientes.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    @Autowired
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @Operation(summary = "Buscar un cliente por su número de RUC",
            description = "Busca un cliente primero en la base de datos local. Si no lo encuentra, consulta un servicio externo y guarda el resultado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente encontrado",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ClienteResponse.class)) }),
            @ApiResponse(responseCode = "404", description = "Cliente no encontrado",
                    content = @Content)
    })

    @GetMapping("/ruc/{numeroRuc}")
    public ResponseEntity<ClienteResponse> obtenerClientePorRuc(
            @Parameter(description = "Número de RUC de 11 dígitos del cliente a buscar.")
            @PathVariable String numeroRuc) {

        return clienteService.buscarPorRuc(numeroRuc)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Buscar datos básicos de una persona por su DNI")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Datos de DNI encontrados"),
            @ApiResponse(responseCode = "404", description = "DNI no encontrado")
    })

    @GetMapping("/dni/{numeroDni}")
    public ResponseEntity<DniResponse> obtenerClientePorDni(
            @Parameter(description = "Número de DNI de 8 dígitos.")
            @PathVariable String numeroDni) {

        return clienteService.buscarPorDniSimple(numeroDni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Buscar si un DNI tiene un RUC 10 asociado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "RUC asociado encontrado (devuelve datos de cliente/RUC)"),
            @ApiResponse(responseCode = "404", description = "El DNI no tiene un RUC asociado")
    })
    @GetMapping("/dni/{numeroDni}/ruc-asociado")
    public ResponseEntity<ClienteResponse> obtenerRucAsociadoADni(
            @Parameter(description = "Número de DNI de 8 dígitos.")
            @PathVariable String numeroDni) {

        return clienteService.buscarRucAsociadoADni(numeroDni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @Operation(summary = "Busca un cliente por DNI (8 dígitos) o RUC (11 dígitos)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documento encontrado. El cuerpo de la respuesta indicará si es de tipo RUC o DNI."),
            @ApiResponse(responseCode = "404", description = "Documento no encontrado")
    })
    @GetMapping("/documento/{numeroDocumento}")
    public ResponseEntity<ConsultaDocumentoResponse> buscarPorDocumento(
            @Parameter(description = "Número de DNI (8 dígitos) o RUC (11 dígitos).")
            @PathVariable String numeroDocumento) {

        return clienteService.buscarPorDocumento(numeroDocumento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}