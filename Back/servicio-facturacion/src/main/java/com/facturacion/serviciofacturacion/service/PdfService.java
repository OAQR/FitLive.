package com.facturacion.serviciofacturacion.service;

import com.google.zxing.WriterException;
import java.io.IOException;

public interface PdfService {
    byte[] generarFacturaPdf(Long facturaId) throws IOException, WriterException;
}