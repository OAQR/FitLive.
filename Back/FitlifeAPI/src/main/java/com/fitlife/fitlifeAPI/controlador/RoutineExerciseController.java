package com.fitlife.fitlifeAPI.controlador;

import com.fitlife.fitlifeAPI.dto.RoutineExerciseRequest;
import com.fitlife.fitlifeAPI.dto.RoutineExerciseResponse;
import com.fitlife.fitlifeAPI.servicios.RoutineExerciseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/routine-exercises")
public class RoutineExerciseController {

    private final RoutineExerciseService service;

    @Autowired
    public RoutineExerciseController(RoutineExerciseService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RoutineExerciseResponse> create(@Valid @RequestBody RoutineExerciseRequest req){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public List<RoutineExerciseResponse> list(){
        return service.list();
    }
}