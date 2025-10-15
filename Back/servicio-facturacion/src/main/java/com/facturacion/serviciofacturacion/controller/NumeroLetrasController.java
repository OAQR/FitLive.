package com.facturacion.serviciofacturacion.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.facturacion.serviciofacturacion.util.NumeroLetras;

@RestController
@RequestMapping("/api/v1/numeroletra")
public class NumeroLetrasController {
    private final static Logger logger = LoggerFactory.getLogger(NumeroLetrasController.class);

    @GetMapping("/")
    public ResponseEntity<String> convertir(
            @RequestParam(name = "numero") String numero,
            @RequestParam(name = "moneda", required = false) String codigoMoneda,
            @RequestParam(name = "mayusculas", defaultValue = "false") boolean mayusculas) {

        logger.info("Petición a /numeroletra: numero={}, moneda={}, mayusculas={}", numero, codigoMoneda, mayusculas);

        NumeroLetras conversor = new NumeroLetras();
        String resultado = conversor.convertir(numero, codigoMoneda, mayusculas);

        if (resultado.toLowerCase().contains("inválido") || resultado.toLowerCase().contains("error")) {
            logger.error("Error en la conversión: {}", resultado);
            return new ResponseEntity<>(resultado, HttpStatus.BAD_REQUEST);
        }

        logger.info("Resultado: {}", resultado);
        return new ResponseEntity<>(resultado, HttpStatus.OK);
    }
}