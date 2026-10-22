package com.example.demo.repository;

import com.example.demo.model.TipoConflicto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoConflictoRepository extends JpaRepository<TipoConflicto, Long> {
}
