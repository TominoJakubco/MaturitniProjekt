package org.projekt.controllers;

import org.projekt.dto.UserUpdateDTO;
import org.projekt.models.User;
import org.projekt.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // CREATE
    @PostMapping
    public User createUser(@RequestBody User user) {
        System.out.println("Received user: " + user.getEmail());
        return userService.createUser(user);
    }

    // READ - všechny
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // READ - jeden podle ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // UserController.java
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateDTO dto) {
        User updated = userService.updateUser(id, dto);
        return ResponseEntity.ok(updated);
    }


    // DELETE
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
