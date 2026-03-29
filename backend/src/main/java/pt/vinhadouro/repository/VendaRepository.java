package pt.vinhadouro.repository;

import pt.vinhadouro.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {
    @Query("SELECT v FROM Venda v ORDER BY v.dataVenda DESC")
    List<Venda> findAllOrderByDataVendaDesc();

    @Query("SELECT v FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
    List<Venda> findByDateRange(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT SUM(v.total) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
    Double findTotalReceita(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(v) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
    Long countByDateRange(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
