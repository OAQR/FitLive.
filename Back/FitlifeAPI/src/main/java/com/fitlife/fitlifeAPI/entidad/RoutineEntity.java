package com.fitlife.fitlifeAPI.entidad;

import jakarta.persistence.*;

@Entity
@Table(name = "routines")
public class RoutineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String level;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    // Constructor sin argumentos
    public RoutineEntity() {
    }

    // Constructor con todos los argumentos
    public RoutineEntity(Integer id, String name, String level, Integer durationMinutes, Integer createdBy) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.durationMinutes = durationMinutes;
        this.createdBy = createdBy;
    }

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }
}