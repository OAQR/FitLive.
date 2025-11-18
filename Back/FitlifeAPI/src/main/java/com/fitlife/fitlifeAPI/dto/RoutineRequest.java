package com.fitlife.fitlifeAPI.dto;

import jakarta.validation.constraints.*;

public record RoutineRequest(
        @NotBlank String name,
        @Pattern(regexp="BEGINNER|INTERMEDIATE|ADVANCED") String level,
        @PositiveOrZero Integer duration_minutes,
        @NotNull Integer created_by
) {}