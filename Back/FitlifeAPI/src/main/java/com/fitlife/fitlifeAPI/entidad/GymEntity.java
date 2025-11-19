package com.fitlife.fitlifeAPI.entidad;

import jakarta.persistence.*;

@Entity
@Table(name = "gyms")
public class GymEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;
    private String brand;
    private String address;
    private Double lat;
    private Double lng;

    @Column(name = "total_machines")
    private Integer totalMachines;

    @Column(name = "busy_machines")
    private Integer busyMachines;

    @Column(name = "current_clients")
    private Integer currentClients;

    public GymEntity() {}

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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
    }

    public Integer getTotalMachines() {
        return totalMachines;
    }

    public void setTotalMachines(Integer totalMachines) {
        this.totalMachines = totalMachines;
    }

    public Integer getBusyMachines() {
        return busyMachines;
    }

    public void setBusyMachines(Integer busyMachines) {
        this.busyMachines = busyMachines;
    }

    public Integer getCurrentClients() {
        return currentClients;
    }

    public void setCurrentClients(Integer currentClients) {
        this.currentClients = currentClients;
    }
}