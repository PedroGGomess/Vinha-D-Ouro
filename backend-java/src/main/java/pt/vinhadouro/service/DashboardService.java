package pt.vinhadouro.service;

import pt.vinhadouro.dto.DashboardDTO;
import pt.vinhadouro.model.Vinho;
import pt.vinhadouro.repository.VinhoRepository;
import pt.vinhadouro.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private VinhoRepository vinhoRepository;

    public DashboardDTO getDashboardData() {
        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioHoje = LocalDate.now().atStartOfDay();
        LocalDateTime fimHoje = LocalDate.now().plusDays(1).atStartOfDay();

        Double totalReceitaHoje = vendaRepository.findTotalReceita(inicioHoje, fimHoje);
        if (totalReceitaHoje == null) {
            totalReceitaHoje = 0.0;
        }

        Long totalVendasHoje = vendaRepository.countByDateRange(inicioHoje, fimHoje);
        if (totalVendasHoje == null) {
            totalVendasHoje = 0L;
        }

        List<Vinho> vinhosEmStock = vinhoRepository.findWithAvailableStock();
        int totalEmStock = vinhosEmStock.size();

        List<Vinho> vinhosBaixoStock = vinhoRepository.findLowStockVinhos();
        int vinhoBaixoStock = vinhosBaixoStock.size();

        DashboardDTO dashboard = new DashboardDTO();
        dashboard.setTotalVendas(totalVendasHoje);
        dashboard.setTotalReceita(totalReceitaHoje);
        dashboard.setVinhosEmStock(totalEmStock);
        dashboard.setVinhoBaixoStock(vinhoBaixoStock);

        return dashboard;
    }

}
