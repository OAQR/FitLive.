package com.fitlife.fitlifeAPI.dto;

public record ExerciseResponse(
        Integer id,
        String name,
        String description,
        String type,
        Integer estCalories
) {}