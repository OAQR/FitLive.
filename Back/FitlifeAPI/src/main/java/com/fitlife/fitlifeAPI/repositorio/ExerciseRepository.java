package com.fitlife.fitlifeAPI.repositorio;

import com.fitlife.fitlifeAPI.entidad.ExerciseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<ExerciseEntity, Integer> {}
