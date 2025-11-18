package com.fitlife.fitlifeAPI.controlador;

import com.fitlife.fitlifeAPI.dto.ExerciseRequest;
import com.fitlife.fitlifeAPI.dto.ExerciseResponse;
import com.fitlife.fitlifeAPI.servicios.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService service;

    @Autowired
    public ExerciseController(ExerciseService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExerciseResponse> create(@Valid @RequestBody ExerciseRequest r){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));
    }

    @GetMapping
    public List<ExerciseResponse> list(){
        return service.list();
    }
}