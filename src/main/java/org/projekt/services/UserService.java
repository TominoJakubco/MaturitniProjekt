package org.projekt.services;

import org.projekt.dto.UserUpdateDTO;
import org.projekt.models.User;
import org.projekt.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;
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
            user.setRole(dto.getRole());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    //UPDATE
    public User updateUserPassword(Long id, String newPassword) {
        return userRepository.findById(id).map(user -> {
            if (newPassword != null && !newPassword.isBlank()) {
                user.setPassword(passwordEncoder.encode(newPassword));
            }
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User setVerified(Long id, boolean verified) {
        return userRepository.findById(id).map(user -> {
            user.setVerified(verified);
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // DELETE
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
