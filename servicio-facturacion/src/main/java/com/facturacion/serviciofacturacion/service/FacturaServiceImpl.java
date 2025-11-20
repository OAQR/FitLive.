package com.facturacion.serviciofacturacion.service;

import com.facturacion.serviciofacturacion.client.ClienteApiClient;
import com.facturacion.serviciofacturacion.dto.CreacionFacturaRequest;
import com.facturacion.serviciofacturacion.dto.FacturaResponse;
import com.facturacion.serviciofacturacion.entity.FacturaEntity;
import com.facturacion.serviciofacturacion.mapper.FacturaMapper;
import com.facturacion.serviciofacturacion.repository.FacturaRepository;
import com.facturacion.serviciofacturacion.util.NumeroLetras;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class FacturaServiceImpl implements FacturaService {

    private final FacturaRepository facturaRepository;
    private final ClienteApiClient clienteApiClient;
    private final FacturaMapper facturaMapper;

    @Autowired
    public FacturaServiceImpl(FacturaRepository facturaRepository,
                              ClienteApiClient clienteApiClient,
                              FacturaMapper facturaMapper) {
        this.facturaRepository = facturaRepository;
        this.clienteApiClient = clienteApiClient;
        this.facturaMapper = facturaMapper;
    }

    @Override
    @Transactional
    public FacturaResponse crearFactura(CreacionFacturaRequest request) {
        clienteApiClient.getClientePorRuc(request.getRucCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con RUC: " + request.getRucCliente()));

        FacturaEntity facturaEntity = facturaMapper.toEntity(request);

        facturaEntity.setFechaEmision(LocalDate.now());
        facturaEntity.setSerie("F001");
        facturaEntity.setCorrelativo(String.format("%08d", facturaRepository.count() + 1));
        facturaEntity.setMoneda("PEN");
        facturaEntity.setCodigoHash(java.util.UUID.randomUUID().toString().replace("-", ""));

        BigDecimal subtotal = facturaEntity.getItems().stream()
                .map(item -> item.getPrecioUnitario().multiply(new BigDecimal(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tasaIgv = new BigDecimal("0.18");
        BigDecimal totalIgv = subtotal.multiply(tasaIgv);
        BigDecimal importeTotal = subtotal.add(totalIgv);

        facturaEntity.setSubtotal(subtotal);
        facturaEntity.setTotalIgv(totalIgv);
        facturaEntity.setImporteTotal(importeTotal);

        FacturaEntity facturaGuardada = facturaRepository.save(facturaEntity);

        String importeEnLetras = new NumeroLetras().convertir(facturaGuardada.getImporteTotal().toString(), "SOLES", true);
        String mensaje = "Factura creada exitosamente. Total a pagar: " + importeEnLetras;

        return facturaMapper.toResponse(facturaGuardada, mensaje);
    }
}