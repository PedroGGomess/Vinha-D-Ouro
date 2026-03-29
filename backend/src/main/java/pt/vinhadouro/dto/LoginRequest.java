package pt.vinhadouro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Nome de utilizador é obrigatório")
    private String username;

    @NotBlank(message = "Senha é obrigatória")
    private String password;

}
