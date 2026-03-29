package pt.vinhadouro.service;

import pt.vinhadouro.model.Vinho;
import pt.vinhadouro.repository.VinhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class VinhoService {

    @Autowired
    private VinhoRepository vinhoRepository;

    public List<Vinho> getAllVinhos() {
        return vinhoRepository.findAllAtivos();
    }

    public Optional<Vinho> getVinhoById(Long id) {
        return vinhoRepository.findById(id);
    }

    public Vinho createVinho(Vinho vinho) {
        vinho.setAtivo(true);
        return vinhoRepository.save(vinho);
    }

    public Optional<Vinho> updateVinho(Long id, Vinho vinhoDetails) {
        return vinhoRepository.findById(id).map(vinho -> {
            if (vinhoDetails.getNome() != null) {
                vinho.setNome(vinhoDetails.getNome());
            }
            if (vinhoDetails.getTipo() != null) {
                vinho.setTipo(vinhoDetails.getTipo());
            }
            if (vinhoDetails.getDescricao() != null) {
                vinho.setDescricao(vinhoDetails.getDescricao());
            }
            if (vinhoDetails.getRegiao() != null) {
                vinho.setRegiao(vinhoDetails.getRegiao());
            }
            if (vinhoDetails.getAnoColheita() != null) {
                vinho.setAnoColheita(vinhoDetails.getAnoColheita());
            }
            if (vinhoDetails.getPreco() != null) {
                vinho.setPreco(vinhoDetails.getPreco());
            }
            if (vinhoDetails.getStockMinimo() != null) {
                vinho.setStockMinimo(vinhoDetails.getStockMinimo());
            }
            return vinhoRepository.save(vinho);
        });
    }

    public Optional<Vinho> updateStock(Long id, Integer novoStock) {
        return vinhoRepository.findById(id).map(vinho -> {
            vinho.setStock(novoStock);
            return vinhoRepository.save(vinho);
        });
    }

    public Optional<Vinho> decreaseStock(Long id, Integer quantidade) {
        return vinhoRepository.findById(id).map(vinho -> {
            int novoStock = vinho.getStock() - quantidade;
            if (novoStock < 0) {
                throw new IllegalArgumentException("Stock insuficiente para o vinho: " + vinho.getNome());
            }
            vinho.setStock(novoStock);
            return vinhoRepository.save(vinho);
        });
    }

    public List<Vinho> getLowStockVinhos() {
        return vinhoRepository.findLowStockVinhos();
    }

    public List<Vinho> getVinhosWithAvailableStock() {
        return vinhoRepository.findWithAvailableStock();
    }

    public Optional<Vinho> deleteVinho(Long id) {
        return vinhoRepository.findById(id).map(vinho -> {
            vinho.setAtivo(false);
            return vinhoRepository.save(vinho);
        });
    }

}
