package com.facturacion.serviciofacturacion.service;

import com.facturacion.serviciofacturacion.client.ClienteApiClient;
import com.facturacion.serviciofacturacion.dto.ClienteDTO;
import com.facturacion.serviciofacturacion.entity.FacturaEntity;
import com.facturacion.serviciofacturacion.entity.ItemFacturaEntity;
import com.facturacion.serviciofacturacion.repository.FacturaRepository;
import com.facturacion.serviciofacturacion.util.NumeroLetras;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import org.openpdf.text.Font;
import org.openpdf.text.Image;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;

@Service
public class PdfServiceImpl implements PdfService {

    private static final String EMISOR_RAZON_SOCIAL = "MI EMPRESA TECNOLÓGICA S.A.C.";
    private static final String EMISOR_RUC = "20123456789";
    private static final String EMISOR_DIRECCION = "AV. PRINCIPAL 123, LIMA, LIMA, PERU";

    private final FacturaRepository facturaRepository;
    private final ClienteApiClient clienteApiClient;

    @Autowired
    public PdfServiceImpl(FacturaRepository facturaRepository, ClienteApiClient clienteApiClient) {
        this.facturaRepository = facturaRepository;
        this.clienteApiClient = clienteApiClient;
    }

    @Override
    public byte[] generarFacturaPdf(Long facturaId) throws IOException, WriterException, DocumentException {
        FacturaEntity factura = facturaRepository.findById(facturaId)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada con ID: " + facturaId));

        ClienteDTO cliente = clienteApiClient.getClientePorRuc(factura.getRucCliente())
                .orElseThrow(() -> new RuntimeException("Datos del cliente no encontrados para RUC: " + factura.getRucCliente()));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);

        document.open();

        Font fontHeader = new Font(Font.HELVETICA, 12, Font.BOLD);
        Font fontTitulo = new Font(Font.HELVETICA, 16, Font.BOLD, Color.BLUE);
        Font fontSubTitulo = new Font(Font.HELVETICA, 10, Font.BOLD);
        Font fontNormal = new Font(Font.HELVETICA, 9, Font.NORMAL);
        Font fontBold = new Font(Font.HELVETICA, 9, Font.BOLD);

