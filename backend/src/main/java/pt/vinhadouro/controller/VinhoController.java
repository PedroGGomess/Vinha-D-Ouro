package pt.vinhadouro.controller;

import pt.vinhadouro.model.Vinho;
import pt.vinhadouro.dto.VinhoStockRequest;
import pt.vinhadouro.service.VinhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vinhos")
public class VinhoController {

    @Autowired
    private VinhoService vinhoService;

    @GetMapping
    public ResponseEntity<List<Vinho>> getAllVinhos() {
        List<Vinho> vinhos = vinhoService.getAllVinhos();
        return ResponseEntity.ok(vinhos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vinho> getVinhoById(@PathVariable Long id) {
        Optional<Vinho> vinho = vinhoService.getVinhoById(id);
        return vinho.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Vinho> createVinho(@Valid @RequestBody Vinho vinho) {
        Vinho createdVinho = vinhoService.createVinho(vinho);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVinho);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vinho> updateVinho(@PathVariable Long id, @Valid @RequestBody Vinho vinhoDetails) {
        Optional<Vinho> updated = vinhoService.updateVinho(id, vinhoDetails);
        return updated.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Vinho> updateStock(@PathVariable Long id, @Valid @RequestBody VinhoStockRequest request) {
        Optional<Vinho> updated = vinhoService.updateStock(id, request.getStock());
        return updated.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/low-stock/list")
    public ResponseEntity<List<Vinho>> getLowStockVinhos() {
        List<Vinho> vinhos = vinhoService.getLowStockVinhos();
        return ResponseEntity.ok(vinhos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Vinho> deleteVinho(@PathVariable Long id) {
        Optional<Vinho> deleted = vinhoService.deleteVinho(id);
        return deleted.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
