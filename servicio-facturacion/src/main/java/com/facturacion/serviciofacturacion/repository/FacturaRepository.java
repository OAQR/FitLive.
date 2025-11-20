package com.facturacion.serviciofacturacion.repository;

import com.facturacion.serviciofacturacion.entity.FacturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<FacturaEntity, Long> {

    Optional<FacturaEntity> findBySerieAndCorrelativo(String serie, String correlativo);

}