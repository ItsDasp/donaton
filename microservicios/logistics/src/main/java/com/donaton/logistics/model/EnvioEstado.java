package com.donaton.logistics.model;

public final class EnvioEstado {
    public static final String PENDIENTE_ACOPIO = "pendiente_acopio";
    public static final String RECIBIDA = "recibida";
    public static final String EN_CAMINO = "en_camino";
    public static final String ENTREGADO = "entregado";
    public static final String INEXISTENTE = "inexistente";

    private EnvioEstado() {
    }
}
