package com.facturacion.servicioclientes.external;

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
public class PeruDevsAdapter {

    private final String API_KEY;
    private final HttpClient clienteHttp = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PeruDevsAdapter(@Value("${api.perudevs.key}") String apiKey) {
        this.API_KEY = apiKey;
    }

    /**
     * Llama a la API de PeruDevs para obtener datos de un RUC.
     * @param ruc El RUC a consultar.
     * @return Un Optional con los datos de la respuesta externa si tiene éxito.
     */
    public Optional<PeruDevsResponse.ClienteData> consultarRuc(String ruc) {
        String urlCompleta = String.format("https://api.perudevs.com/api/v1/ruc?document=%s&key=%s", ruc, API_KEY);
        HttpRequest solicitud = HttpRequest.newBuilder().uri(URI.create(urlCompleta)).build();

        try {
            HttpResponse<String> respuestaHttp = clienteHttp.send(solicitud, HttpResponse.BodyHandlers.ofString());

            if (respuestaHttp.statusCode() == 200) {
                PeruDevsResponse respuestaApi = objectMapper.readValue(respuestaHttp.body(), PeruDevsResponse.class);
                if (respuestaApi.isEstado() && respuestaApi.getResultado() != null) {
                    return Optional.of(respuestaApi.getResultado());
                }
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("Error al conectar con la API de PeruDevs: " + e.getMessage());
        }

        return Optional.empty();
    }

    /**
     * Llama a la API de PeruDevs para buscar un RUC 10 asociado a un DNI.
     * @param dni El DNI a consultar.
     * @return Un Optional con los datos del RUC si se encuentra.
     */
    public Optional<PeruDevsResponse.ClienteData> consultarRucAsociadoADni(String dni) {
        String urlCompleta = String.format("https://api.perudevs.com/api/v1/dni/ruc-validate?document=%s&key=%s", dni, API_KEY);
        HttpRequest solicitud = HttpRequest.newBuilder().uri(URI.create(urlCompleta)).build();
        try {
            HttpResponse<String> respuestaHttp = clienteHttp.send(solicitud, HttpResponse.BodyHandlers.ofString());
            if (respuestaHttp.statusCode() == 200) {
                PeruDevsResponse respuestaApi = objectMapper.readValue(respuestaHttp.body(), PeruDevsResponse.class);
                if (respuestaApi.isEstado() && respuestaApi.getResultado() != null) {
                    return Optional.of(respuestaApi.getResultado());
                }
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("Error al conectar con la API de PeruDevs (ruc-validate): " + e.getMessage());
        }
        return Optional.empty();
    }

    /**
     * Llama a la API de PeruDevs para una consulta simple de DNI.
     * @param dni El DNI a consultar.
     * @return Un Optional con los datos de la persona si se encuentra.
     */
    public Optional<PeruDevsDniResponse.DniData> consultarDniSimple(String dni) {
        String urlCompleta = String.format("https://api.perudevs.com/api/v1/dni/simple?document=%s&key=%s", dni, API_KEY);
        HttpRequest solicitud = HttpRequest.newBuilder().uri(URI.create(urlCompleta)).build();
        try {
            HttpResponse<String> respuestaHttp = clienteHttp.send(solicitud, HttpResponse.BodyHandlers.ofString());
            if (respuestaHttp.statusCode() == 200) {
                PeruDevsDniResponse respuestaApi = objectMapper.readValue(respuestaHttp.body(), PeruDevsDniResponse.class);
                if (respuestaApi.isEstado() && respuestaApi.getResultado() != null) {
                    return Optional.of(respuestaApi.getResultado());
                }
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("Error al conectar con la API de PeruDevs (dni-simple): " + e.getMessage());
        }
        return Optional.empty();
    }
}