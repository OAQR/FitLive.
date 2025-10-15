package com.facturacion.servicioclientes.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConsultaDocumentoResponse {

    public enum TipoDocumento {
        RUC, DNI
    }

    private TipoDocumento tipo;
    private ClienteResponse datosRuc;
    private DniResponse datosDni;

    public TipoDocumento getTipo() { return tipo; }
    public void setTipo(TipoDocumento tipo) { this.tipo = tipo; }
    public ClienteResponse getDatosRuc() { return datosRuc; }
    public void setDatosRuc(ClienteResponse datosRuc) { this.datosRuc = datosRuc; }
    public DniResponse getDatosDni() { return datosDni; }
    public void setDatosDni(DniResponse datosDni) { this.datosDni = datosDni; }
}