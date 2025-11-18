package com.fitlife.fitlifeAPI.dto;

import jakarta.validation.constraints.NotNull;

//DTO
public record RoutineExerciseRequest(
        @NotNull Integer routineId,
        @NotNull Integer exerciseId,
        Integer ord,
        Integer sets,
        Integer reps,
        Integer seconds
) {}