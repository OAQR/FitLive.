package com.fitlife.fitlifeAPI.dto;

public record GymResponse(
        Integer id,
        String name,
        String brand,
        String address,
        Double lat,
        Double lng,
        Integer totalMachines,
        Integer busyMachines,
        Integer currentClients
) {}