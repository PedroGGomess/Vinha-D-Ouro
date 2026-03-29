package pt.vinhadouro.service;

import pt.vinhadouro.model.Venda;
import pt.vinhadouro.model.ItemVenda;
import pt.vinhadouro.model.Vinho;
import pt.vinhadouro.repository.VendaRepository;
import pt.vinhadouro.repository.ItemVendaRepository;
import pt.vinhadouro.repository.VinhoRepository;
import pt.vinhadouro.dto.VendaRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ItemVendaRepository itemVendaRepository;

    @Autowired
    private VinhoRepository vinhoRepository;

    @Autowired
    private VinhoService vinhoService;

    public List<Venda> getAllVendas() {
        return vendaRepository.findAllOrderByDataVendaDesc();
    }

    public Optional<Venda> getVendaById(Long id) {
        return vendaRepository.findById(id);
    }

    @Transactional
    public Venda createVenda(VendaRequest vendaRequest) {
        Venda venda = new Venda();
        venda.setUtilizador(vendaRequest.getUtilizador());
        venda.setCliente(vendaRequest.getCliente());
        venda.setDataVenda(LocalDateTime.now());
        venda.setStatus("COMPLETADA");

        Double totalVenda = 0.0;

        List<ItemVenda> itens = vendaRequest.getItens();
        if (itens != null && !itens.isEmpty()) {
            for (ItemVenda item : itens) {
                Optional<Vinho> vinhoOpt = vinhoRepository.findById(item.getVinho().getId());

                if (vinhoOpt.isEmpty()) {
                    throw new IllegalArgumentException("Vinho não encontrado: " + item.getVinho().getId());
                }

                Vinho vinho = vinhoOpt.get();

                if (vinho.getStock() < item.getQuantidade()) {
                    throw new IllegalArgumentException("Stock insuficiente para: " + vinho.getNome());
                }

                item.setVenda(venda);
                item.setPrecoUnitario(vinho.getPreco());
                item.calculateSubtotal();

                totalVenda += item.getSubtotal();

                vinho.setStock(vinho.getStock() - item.getQuantidade());
                vinhoRepository.save(vinho);
            }

            venda.setItens(itens);
        }

        venda.setTotal(totalVenda);
        return vendaRepository.save(venda);
    }

    public List<ItemVenda> getVendaItens(Long vendaId) {
        return itemVendaRepository.findByVendaId(vendaId);
    }

    public Double getTotalReceita(LocalDateTime inicio, LocalDateTime fim) {
        Double total = vendaRepository.findTotalReceita(inicio, fim);
        return total != null ? total : 0.0;
    }

    public Long countVendas(LocalDateTime inicio, LocalDateTime fim) {
        Long count = vendaRepository.countByDateRange(inicio, fim);
        return count != null ? count : 0L;
    }

    public List<Venda> getVendasByDateRange(LocalDateTime inicio, LocalDateTime fim) {
        return vendaRepository.findByDateRange(inicio, fim);
    }

}
