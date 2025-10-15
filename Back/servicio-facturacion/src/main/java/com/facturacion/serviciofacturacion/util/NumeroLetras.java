package com.facturacion.serviciofacturacion.util;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

        public class NumeroLetras {

            private static final String[] UNIDADES = {
                    "", "UN ", "DOS ", "TRES ", "CUATRO ", "CINCO ", "SEIS ", "SIETE ", "OCHO ", "NUEVE ", "DIEZ ",
                    "ONCE ", "DOCE ", "TRECE ", "CATORCE ", "QUINCE ", "DIECISEIS ", "DIECISIETE ", "DIECIOCHO ",
                    "DIECINUEVE ", "VEINTE "
            };

            private static final String[] DECENAS = {
                    "VEINTI", "TREINTA ", "CUARENTA ", "CINCUENTA ", "SESENTA ", "SETENTA ", "OCHENTA ", "NOVENTA ", "CIEN "
            };

            private static final String[] CENTENAS = {
                    "CIENTO ", "DOSCIENTOS ", "TRESCIENTOS ", "CUATROCIENTOS ", "QUINIENTOS ", "SEISCIENTOS ",
                    "SETECIENTOS ", "OCHOCIENTOS ", "NOVECIENTOS "
            };

            // Soporte para números grandes
            private static final String[][] GRUPOS = {
                    {"", ""}, // Nivel 0
                    {"MIL ", "MIL "}, // Nivel 1
                    {"MILLÓN ", "MILLONES "}, // Nivel 2
                    {"MIL ", "MIL "}, // Nivel 3 (de Millones)
                    {"BILLÓN ", "BILLONES "}, // Nivel 4
                    {"MIL ", "MIL "}, // Nivel 5 (de Billones)
                    {"TRILLÓN ", "TRILLONES "}, // Nivel 6
                    {"MIL ", "MIL "}, // Nivel 7 (de Trillones)
                    {"CUATRILLÓN ", "CUATRILLONES "}, // Nivel 8
                    {"MIL ", "MIL "}, // etc.
                    {"QUINTILLÓN ", "QUINTILLONES "},
                    {"MIL ", "MIL "},
                    {"SEXTILLÓN ", "SEXTILLONES "},
                    {"MIL ", "MIL "},
                    {"SEPTILLÓN ", "SEPTILLONES "},
                    {"MIL ", "MIL "},
                    {"OCTILLÓN ", "OCTILLONES "},
                    {"MIL ", "MIL "},
                    {"NONILLÓN ", "NONILLONES "},
                    {"MIL ", "MIL "},
                    {"DECILLÓN ", "DECILLONES "},
                    {"MIL ", "MIL "},
                    {"UNDECILLÓN ", "UNDECILLONES "},
                    {"MIL ", "MIL "},
                    {"DUODECILLÓN ", "DUODECILLONES "}
            };

            /**
             * Clase para almacenar la información de la moneda de forma estructurada.
             */
            public record Moneda(String pais, String codigo, String singular, String plural, String decimalSingular, String decimalPlural, String simbolo) {}

            // Mapa estático para un acceso eficiente a las monedas por su código ISO 4217
            private static final Map<String, Moneda> MONEDAS = Stream.of(
                    new Moneda("Colombia", "COP", "PESO COLOMBIANO", "PESOS COLOMBIANOS", "CENTAVO", "CENTAVOS", "$"),
                    new Moneda("Estados Unidos", "USD", "DÓLAR", "DÓLARES", "CENTAVO", "CENTAVOS", "US$"),
                    new Moneda("Europa", "EUR", "EURO", "EUROS", "CÉNTIMO", "CÉNTIMOS", "€"),
                    new Moneda("México", "MXN", "PESO MEXICANO", "PESOS MEXICANOS", "CENTAVO", "CENTAVOS", "$"),
                    new Moneda("Perú", "PEN", "NUEVO SOL", "NUEVOS SOLES", "CÉNTIMO", "CÉNTIMOS", "S/."),
                    new Moneda("Reino Unido", "GBP", "LIBRA", "LIBRAS", "PENIQUE", "PENIQUES", "£")
            ).collect(Collectors.toMap(Moneda::codigo, m -> m));


            /**
             * Método principal para convertir un número a su representación en palabras.
             *
             * @param valor      El número a convertir. Puede ser un entero o un decimal.
             * @param codigoMoneda El código de la moneda (ej. "COP", "USD", "EUR"). Si es nulo o vacío, no se añadirá texto de moneda.
             * @param mayusculas   true para devolver el resultado en mayúsculas, false para minúsculas tipo título.
             * @return El número representado en palabras con la moneda especificada.
             */
            public String convertir(String valor, String codigoMoneda, boolean mayusculas) {
                if (valor == null || valor.isEmpty()) {
                    return "Valor inválido";
                }

                try {
                    BigDecimal numero = new BigDecimal(valor.replace(",", ".")).setScale(2, RoundingMode.HALF_UP);

                    BigInteger parteEntera = numero.toBigInteger();
                    int parteDecimal = numero.remainder(BigDecimal.ONE).multiply(new BigDecimal(100)).abs().intValue();

                    Moneda moneda = (codigoMoneda != null && !codigoMoneda.isBlank()) ? MONEDAS.get(codigoMoneda.toUpperCase()) : null;

                    String literalEntero = convertirEntero(parteEntera);

                    // Ajuste gramatical: "UNO" se convierte en "UN" antes de la moneda
                    if (literalEntero.endsWith("UNO ")) {
                        literalEntero = literalEntero.substring(0, literalEntero.length() - 2) + " ";
                    }

                    StringBuilder resultado = new StringBuilder(literalEntero);

                    if (moneda != null) {
                        resultado.append(parteEntera.equals(BigInteger.ONE) ? moneda.singular() : moneda.plural());
                    }

                    if (parteDecimal > 0) {
                        resultado.append(" CON ");
                        String literalDecimal = convertirEntero(BigInteger.valueOf(parteDecimal));

                        // Ajuste gramatical para la parte decimal
                        if (literalDecimal.endsWith("UNO ")) {
                            literalDecimal = literalDecimal.substring(0, literalDecimal.length() - 2) + " ";
                        }

                        resultado.append(literalDecimal);
                        if (moneda != null) {
                            resultado.append(parteDecimal == 1 ? moneda.decimalSingular() : moneda.decimalPlural());
                        }
                    }

                    String resultadoFinal = capitalizar(resultado.toString().trim().replaceAll("\\s+", " "), mayusculas);
                    return resultadoFinal;

                } catch (NumberFormatException e) {
                    return "Formato de número inválido";
                } catch (Exception e) {
                    return "Error al convertir el número: " + e.getMessage();
                }
            }

            private String convertirEntero(BigInteger n) {
                if (n.equals(BigInteger.ZERO)) {
                    return "CERO ";
                }

                String numeroStr = n.toString();
                List<String> grupos = new ArrayList<>();

                // Dividir el número en grupos de 3 desde la derecha
                int longitud = numeroStr.length();
                for (int i = longitud; i > 0; i -= 3) {
                    grupos.add(numeroStr.substring(Math.max(0, i - 3), i));
                }

                List<String> partes = new ArrayList<>();
                for (int i = 0; i < grupos.size(); i++) {
                    int valorGrupo = Integer.parseInt(grupos.get(i));
                    if (valorGrupo == 0) {
                        continue;
                    }

                    String textoGrupo = convertirGrupo(grupos.get(i));

                    // Aplicar la lógica de escala (MILLONES, BILLONES, etc.)
                    if (i > 0) {
                        // Ajuste gramatical: "UNO" se convierte en "UN" antes de "MIL", "MILLÓN", etc.
                        if (valorGrupo == 1 && i % 2 != 0) { // Si es "MIL"
                            textoGrupo = ""; // "UN MIL" se convierte en "MIL"
                        } else if (textoGrupo.equals("UNO ")) {
                            textoGrupo = "UN ";
                        }

                        String[] nombresGrupo = GRUPOS[i];
                        partes.add(nombresGrupo[valorGrupo == 1 ? 0 : 1]);
                    }
                    partes.add(textoGrupo);
                }

                Collections.reverse(partes);

                // Unir las partes y realizar limpiezas finales
                String resultado = String.join("", partes);

                // Limpieza final: "MIL MILLONES" -> Se maneja por el orden de los GRUPOS.
                // Evitar "UN MIL" -> "MIL".
                if (resultado.startsWith("UN MIL ")) {
                    resultado = resultado.substring(3);
                }

                return resultado;
            }

            private String convertirGrupo(String numero) {
                int n = Integer.parseInt(numero);

                if (n == 0) {
                    return "";
                } else if (n == 100) {
                    return "CIEN ";
                }

                StringBuilder sb = new StringBuilder();
                int centenas = n / 100;
                int decenasYUnidades = n % 100;

                if (centenas > 0) {
                    sb.append(CENTENAS[centenas - 1]);
                }

                if (decenasYUnidades > 0) {
                    if (decenasYUnidades <= 20) {
                        sb.append(UNIDADES[decenasYUnidades]);
                    } else {
                        int decena = decenasYUnidades / 10;
                        int unidad = decenasYUnidades % 10;

                        if (decena == 2) { // Caso "VEINTI..."
                            sb.append(DECENAS[0]).append(UNIDADES[unidad].toLowerCase().trim()).append(" ");
                        } else {
                            sb.append(DECENAS[decena - 2]);
                            if (unidad > 0) {
                                sb.append("Y ").append(UNIDADES[unidad]);
                            }
                        }
                    }
                }
                return sb.toString();
            }

            private String capitalizar(String texto, boolean todoMayusculas) {
                if (texto == null || texto.isEmpty()) return "";

                if (todoMayusculas) {
                    return texto.toUpperCase();
                } else {
                    // Capitalización tipo título
                    String[] palabras = texto.toLowerCase().split(" ");
                    StringBuilder resultado = new StringBuilder();
                    for (String palabra : palabras) {
                        if (!palabra.isEmpty()) {
                            resultado.append(Character.toUpperCase(palabra.charAt(0)))
                                    .append(palabra.substring(1))
                                    .append(" ");
                        }
                    }
                    return resultado.toString().trim();
                }
            }
        }