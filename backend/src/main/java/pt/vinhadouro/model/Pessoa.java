package pt.vinhadouro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pessoas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false, length = 255)
    private String nome;

    @Column(length = 20)
    private String telefone;

    @Column(length = 255)
    private String email;

    @Column(length = 500)
    private String endereco;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;

    @Column(name = "nif", length = 20)
    private String nif;

}
