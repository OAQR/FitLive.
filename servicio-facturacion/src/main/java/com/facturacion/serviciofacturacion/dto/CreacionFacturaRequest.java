package com.facturacion.serviciofacturacion.dto;

import java.math.BigDecimal;
import java.util.List;

public class CreacionFacturaRequest {

    private String rucCliente;
    private List<ItemRequest> items;

    public static class ItemRequest {
        private String producto;
        private int cantidad;
        private BigDecimal precioUnitario;

        public String getProducto() { return producto; }
        public void setProducto(String producto) { this.producto = producto; }
        public int getCantidad() { return cantidad; }
        public void setCantidad(int cantidad) { this.cantidad = cantidad; }
        public BigDecimal getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    }

    public String getRucCliente() { return rucCliente; }
    public void setRucCliente(String rucCliente) { this.rucCliente = rucCliente; }
    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }
}