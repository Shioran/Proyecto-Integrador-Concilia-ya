package com.example.demo.repository;

import com.example.demo.model.Conflicto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConflictoRepository extends JpaRepository<Conflicto, Long> {

    List<Conflicto> findAllByOrderByFechaInicioDesc();

    @Query("select c from Conflicto c where c.activo = true and "
         + "(c.usuarioDemandante.id = :uid or c.usuarioDemandado.id = :uid) order by c.fechaInicio desc")
    List<Conflicto> findVisiblesParaParte(@Param("uid") Long uid);

    @Query("select c from Conflicto c where c.activo = true and exists "
         + "(select 1 from Mediacion m where m.conflicto = c and m.usuarioMediador.id = :uid) "
         + "order by c.fechaInicio desc")
    List<Conflicto> findVisiblesParaMediador(@Param("uid") Long uid);

    /** Bloqueo pesimista para serializar asignaciones/dictámenes concurrentes sobre un mismo conflicto. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Conflicto c where c.id = :id")
    Optional<Conflicto> findByIdForUpdate(@Param("id") Long id);
}
