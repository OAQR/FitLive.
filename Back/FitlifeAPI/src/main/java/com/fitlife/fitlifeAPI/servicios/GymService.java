package com.fitlife.fitlifeAPI.servicios;

import com.fitlife.fitlifeAPI.dto.GymRequest;
import com.fitlife.fitlifeAPI.dto.GymResponse;
import com.fitlife.fitlifeAPI.entidad.GymEntity;
import com.fitlife.fitlifeAPI.repositorio.GymRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GymService {
    private final GymRepository repo;

    @Autowired
    public GymService(GymRepository repo) { this.repo = repo; }

    public GymResponse create(GymRequest r) {
        GymEntity e = new GymEntity();
        mapRequestToEntity(r, e);
        return toResponse(repo.save(e));
    }

    public List<GymResponse> list() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GymResponse update(Integer id, GymRequest r) {
        GymEntity e = repo.findById(id).orElseThrow(() -> new RuntimeException("Gym not found"));
        mapRequestToEntity(r, e);
        return toResponse(repo.save(e));
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }

    private void mapRequestToEntity(GymRequest r, GymEntity e) {
        e.setName(r.name());
        e.setBrand(r.brand());
        e.setAddress(r.address());
        e.setLat(r.lat());
        e.setLng(r.lng());
        e.setTotalMachines(r.totalMachines());
        e.setBusyMachines(r.busyMachines());
        e.setCurrentClients(r.currentClients());
    }

    private GymResponse toResponse(GymEntity e) {
        return new GymResponse(e.getId(), e.getName(),  e.getBrand(), e.getAddress(), e.getLat(), e.getLng(),
                e.getTotalMachines(), e.getBusyMachines(), e.getCurrentClients());
    }
}