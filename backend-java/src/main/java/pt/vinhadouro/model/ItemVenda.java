package pt.vinhadouro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "itens_venda")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Venda é obrigatória")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id", nullable = false)
    private Venda venda;

    @NotNull(message = "Vinho é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vinho_id", nullable = false)
    private Vinho vinho;

    @NotNull(message = "Quantidade é obrigatória")
    @Positive(message = "Quantidade deve ser positiva")
    @Column(nullable = false)
    private Integer quantidade;

    @NotNull(message = "Preço unitário é obrigatório")
    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private Double precoUnitario;

    @Column(name = "subtotal", precision = 12, scale = 2, nullable = false)
    private Double subtotal;

    @PostLoad
    @PrePersist
    @PreUpdate
    public void calculateSubtotal() {
        if (precoUnitario != null && quantidade != null) {
            this.subtotal = precoUnitario * quantidade;
        }
    }

}
