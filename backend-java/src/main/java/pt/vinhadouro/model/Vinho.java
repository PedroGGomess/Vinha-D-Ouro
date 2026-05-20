package pt.vinhadouro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vinhos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome do vinho é obrigatório")
    @Column(nullable = false, length = 255)
    private String nome;

    @NotBlank(message = "Tipo é obrigatório")
    @Column(nullable = false, length = 100)
    private String tipo;

    @Column(length = 255)
    private String descricao;

    @Column(length = 100)
    private String regiao;

    @Column(name = "ano_colheita")
    private Integer anoColheita;

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.0", inclusive = false, message = "Preço deve ser maior que 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private Double preco;

    @NotNull(message = "Stock é obrigatório")
    @Column(nullable = false)
    private Integer stock;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 5;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
    }

}
