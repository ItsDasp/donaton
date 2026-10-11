package com.donaton.logistics.repository.impl;

import com.donaton.logistics.model.LogisticsEnvio;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Repository
@Transactional
public class EnvioCustomRepository {

    private final EntityManager entityManager;

    public EnvioCustomRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public long[] getEnvioStatisticsByEstado() {
        long[] stats = new long[4];
        
        String[] estados = {"PENDIENTE_ACOPIO", "EN_TRANSITO", "ENTREGADO", "INEXISTENTE"};
        
        for (int i = 0; i < estados.length; i++) {
            Query query = entityManager.createQuery(
                    "SELECT COUNT(e) FROM LogisticsEnvio e WHERE e.estado = :estado"
            );
            query.setParameter("estado", estados[i]);
            stats[i] = (long) query.getSingleResult();
        }
        
        return stats;
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Object[]> getTotalCantidadByCentro() {
        Query query = entityManager.createQuery(
                "SELECT e.acopioCenterId, SUM(e.cantidadDonada) " +
                "FROM LogisticsEnvio e " +
                "WHERE e.cantidadDonada > 0 " +
                "GROUP BY e.acopioCenterId " +
                "ORDER BY SUM(e.cantidadDonada) DESC"
        );
        
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<LogisticsEnvio> findEnviosProximosAVencer(int dias) {
        Instant ahora = Instant.now();
        Instant limite = ahora.plusSeconds(dias * 24 * 60 * 60L);
        
        Query query = entityManager.createQuery(
                "SELECT e FROM LogisticsEnvio e " +
                "WHERE e.estado = 'PENDIENTE_ACOPIO' " +
                "AND e.acopioDeadline BETWEEN :ahora AND :limite " +
                "ORDER BY e.acopioDeadline ASC"
        );
        query.setParameter("ahora", ahora);
        query.setParameter("limite", limite);
        
        return query.getResultList();
    }

    @Transactional
    public int updateEnvioEstadoBulk(String estadoAnterior, String estadoNuevo, Instant deadline) {
        Query query = entityManager.createQuery(
                "UPDATE LogisticsEnvio e " +
                "SET e.estado = :estadoNuevo " +
                "WHERE e.estado = :estadoAnterior " +
                "AND e.acopioDeadline <= :deadline"
        );
        query.setParameter("estadoAnterior", estadoAnterior);
        query.setParameter("estadoNuevo", estadoNuevo);
        query.setParameter("deadline", deadline);
        
        return query.executeUpdate();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<LogisticsEnvio> getEnviosDetalladosByCentro(String centerId) {
        Query query = entityManager.createQuery(
                "SELECT DISTINCT e FROM LogisticsEnvio e " +
                "WHERE e.acopioCenterId = :centerId " +
                "ORDER BY e.createdAt DESC"
        );
        query.setParameter("centerId", centerId);
        
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public boolean hasPendingEnviosByCentro(String centerId) {
        Query query = entityManager.createQuery(
                "SELECT COUNT(e) > 0 FROM LogisticsEnvio e " +
                "WHERE e.acopioCenterId = :centerId " +
                "AND e.estado IN ('PENDIENTE_ACOPIO', 'EN_TRANSITO')"
        );
        query.setParameter("centerId", centerId);
        
        return (Boolean) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public Double getPromedioTiempoEntrega(String needId) {
        Query query = entityManager.createQuery(
                "SELECT AVG(CAST((e.createdAt) AS long)) FROM LogisticsEnvio e " +
                "WHERE e.needId = :needId AND e.estado = 'ENTREGADO'"
        );
        query.setParameter("needId", needId);
        
        Object result = query.getSingleResult();
        return result != null ? (Double) result : null;
    }
}
