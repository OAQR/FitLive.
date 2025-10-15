package com.facturacion.servicioclientes.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PeruDevsResponse {

    private boolean estado;
    private String mensaje;
    private ClienteData resultado;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ClienteData {
        @JsonProperty("id")
        private String ruc;

        @JsonProperty("razon_social")
        private String razonSocial;

        private String direccion;
        private String estado;
        private String departamento;

        public String getRuc() {
            return ruc;
        }

        public void setRuc(String ruc) {
            this.ruc = ruc;
        }

        public String getRazonSocial() {
            return razonSocial;
        }

        public void setRazonSocial(String razonSocial) {
            this.razonSocial = razonSocial;
        }

        public String getDireccion() {
            return direccion;
        }

        public void setDireccion(String direccion) {
            this.direccion = direccion;
        }

        public String getEstado() {
            return estado;
        }

        public void setEstado(String estado) {
            this.estado = estado;
        }

        public String getDepartamento() {
            return departamento;
        }

        public void setDepartamento(String departamento) {
            this.departamento = departamento;
        }
    }

    public boolean isEstado() {
        return estado;
    }

    public void setEstado(boolean estado) {
        this.estado = estado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public ClienteData getResultado() {
        return resultado;
    }

    public void setResultado(ClienteData resultado) {
        this.resultado = resultado;
    }
}