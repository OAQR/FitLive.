package com.fitlife.fitlifeAPI.servicios;

import com.fitlife.fitlifeAPI.dto.ExerciseRequest;
import com.fitlife.fitlifeAPI.dto.ExerciseResponse;
import com.fitlife.fitlifeAPI.entidad.ExerciseEntity;
import com.fitlife.fitlifeAPI.repositorio.ExerciseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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

    public Optional<ExerciseResponse> getById(Integer id) {
        return repo.findById(id).map(this::toRes);
    }

    public ExerciseResponse update(Integer id, ExerciseRequest r) {
        ExerciseEntity entity = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Exercise not found with id: " + id));

        entity.setName(r.name());
        entity.setDescription(r.description());
        entity.setType(r.type());
        entity.setEstCalories(r.estCalories() == null ? 0 : r.estCalories());

        ExerciseEntity updatedEntity = repo.save(entity);
        return toRes(updatedEntity);
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Exercise not found with id: " + id);
        }
        repo.deleteById(id);
    }
}