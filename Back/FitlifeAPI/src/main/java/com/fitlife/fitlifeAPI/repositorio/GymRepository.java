package com.fitlife.fitlifeAPI.repositorio;

import com.fitlife.fitlifeAPI.entidad.GymEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GymRepository extends JpaRepository<GymEntity, Integer> {}