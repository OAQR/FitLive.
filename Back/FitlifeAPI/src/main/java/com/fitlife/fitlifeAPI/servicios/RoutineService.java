package com.fitlife.fitlifeAPI.servicios;

import com.fitlife.fitlifeAPI.dto.RoutineRequest;
import com.fitlife.fitlifeAPI.dto.RoutineResponse;
import com.fitlife.fitlifeAPI.entidad.RoutineEntity;
import com.fitlife.fitlifeAPI.repositorio.RoutineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoutineService {

    private final RoutineRepository repo;

    @Autowired
    public RoutineService(RoutineRepository repo) {
        this.repo = repo;
    }

    public RoutineResponse create(RoutineRequest req){
        RoutineEntity routine = new RoutineEntity();
        routine.setName(req.name());
        routine.setLevel(req.level());
        routine.setDurationMinutes(req.duration_minutes());
        routine.setCreatedBy(req.created_by());

        RoutineEntity saved = repo.save(routine);
        return toRes(saved);
    }

    public List<RoutineResponse> list(){
        return repo.findAll(Sort.by("id"))
                .stream().map(this::toRes).collect(Collectors.toList());
    }

    private RoutineResponse toRes(RoutineEntity e){
        return new RoutineResponse(
                e.getId(),
                e.getName(),
                e.getLevel(),
                e.getDurationMinutes(),
                e.getCreatedBy()
        );
    }
}