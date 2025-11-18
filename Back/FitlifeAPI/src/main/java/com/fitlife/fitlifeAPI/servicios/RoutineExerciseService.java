package com.fitlife.fitlifeAPI.servicios;

import com.fitlife.fitlifeAPI.dto.RoutineExerciseRequest;
import com.fitlife.fitlifeAPI.dto.RoutineExerciseResponse;
import com.fitlife.fitlifeAPI.entidad.ExerciseEntity;
import com.fitlife.fitlifeAPI.entidad.RoutineEntity;
import com.fitlife.fitlifeAPI.entidad.RoutineExerciseEntity;
import com.fitlife.fitlifeAPI.repositorio.ExerciseRepository;
import com.fitlife.fitlifeAPI.repositorio.RoutineExerciseRepository;
import com.fitlife.fitlifeAPI.repositorio.RoutineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoutineExerciseService {

    private final RoutineExerciseRepository repo;
    private final RoutineRepository routineRepo;
    private final ExerciseRepository exerciseRepo;

    @Autowired
    public RoutineExerciseService(RoutineExerciseRepository repo, RoutineRepository routineRepo, ExerciseRepository exerciseRepo) {
        this.repo = repo;
        this.routineRepo = routineRepo;
        this.exerciseRepo = exerciseRepo;
    }

    public RoutineExerciseResponse create(RoutineExerciseRequest r){
        RoutineEntity routine = routineRepo.findById(r.routineId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        ExerciseEntity exercise = exerciseRepo.findById(r.exerciseId())
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        RoutineExerciseEntity re = new RoutineExerciseEntity();
        re.setRoutine(routine);
        re.setExercise(exercise);
        re.setOrd(r.ord());
        re.setSets(r.sets());
        re.setReps(r.reps());
        re.setSeconds(r.seconds());

        repo.save(re);
        return toRes(re);
    }

    public List<RoutineExerciseResponse> list(){
        return repo.findAll().stream().map(this::toRes).collect(Collectors.toList());
    }

    private RoutineExerciseResponse toRes(RoutineExerciseEntity e){
        return new RoutineExerciseResponse(
                e.getId(),
                e.getRoutine().getId(),
                e.getExercise().getId(),
                e.getExercise().getName(),
                e.getOrd(),
                e.getSets(),
                e.getReps(),
                e.getSeconds()
        );
    }
}