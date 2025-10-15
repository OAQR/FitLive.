package com.facturacion.serviciofacturacion.repository;

import com.facturacion.serviciofacturacion.entity.ItemFacturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemFacturaRepository extends JpaRepository<ItemFacturaEntity, Long> {

    // List<ItemFacturaEntity> findByProducto(String producto);
}