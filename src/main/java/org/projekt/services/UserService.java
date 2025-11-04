package org.projekt.services;

import org.projekt.models.User;
import org.projekt.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setEmail(updatedUser.getEmail());
            user.setName(updatedUser.getName());
            user.setSurname(updatedUser.getSurname());

            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                // jen pokud je plaintext, zahoď kontrolu, případně poznáš podle délky hash
                if (!updatedUser.getPassword().startsWith("$2a$")) { // bcrypt hash začíná $2a$
                    user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                } else {
                    user.setPassword(updatedUser.getPassword()); // už je hash
                }
            }

            user.setRole(updatedUser.getRole());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // DELETE
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
