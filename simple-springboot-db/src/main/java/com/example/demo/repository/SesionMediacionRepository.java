package com.example.demo.repository;

import com.example.demo.model.SesionMediacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SesionMediacionRepository extends JpaRepository<SesionMediacion, Long> {
    List<SesionMediacion> findByMediacionIdOrderByFechaAsc(Long mediacionId);
}
