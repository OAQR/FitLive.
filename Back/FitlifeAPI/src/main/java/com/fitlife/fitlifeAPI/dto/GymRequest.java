package com.fitlife.fitlifeAPI.dto;

public record GymRequest(
        String name,
        String brand,
        String address,
        Double lat,
        Double lng,
        Integer totalMachines,
        Integer busyMachines,
        Integer currentClients
) {}