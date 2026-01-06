package org.projekt.repositories;

import org.projekt.models.Container;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserContainer;
import org.projekt.models.manytomany.UserContainerId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserContainerRepository extends JpaRepository<UserContainer, UserContainerId> {

    // Najde přístup pro konkrétního uživatele a container
    Optional<UserContainer> findByUserAndContainer(User user, Container container);
}
