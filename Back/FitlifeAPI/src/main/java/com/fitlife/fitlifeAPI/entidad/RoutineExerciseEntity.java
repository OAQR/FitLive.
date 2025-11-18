package com.fitlife.fitlifeAPI.entidad;

import jakarta.persistence.*;

@Entity
@Table(name = "routine_exercises")
public class RoutineExerciseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "routine_id", nullable = false)
    private RoutineEntity routine;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private ExerciseEntity exercise;

    private Integer ord;
    private Integer sets;
    private Integer reps;
    private Integer seconds;

    // Constructor sin argumentos
    public RoutineExerciseEntity() {
    }

    // Constructor con todos los argumentos
    public RoutineExerciseEntity(Integer id, RoutineEntity routine, ExerciseEntity exercise, Integer ord, Integer sets, Integer reps, Integer seconds) {
        this.id = id;
        this.routine = routine;
        this.exercise = exercise;
        this.ord = ord;
        this.sets = sets;
        this.reps = reps;
        this.seconds = seconds;
    }

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public RoutineEntity getRoutine() { return routine; }
    public void setRoutine(RoutineEntity routine) { this.routine = routine; }
    public ExerciseEntity getExercise() { return exercise; }
    public void setExercise(ExerciseEntity exercise) { this.exercise = exercise; }
    public Integer getOrd() { return ord; }
    public void setOrd(Integer ord) { this.ord = ord; }
    public Integer getSets() { return sets; }
    public void setSets(Integer sets) { this.sets = sets; }
    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }
    public Integer getSeconds() { return seconds; }
    public void setSeconds(Integer seconds) { this.seconds = seconds; }
}