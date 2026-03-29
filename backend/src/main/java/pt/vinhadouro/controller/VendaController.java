package pt.vinhadouro.controller;

import pt.vinhadouro.model.Venda;
import pt.vinhadouro.model.ItemVenda;
import pt.vinhadouro.dto.VendaRequest;
import pt.vinhadouro.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @GetMapping
    public ResponseEntity<List<Venda>> getAllVendas() {
        List<Venda> vendas = vendaService.getAllVendas();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venda> getVendaById(@PathVariable Long id) {
        Optional<Venda> venda = vendaService.getVendaById(id);
        return venda.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createVenda(@Valid @RequestBody VendaRequest vendaRequest) {
        try {
            Venda venda = vendaService.createVenda(vendaRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(venda);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao criar venda: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/itens")
    public ResponseEntity<List<ItemVenda>> getVendaItens(@PathVariable Long id) {
        List<ItemVenda> itens = vendaService.getVendaItens(id);
        return ResponseEntity.ok(itens);
    }

    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

}
