package org.projekt.models.manytomany;

import jakarta.persistence.*;
import org.projekt.models.Container;
import org.projekt.models.User;

@Entity
@Table(name = "user_container")
public class UserContainer {

    @EmbeddedId
    private UserContainerId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("containerId")
    @JoinColumn(name = "container_id")
    private Container container;

    private boolean canView = true;
    private boolean canEdit = false;

    // ===== Konstruktor =====
    public UserContainer() {}

    public UserContainer(User user, Container container, boolean canView, boolean canEdit) {
        this.user = user;
        this.container = container;
        this.canView = canView;
        this.canEdit = canEdit;
        this.id = new UserContainerId(user.getId(), container.getId());
    }

    // ===== Gettery a settery =====
    public UserContainerId getId() {
        return id;
    }

    public void setId(UserContainerId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Container getContainer() {
        return container;
    }

    public void setContainer(Container container) {
        this.container = container;
    }

    public boolean isCanView() {
        return canView;
    }

    public void setCanView(boolean canView) {
        this.canView = canView;
    }

    public boolean isCanEdit() {
        return canEdit;
    }

    public void setCanEdit(boolean canEdit) {
        this.canEdit = canEdit;
    }
}
