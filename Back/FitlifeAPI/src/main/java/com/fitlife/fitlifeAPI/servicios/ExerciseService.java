package com.fitlife.fitlifeAPI.servicios;

import com.fitlife.fitlifeAPI.dto.ExerciseRequest;
import com.fitlife.fitlifeAPI.dto.ExerciseResponse;
import com.fitlife.fitlifeAPI.entidad.ExerciseEntity;
import com.fitlife.fitlifeAPI.repositorio.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    private final ExerciseRepository repo;

    @Autowired
    public ExerciseService(ExerciseRepository repo) {
        this.repo = repo;
    }

    public ExerciseResponse create(ExerciseRequest r){
        ExerciseEntity e = new ExerciseEntity();
        e.setName(r.name());
        e.setDescription(r.description());
        e.setType(r.type());
        e.setEstCalories(r.estCalories() == null ? 0 : r.estCalories());

        repo.save(e);
        return toRes(e);
    }

    public List<ExerciseResponse> list(){
        return repo.findAll().stream().map(this::toRes).collect(Collectors.toList());
    }

    private ExerciseResponse toRes(ExerciseEntity e){
        return new ExerciseResponse(e.getId(), e.getName(), e.getDescription(), e.getType(), e.getEstCalories());
    }
}