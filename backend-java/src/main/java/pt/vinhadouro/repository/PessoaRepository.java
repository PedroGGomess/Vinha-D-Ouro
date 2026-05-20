package pt.vinhadouro.repository;

import pt.vinhadouro.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
    Optional<Pessoa> findByNif(String nif);
    Optional<Pessoa> findByEmail(String email);
}
