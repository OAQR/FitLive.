package com.fitlife.fitlifeAPI.controlador;

import com.fitlife.fitlifeAPI.dto.RoutineRequest;
import com.fitlife.fitlifeAPI.dto.RoutineResponse;
import com.fitlife.fitlifeAPI.servicios.RoutineService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService service;

    @Autowired
    public RoutineController(RoutineService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> create(@Valid @RequestBody RoutineRequest req){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public List<RoutineResponse> list(){
        return service.list();
    }
}