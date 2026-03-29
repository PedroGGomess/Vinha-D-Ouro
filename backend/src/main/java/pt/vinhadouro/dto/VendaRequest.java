package pt.vinhadouro.dto;

import pt.vinhadouro.model.Utilizador;
import pt.vinhadouro.model.Pessoa;
import pt.vinhadouro.model.ItemVenda;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendaRequest {

    @NotNull(message = "Utilizador é obrigatório")
    private Utilizador utilizador;

    private Pessoa cliente;

    @NotNull(message = "Itens são obrigatórios")
    private List<ItemVenda> itens;

}
