package org.projekt.services;

import org.projekt.dto.UserUpdateDTO;
import org.projekt.models.User;
import org.projekt.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE
    public User createUser(User user) {
        System.out.println("Received user: " + user.getEmail());
        return userRepository.save(user);
    }

    // READ - všechni uživatelé
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ - jeden podle ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // UPDATE
    public User updateUser(Long id, UserUpdateDTO dto) {
        return userRepository.findById(id).map(user -> {
            user.setEmail(dto.getEmail());
            user.setName(dto.getName());
            user.setSurname(dto.getSurname());

            // Hashujeme heslo jen pokud bylo vyplněno
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(dto.getPassword()));
            }

            user.setRole(dto.getRole());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }


    // DELETE
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