        PdfPTable headerTable = new PdfPTable(3);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{3f, 4f, 3f}); // Proporciones de las columnas
        headerTable.getDefaultCell().setBorder(PdfPCell.NO_BORDER);

        // Columna 1: Logo
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(PdfPCell.NO_BORDER);
        try (InputStream logoStream = getClass().getClassLoader().getResourceAsStream("images/logo.png")) {
            if (logoStream != null) {
                byte[] logoBytes = logoStream.readAllBytes();
                Image logo = Image.getInstance(logoBytes);
                logo.scaleToFit(80, 80); // tamaño del logo
                logoCell.addElement(logo);
            } else {
                logoCell.addElement(new Paragraph("Logo no encontrado"));
            }
        } catch (IOException | NullPointerException e) {
            System.err.println("No se pudo cargar el logo: " + e.getMessage());
            logoCell.addElement(new Paragraph("Error al cargar logo"));
        }
        headerTable.addCell(logoCell);

        // Columna 2: Datos del Emisor
        PdfPCell emisorCell = new PdfPCell();
        emisorCell.setBorder(PdfPCell.NO_BORDER);
        emisorCell.addElement(new Paragraph(EMISOR_RAZON_SOCIAL, fontHeader)); // <-- CORREGIDO
        emisorCell.addElement(new Paragraph("RUC: " + EMISOR_RUC, fontNormal)); // <-- CORREGIDO
        emisorCell.addElement(new Paragraph(EMISOR_DIRECCION, fontNormal));
        headerTable.addCell(""); // Placeholder para logo
        headerTable.addCell(emisorCell);

        // Columna 3: Caja de Factura
        PdfPTable rucTable = new PdfPTable(1);
        PdfPCell rucCell = new PdfPCell(new Paragraph("FACTURA ELECTRÓNICA", fontTitulo));
        rucCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        rucTable.addCell(rucCell);
        PdfPCell numeroCell = new PdfPCell(new Paragraph("RUC: " + EMISOR_RUC, fontBold));
        numeroCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        rucTable.addCell(numeroCell);
        PdfPCell serieCell = new PdfPCell(new Paragraph(factura.getSerie() + " - " + factura.getCorrelativo(), fontBold));
        serieCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        rucTable.addCell(serieCell);
        headerTable.addCell(rucTable);

        document.add(headerTable);
        document.add(new Paragraph("\n"));

        // --- 2. ZONA: DATOS DEL CLIENTE ---
        PdfPTable clienteTable = new PdfPTable(1);
        clienteTable.setWidthPercentage(100);
        PdfPCell clienteHeaderCell = new PdfPCell(new Paragraph("DATOS DEL CLIENTE", fontSubTitulo));
        clienteHeaderCell.setBackgroundColor(Color.LIGHT_GRAY);
        clienteTable.addCell(clienteHeaderCell);

        String clienteInfo = "Razón Social: " + cliente.getRazon_social() + "\n" +
                "RUC: " + cliente.getRuc() + "\n" +
                "Dirección: " + cliente.getDireccion();
        clienteTable.addCell(new Paragraph(clienteInfo, fontNormal));
        document.add(clienteTable);
        document.add(new Paragraph("\n"));

        // --- 3. ZONA: TABLA DE ITEMS ---
        PdfPTable itemsTable = new PdfPTable(5);
        itemsTable.setWidthPercentage(100);
        itemsTable.setWidths(new float[]{1f, 5f, 1.5f, 1.5f, 2f});
        // Encabezados
        itemsTable.addCell(new Paragraph("Cant.", fontBold));
        itemsTable.addCell(new Paragraph("Descripción", fontBold));
        itemsTable.addCell(new Paragraph("V. Unitario", fontBold));
        itemsTable.addCell(new Paragraph("P. Unitario", fontBold));
        itemsTable.addCell(new Paragraph("Importe", fontBold));

        DecimalFormat df = new DecimalFormat("#,##0.00");
        for (ItemFacturaEntity item : factura.getItems()) {
            itemsTable.addCell(new Paragraph(String.valueOf(item.getCantidad()), fontNormal));
            itemsTable.addCell(new Paragraph(item.getProducto(), fontNormal));

            BigDecimal valorUnitario = item.getPrecioUnitario(); // Asumimos que el precio es sin IGV
            itemsTable.addCell(new Paragraph(df.format(valorUnitario), fontNormal));

            BigDecimal precioUnitario = valorUnitario.multiply(new BigDecimal("1.18")).setScale(2, RoundingMode.HALF_UP);
            itemsTable.addCell(new Paragraph(df.format(precioUnitario), fontNormal));

            BigDecimal importe = valorUnitario.multiply(new BigDecimal(item.getCantidad()));
            itemsTable.addCell(new Paragraph(df.format(importe), fontNormal));
        }
        document.add(itemsTable);

        // --- 4. ZONA: TOTALES ---
        document.add(new Paragraph("\n"));
        PdfPTable totalesTable = new PdfPTable(2);
        totalesTable.setWidthPercentage(40);
        totalesTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalesTable.getDefaultCell().setBorder(PdfPCell.NO_BORDER);

        totalesTable.addCell(new Paragraph("Subtotal:", fontNormal));
        totalesTable.addCell(new Paragraph("S/ " + df.format(factura.getSubtotal()), fontNormal));
        totalesTable.addCell(new Paragraph("IGV (18%):", fontNormal));
        totalesTable.addCell(new Paragraph("S/ " + df.format(factura.getTotalIgv()), fontNormal));
        totalesTable.addCell(new Paragraph("IMPORTE TOTAL:", fontBold));
        totalesTable.addCell(new Paragraph("S/ " + df.format(factura.getImporteTotal()), fontBold));
        document.add(totalesTable);

        document.add(new Paragraph("\n"));
        String importeEnLetras = new NumeroLetras().convertir(factura.getImporteTotal().toString(), "SOLES", true);
        Paragraph montoEnLetras = new Paragraph("SON: " + importeEnLetras, fontBold);
        document.add(montoEnLetras);

        // --- 5. ZONA: PIE (QR y HASH) ---
        document.add(new Paragraph("\n\n"));
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{2f, 8f});
        footerTable.getDefaultCell().setBorder(PdfPCell.NO_BORDER);

        String qrData = String.join("|",
                "20123456789",
                "01", // Factura
                factura.getSerie(),
                factura.getCorrelativo(),
                factura.getTotalIgv().toString(),
                factura.getImporteTotal().toString(),
                factura.getFechaEmision().toString(),
                "6", // RUC
                cliente.getRuc()
        );

        // Columna QR
        Image qrImage = generarCodigoQR(qrData, 100);
        PdfPCell qrCell = new PdfPCell(qrImage);
        qrCell.setBorder(PdfPCell.NO_BORDER);
        qrCell.setVerticalAlignment(Element.ALIGN_TOP);
        footerTable.addCell(qrCell);

        // Columna Hash y Leyendas
        PdfPCell leyendasCell = new PdfPCell();
        leyendasCell.setBorder(PdfPCell.NO_BORDER);
        leyendasCell.setVerticalAlignment(Element.ALIGN_TOP);
        leyendasCell.addElement(new Paragraph("HASH: " + factura.getCodigoHash(), new Font(Font.COURIER, 7)));
        leyendasCell.addElement(new Paragraph("\nEsta es una representación impresa de la Factura Electrónica, generada en el sistema.", fontNormal));
        leyendasCell.addElement(new Paragraph("Puede verificarla utilizando su clave SOL en el portal de SUNAT.", fontNormal));
        footerTable.addCell(leyendasCell);

        document.add(footerTable);

        document.close();
        return baos.toByteArray();
    }

    /**
     * Método auxiliar para generar una imagen de Código QR a partir de un texto.
     *
     * @param data Los datos a codificar en el QR.
     * @param size El tamaño (ancho y alto) de la imagen en píxeles.
     * @return Un objeto Image de OpenPDF.
     * */
        private Image generarCodigoQR(String data, int size) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, size, size);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();

        return Image.getInstance(pngData);
    }
}