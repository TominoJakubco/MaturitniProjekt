package org.projekt.controllers;

import org.projekt.models.Box;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserBox;
import org.projekt.services.BoxService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    // CREATE - nastaví ownera
    @PostMapping
    public Box createBox(@RequestBody Box box, @AuthenticationPrincipal User user) {
        return boxService.createBox(box, user);
    }

    // IMPORT z Excelu - nastaví ownera
    @PostMapping("/upload")
    public String uploadBoxes(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal User user) {
        boxService.importBoxesFromExcel(file, user);
        return "OK";
    }

    // READ - všechny boxy v DB (pouze admin)
    @GetMapping("/all")
    public List<Box> getAllBoxesAdmin(@AuthenticationPrincipal User user) {
        return boxService.getAllBoxes(user);
    }

    // READ - všechny boxy, které může uživatel vidět (owner nebo shared)
    @GetMapping
    public List<Box> getAllBoxes(@AuthenticationPrincipal User user) {
        return boxService.getVisibleBoxes(user);
    }

    // READ - jeden box podle ID + kontrola přístupu
    @GetMapping("/{id}")
    public Box getBoxById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return boxService.getBoxByIdWithPermission(id, user)
                .orElseThrow(() -> new RuntimeException("Box not found or no permission"));
    }

    // UPDATE - jen owner nebo user s canEdit = true
    @PutMapping("/{id}")
    public Box updateBox(@PathVariable Long id, @RequestBody Box updatedBox, @AuthenticationPrincipal User user) {
        return boxService.updateBoxWithPermission(id, updatedBox, user);
    }

    // DELETE - jen owner nebo user s canEdit = true
    @DeleteMapping("/{id}")
    public void deleteBox(@PathVariable Long id, @AuthenticationPrincipal User user) {
        boxService.deleteBoxWithPermission(id, user);
    }

    // SHARE - přidání přístupu pro jiného uživatele
    @PostMapping("/{id}/share")
    public UserBox shareBox(@PathVariable Long id,
                            @RequestParam Long targetUserId,
                            @RequestParam boolean canView,
                            @RequestParam boolean canEdit,
                            @AuthenticationPrincipal User user) {
        return boxService.shareBox(id, targetUserId, canView, canEdit, user);
    }
}
