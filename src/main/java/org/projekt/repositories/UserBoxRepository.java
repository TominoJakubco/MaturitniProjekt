package org.projekt.repositories;

import org.projekt.models.Box;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserBox;
import org.projekt.models.manytomany.UserBoxId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserBoxRepository extends JpaRepository<UserBox, UserBoxId> {

    // Najde přístup pro konkrétního uživatele a box
    Optional<UserBox> findByUserAndBox(User user, Box box);
}
