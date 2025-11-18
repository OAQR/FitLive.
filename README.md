---

# FitLive - Sistema de Facturación y Clientes

FitLive es un sistema de facturación y gestión de clientes basado en una arquitectura de microservicios, diseñado específicamente para las operaciones comerciales en Perú. La plataforma consta de dos servicios principales que manejan la gestión de clientes (con validación de RUC/DNI) y la generación de facturas con capacidades de exportación a PDF y códigos QR.

---

## Índice

- [Visión General](#visión-general)
- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Guía de Inicio Rápido](#guía-de-inicio-rápido)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalación y Compilación](#instalación-y-compilación)
  - [Ejecución de los Servicios](#ejecución-de-los-servicios)
- [Uso de la API](#uso-de-la-api)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

---

## Visión General

Este repositorio contiene el código fuente de un sistema de facturación modular y escalable. Cada microservicio es independiente, desplegable de forma autónoma y se comunica a través de APIs REST y una base de datos compartida, siguiendo las mejores prácticas de desarrollo con Spring Boot.

## Características Principales

###  Servicio de Clientes (`servicio-clientes`)

- **Gestión de Clientes (CRUD):** Operaciones completas para crear, leer, actualizar y eliminar registros de clientes.
- **Validación de RUC y DNI:** Integración con la API externa **PeruDevs** para validar números de identificación fiscal (RUC) y de identidad (DNI) peruanos.
- **Estrategia de Caché:** Almacenamiento local de los datos de clientes consultados para minimizar las llamadas a la API externa, mejorar el rendimiento y la disponibilidad.
- **Documentación de API Interactiva:** Exposición de la API a través de Swagger UI para facilitar la exploración y las pruebas.

### Servicio de Facturación (`servicio-facturacion`)

- **Generación de Facturas:** Creación y gestión de registros de facturas.
- **Creación de Documentos PDF:** Generación de facturas en formato PDF listas para imprimir utilizando la librería **OpenPDF**.
- **Incrustación de Códigos QR:** Generación e inserción de códigos QR en las facturas para validación y seguimiento rápido, usando la librería **ZXing**.
- **Vinculación con Clientes:** Capacidad de asociar cada factura a un cliente existente en el sistema.

---

## Arquitectura del Sistema

El sistema sigue un patrón de microservicios con dos componentes principales que se comunican con una base de datos PostgreSQL compartida y un sistema externo para la validación de documentos.

![Diagrama de la Arquitectura del Sistema](Front/src/docs/assets/arquitectura-componentes.svg)

---

## Stack Tecnológico

Ambos servicios comparten una base tecnológica común, garantizando consistencia y facilidad de mantenimiento.

| Tecnología | Versión | Propósito |
| :--- | :--- | :--- |
| **Java** | 21 | Entorno de ejecución y lenguaje |
| **Spring Boot** | 3.5.6 | Framework principal de la aplicación |
| **Spring Data JPA** | 3.5.6 | Capa de persistencia de datos |
| **PostgreSQL** | 42.7.8 | Base de datos de producción |
| **H2 Database** | 2.4.240 | Base de datos en memoria para desarrollo/pruebas |
| **Flyway** | 11.14.0 | Gestión de migraciones de base de datos |
| **Maven** | 3.9.11 | Herramienta de construcción y gestión de dependencias |

#### Dependencias Específicas del Servicio

- **`servicio-clientes`**:
  - `SpringDoc OpenAPI` (2.8.13): Para la documentación automática de la API (Swagger UI).
- **`servicio-facturacion`**:
  - `OpenPDF` (3.0.0): Para la generación de documentos PDF.
  - `ZXing` (3.5.3): Para la generación de códigos QR.

---

## Estructura del Repositorio

![Diagrama de la Estructura del Repositorio](Front/src/docs/assets/estructura-repositorio.svg)

---

## Guía de Inicio Rápido

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- **JDK 21** o superior.
- **Git** para clonar el repositorio.
- (Opcional) Un cliente de base de datos para PostgreSQL.

> **Nota:** No es necesario instalar Maven. El proyecto utiliza **Maven Wrapper** (`mvnw`), que descargará automáticamente la versión correcta.

### Instalación y Compilación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/OAQR/FitLive.git
    cd FitLive
    ```

2.  **Compila el servicio de clientes:**
    ```bash
    cd Back/servicio-clientes
    ./mvnw clean install
    ```

3.  **Compila el servicio de facturación:**
    ```bash
    cd ../servicio-facturacion
    ./mvnw clean install
    ```
    *En Windows, utiliza `mvnw.cmd` en lugar de `./mvnw`.*

### Ejecución de los Servicios

1.  **Inicia el servicio de clientes:**
    ```bash
    cd Back/servicio-clientes
    ./mvnw spring-boot:run
    ```
    El servicio se iniciará en `http://localhost:8080`.

2.  **Inicia el servicio de facturación:**
    Abre una nueva terminal.
    ```bash
    cd Back/servicio-facturacion
    ./mvnw spring-boot:run
    ```
    Este servicio se iniciará en el puerto configurado (por ejemplo, 8081 para evitar conflictos). Asegúrate de tener una instancia de PostgreSQL en ejecución o configura el perfil de desarrollo para usar H2.

---

## Uso de la API

El `servicio-clientes` expone una API REST para la gestión de clientes.

- **URL Base:** `http://localhost:8080/api/v1/clientes`
- **Ejemplo (Buscar cliente por RUC):**
  ```
  GET /api/v1/clientes/ruc/20123456789
  ```
- **Documentación Interactiva (Swagger):**
  Una vez que el servicio esté en ejecución, puedes explorar todos los endpoints de forma interactiva en:
  [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## Contribuciones

Este es un proyecto de portafolio personal y actualmente no se aceptan contribuciones externas. Sin embargo, si encuentras algún error o tienes alguna sugerencia, no dudes en abrir un *Issue* en el repositorio.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
