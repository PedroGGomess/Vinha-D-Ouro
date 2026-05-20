package pt.vinhadouro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "funcionarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;

    @NotBlank(message = "Posição é obrigatória")
    @Column(nullable = false, length = 100)
    private String posicao;

    @NotNull(message = "Data de admissão é obrigatória")
    @Column(name = "data_admissao", nullable = false)
    private LocalDate dataAdmissao;

    @Column(name = "data_saida")
    private LocalDate dataSaida;

    @Column(name = "salario", precision = 10, scale = 2)
    private Double salario;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

}
