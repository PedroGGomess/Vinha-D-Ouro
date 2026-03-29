package pt.vinhadouro.repository;

import pt.vinhadouro.model.ItemVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemVendaRepository extends JpaRepository<ItemVenda, Long> {
    List<ItemVenda> findByVendaId(Long vendaId);

    @Query("SELECT iv FROM ItemVenda iv WHERE iv.vinho.id = :vinhoId")
    List<ItemVenda> findByVinhoId(@Param("vinhoId") Long vinhoId);
}
