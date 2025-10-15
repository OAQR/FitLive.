package com.facturacion.serviciofacturacion.client;

import com.facturacion.serviciofacturacion.dto.ClienteDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

@Component
public class ClienteApiClient {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String clienteServiceBaseUrl;

    public ClienteApiClient(@Value("${api.clientes.base-url}") String clienteServiceBaseUrl) {
        this.clienteServiceBaseUrl = clienteServiceBaseUrl;
    }

    public Optional<ClienteDTO> getClientePorRuc(String ruc) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(clienteServiceBaseUrl + "/ruc/" + ruc))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                ClienteDTO cliente = objectMapper.readValue(response.body(), ClienteDTO.class);
                return Optional.of(cliente);
            } else {
                System.err.println("El servicio de clientes respondió con un código de error: " + response.statusCode());
            }

        } catch (IOException | InterruptedException e) {
            System.err.println("Error de conexión al llamar al servicio de clientes: " + e.getMessage());
        }

        return Optional.empty();
    }
}