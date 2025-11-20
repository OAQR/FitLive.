package com.facturacion.serviciofacturacion.controller;

import com.facturacion.serviciofacturacion.dto.CreacionFacturaRequest;
import com.facturacion.serviciofacturacion.dto.FacturaResponse;
import com.facturacion.serviciofacturacion.service.FacturaService;
import com.facturacion.serviciofacturacion.service.PdfServiceImpl;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/facturas") // <-- Versionar la API
public class FacturaController {

    private final FacturaService facturaService;
    private final PdfServiceImpl pdfServiceImpl;

    @Autowired
    public FacturaController(FacturaService facturaService, PdfServiceImpl pdfServiceImpl) {
        this.facturaService = facturaService;
        this.pdfServiceImpl = pdfServiceImpl;
    }

    @PostMapping("/crear")
    public ResponseEntity<FacturaResponse> crearNuevaFactura(@RequestBody CreacionFacturaRequest request) {
        FacturaResponse response = facturaService.crearFactura(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> descargarFacturaPdf(@PathVariable Long id) throws IOException, WriterException{
        // 6. El PdfService ahora se encargará de obtener los datos que necesita
        byte[] pdfBytes = pdfServiceImpl.generarFacturaPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "factura-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}