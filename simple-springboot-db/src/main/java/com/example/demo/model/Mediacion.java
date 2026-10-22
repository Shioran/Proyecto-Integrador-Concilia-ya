package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Mediación de un conflicto. El estado vive solo en Conflicto; "activo" = mediación en curso. */
@Entity
@Table(name = "mediacion")
public class Mediacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conflicto_id", nullable = false)
    private Conflicto conflicto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_mediador_id", nullable = false)
    private Usuario usuarioMediador;

    @Column(name = "fecha_programada")
    private LocalDateTime fechaProgramada;

    @Column(length = 200)
    private String lugar;

    @Column(length = 1000)
    private String observaciones;

    /** ACUERDO | SIN_ACUERDO (null mientras está en curso). */
    @Column(length = 200)
    private String resultado;

    /** Texto del dictamen del mediador. */
    @Column(length = 2000)
    private String dictamen;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(nullable = false)
    private Boolean activo = true;

    public Mediacion() {}

    public Long getId() { return id; }
    public Conflicto getConflicto() { return conflicto; }
    public void setConflicto(Conflicto conflicto) { this.conflicto = conflicto; }
    public Usuario getUsuarioMediador() { return usuarioMediador; }
    public void setUsuarioMediador(Usuario usuarioMediador) { this.usuarioMediador = usuarioMediador; }
    public LocalDateTime getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDateTime fechaProgramada) { this.fechaProgramada = fechaProgramada; }
    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }
    public String getDictamen() { return dictamen; }
    public void setDictamen(String dictamen) { this.dictamen = dictamen; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
