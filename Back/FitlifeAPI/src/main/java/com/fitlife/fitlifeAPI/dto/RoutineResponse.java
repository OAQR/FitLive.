package com.fitlife.fitlifeAPI.dto;

import java.lang.annotation.Documented;


public record RoutineResponse(
        Integer id, String name, String level, Integer duration_minutes, Integer created_by
) {}
