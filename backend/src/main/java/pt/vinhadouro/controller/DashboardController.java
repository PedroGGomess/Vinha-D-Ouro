package pt.vinhadouro.controller;

import pt.vinhadouro.dto.DashboardDTO;
import pt.vinhadouro.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        DashboardDTO dashboard = dashboardService.getDashboardData();
        return ResponseEntity.ok(dashboard);
    }

}
