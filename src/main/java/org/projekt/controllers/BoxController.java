package org.projekt.controllers;

import org.projekt.models.Box;
import org.projekt.models.User;
import org.projekt.services.BoxService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/boxes")
public class BoxController {

    private final BoxService boxService;

    public BoxController(BoxService boxService) {
        this.boxService = boxService;
    }

    // CREATE
    @PostMapping
    public Box createBox(@RequestBody Box box) {
        System.out.println("Received user: " + box.getName());
        return boxService.createUser(box);
    }

    @PostMapping("/upload")
    public String uploadBoxes(@RequestParam("file") MultipartFile file) {
        boxService.importBoxesFromExcel(file);
        return "OK";
    }


    // READ - všechny
    @GetMapping
    public List<Box> getAllBoxes() {
        return boxService.getAllBoxes();
    }

    // READ - jeden podle ID
    @GetMapping("/{id}")
    public Box getBoxById(@PathVariable Long id) {
        return boxService.getBoxById(id)
                .orElseThrow(() -> new RuntimeException("Box not found"));
    }

    // UPDATE
    @PutMapping("/{id}")
    public Box updateBox(@PathVariable Long id, @RequestBody Box updatedBox) {
        return boxService.updateBox(id, updatedBox);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteBox(@PathVariable Long id) {
        boxService.deleteBox(id);
    }
}
