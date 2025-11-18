package com.fitlife.fitlifeAPI.entidad;

import jakarta.persistence.*;

@Entity
@Table(name="exercises")
public class ExerciseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable=false)
    private String name;

    private String description;

    @Column(nullable=false)
    private String type; // STRENGTH | CARDIO | HIIT | MOBILITY

    private Integer estCalories;

    // Constructor sin argumentos (requerido por JPA)
    public ExerciseEntity() {
    }

    // Constructor con todos los argumentos
    public ExerciseEntity(Integer id, String name, String description, String type, Integer estCalories) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.estCalories = estCalories;
    }

    // Getters y Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getEstCalories() {
        return estCalories;
    }

    public void setEstCalories(Integer estCalories) {
        this.estCalories = estCalories;
    }
}