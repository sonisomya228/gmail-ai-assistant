package com.email.writer.app;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:5173")
//@CrossOrigin(origins = "https://mail.google.com")
@AllArgsConstructor
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;



    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest email ){
        String response = emailGeneratorService.generateEmailReply(email);
        System.out.println("Reached to Controller Class");
        return ResponseEntity.ok(response);
    }
}
