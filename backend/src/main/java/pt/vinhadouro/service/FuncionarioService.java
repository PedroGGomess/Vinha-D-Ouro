package pt.vinhadouro.service;

import pt.vinhadouro.model.Funcionario;
import pt.vinhadouro.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    public List<Funcionario> getAllFuncionarios() {
        return funcionarioRepository.findAllAtivos();
    }

    public Optional<Funcionario> getFuncionarioById(Long id) {
        return funcionarioRepository.findById(id);
    }

    public Funcionario createFuncionario(Funcionario funcionario) {
        funcionario.setAtivo(true);
        return funcionarioRepository.save(funcionario);
    }

    public Optional<Funcionario> updateFuncionario(Long id, Funcionario funcionarioDetails) {
        return funcionarioRepository.findById(id).map(funcionario -> {
            if (funcionarioDetails.getPosicao() != null) {
                funcionario.setPosicao(funcionarioDetails.getPosicao());
            }
            if (funcionarioDetails.getSalario() != null) {
                funcionario.setSalario(funcionarioDetails.getSalario());
            }
            if (funcionarioDetails.getDataSaida() != null) {
                funcionario.setDataSaida(funcionarioDetails.getDataSaida());
            }
            return funcionarioRepository.save(funcionario);
        });
    }

    public Optional<Funcionario> deactivateFuncionario(Long id) {
        return funcionarioRepository.findById(id).map(funcionario -> {
            funcionario.setAtivo(false);
            return funcionarioRepository.save(funcionario);
        });
    }

}
