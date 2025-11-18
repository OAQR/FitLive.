package com.fitlife.fitlifeAPI.dto;

public record RoutineExerciseResponse(
        Integer id,
        Integer routineId,
        Integer exerciseId,
        String exerciseName,
        Integer ord,
        Integer sets,
        Integer reps,
        Integer seconds
) {}