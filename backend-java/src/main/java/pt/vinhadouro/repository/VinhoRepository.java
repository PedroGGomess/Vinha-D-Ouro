package pt.vinhadouro.repository;

import pt.vinhadouro.model.Vinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VinhoRepository extends JpaRepository<Vinho, Long> {
    @Query("SELECT v FROM Vinho v WHERE v.ativo = true")
    List<Vinho> findAllAtivos();

    @Query("SELECT v FROM Vinho v WHERE v.ativo = true AND v.stock <= v.stockMinimo")
    List<Vinho> findLowStockVinhos();

    @Query("SELECT v FROM Vinho v WHERE v.ativo = true AND v.stock > 0")
    List<Vinho> findWithAvailableStock();
}
