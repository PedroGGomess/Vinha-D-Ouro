package pt.vinhadouro.service;

import pt.vinhadouro.dto.LoginRequest;
import pt.vinhadouro.dto.LoginResponse;
import pt.vinhadouro.model.Utilizador;
import pt.vinhadouro.repository.UtilizadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    public LoginResponse login(LoginRequest loginRequest) {
        Optional<Utilizador> utilizadorOpt = utilizadorRepository.findByUsernameAndPassword(
            loginRequest.getUsername(),
            loginRequest.getPassword()
        );

        if (utilizadorOpt.isEmpty()) {
            return new LoginResponse(null, "Credenciais inválidas", false, null, null);
        }

        Utilizador utilizador = utilizadorOpt.get();

        if (!utilizador.getAtivo()) {
            return new LoginResponse(null, "Utilizador inativo", false, null, null);
        }

        utilizador.setUltimoAcesso(LocalDateTime.now());
        utilizadorRepository.save(utilizador);

        return new LoginResponse(
            utilizador.getId(),
            "Login realizado com sucesso",
            true,
            utilizador.getRole(),
            "/dashboard"
        );
    }

}
