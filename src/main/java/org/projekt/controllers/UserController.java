package org.projekt.controllers;

import org.projekt.dto.PasswordDTO;
import org.projekt.dto.UserDTO;
import org.projekt.dto.UserUpdateDTO;
import org.projekt.models.User;
import org.projekt.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/by-email")
    public UserDTO getUserByEmail(@RequestParam String email) {
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDTO(user.getId(), user.getEmail(), user.getName(), user.getSurname());
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

    @GetMapping("/me")
    public User getMe(Authentication authentication) {
        String email = authentication.getName();// z JWT
        return userService.getUserByEmail(email)
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

    //UPDATE PASSWORD
    @PutMapping("/pass/{id}")
    public ResponseEntity<User> updateUserPassword(
            @PathVariable Long id,
            @RequestBody PasswordDTO dto) {  // teď očekává jen heslo
        User updated = userService.updateUserPassword(id, dto.getPassword());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/verified")
    public ResponseEntity<User> toggleVerified(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean verified = body.get("verified");
        User updated = userService.setVerified(id, verified);
        return ResponseEntity.ok(updated);
    }


    // DELETE
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
