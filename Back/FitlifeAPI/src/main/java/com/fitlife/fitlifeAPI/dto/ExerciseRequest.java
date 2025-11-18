package com.fitlife.fitlifeAPI.dto;


import jakarta.validation.constraints.*;

public record ExerciseRequest (

    @NotBlank String name,
    String description,
    @Pattern(regexp = "STRENGTH|CARDIO|HIIT|MOBILITY") String type,
    @Min(0) Integer estCalories
) {}

