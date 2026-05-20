package pt.vinhadouro.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VinhoStockRequest {

    @NotNull(message = "Stock é obrigatório")
    @Min(value = 0, message = "Stock não pode ser negativo")
    private Integer stock;

}
