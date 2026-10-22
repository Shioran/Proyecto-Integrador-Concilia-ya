package com.example.demo.repository;

import com.example.demo.model.Mediacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediacionRepository extends JpaRepository<Mediacion, Long> {

    boolean existsByConflictoIdAndActivoTrue(Long conflictoId);

    boolean existsByConflictoIdAndUsuarioMediadorId(Long conflictoId, Long mediadorId);

    Optional<Mediacion> findFirstByConflictoIdOrderByIdDesc(Long conflictoId);

    List<Mediacion> findAllByOrderByIdDesc();

    List<Mediacion> findByUsuarioMediadorIdOrderByIdDesc(Long mediadorId);

    @Query("select m from Mediacion m where m.conflicto.usuarioDemandante.id = :uid "
         + "or m.conflicto.usuarioDemandado.id = :uid order by m.id desc")
    List<Mediacion> findByParte(@Param("uid") Long uid);
}
