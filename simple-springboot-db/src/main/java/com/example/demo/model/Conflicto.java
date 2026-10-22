package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conflicto")
public class Conflicto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_demandante_id", nullable = false)
    private Usuario usuarioDemandante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_demandado_id", nullable = false)
    private Usuario usuarioDemandado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_conflicto_id", nullable = false)
    private TipoConflicto tipoConflicto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_conflicto_id", nullable = false)
    private EstadoConflicto estadoConflicto;

    @Column(nullable = false, length = 200)
    private String asunto;

    @Column(length = 1000)
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio = LocalDateTime.now();

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(length = 200)
    private String resultado;

    @Column(name = "monto_reclamado")
    private Double montoReclamado;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_alta", nullable = false)
    private LocalDateTime fechaAlta = LocalDateTime.now();

    public Conflicto() {
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuarioDemandante() {
        return usuarioDemandante;
    }

    public void setUsuarioDemandante(Usuario usuarioDemandante) {
        this.usuarioDemandante = usuarioDemandante;
    }

    public Usuario getUsuarioDemandado() {
        return usuarioDemandado;
    }

    public void setUsuarioDemandado(Usuario usuarioDemandado) {
        this.usuarioDemandado = usuarioDemandado;
    }

    public TipoConflicto getTipoConflicto() {
        return tipoConflicto;
    }

    public void setTipoConflicto(TipoConflicto tipoConflicto) {
        this.tipoConflicto = tipoConflicto;
    }

    public EstadoConflicto getEstadoConflicto() {
        return estadoConflicto;
    }

    public void setEstadoConflicto(EstadoConflicto estadoConflicto) {
        this.estadoConflicto = estadoConflicto;
    }

    public String getAsunto() {
        return asunto;
    }

    public void setAsunto(String asunto) {
        this.asunto = asunto;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public Double getMontoReclamado() {
        return montoReclamado;
    }

    public void setMontoReclamado(Double montoReclamado) {
        this.montoReclamado = montoReclamado;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaAlta() {
        return fechaAlta;
    }

    public void setFechaAlta(LocalDateTime fechaAlta) {
        this.fechaAlta = fechaAlta;
    }
}
