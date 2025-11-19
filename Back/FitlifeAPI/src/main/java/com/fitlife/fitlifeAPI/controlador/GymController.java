package com.fitlife.fitlifeAPI.controlador;

import com.fitlife.fitlifeAPI.dto.GymRequest;
import com.fitlife.fitlifeAPI.dto.GymResponse;
import com.fitlife.fitlifeAPI.servicios.GymService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gyms")
public class GymController {
    private final GymService service;

    @Autowired
    public GymController(GymService service) { this.service = service; }

    @GetMapping
    public List<GymResponse> list() { return service.list(); }

    @PostMapping
    public ResponseEntity<GymResponse> create(@RequestBody GymRequest r) {
        return ResponseEntity.ok(service.create(r));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GymResponse> update(@PathVariable Integer id, @RequestBody GymRequest r) {
        return ResponseEntity.ok(service.update(id, r));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}