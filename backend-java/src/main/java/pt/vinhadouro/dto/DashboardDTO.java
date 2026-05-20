package pt.vinhadouro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    private Long totalVendas;
    private Double totalReceita;
    private Integer vinhosEmStock;
    private Integer vinhoBaixoStock;

}
