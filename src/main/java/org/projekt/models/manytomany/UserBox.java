package org.projekt.models.manytomany;

import jakarta.persistence.*;
import org.projekt.models.Box;
import org.projekt.models.User;

@Entity
@Table(name = "user_box")
public class UserBox {

    @EmbeddedId
    private UserBoxId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("boxId")
    @JoinColumn(name = "box_id")
    private Box box;

    private boolean canView = true;
    private boolean canEdit = false;

    // Konstruktor
    public UserBox() {}

    public UserBox(User user, Box box, boolean canView, boolean canEdit) {
        this.user = user;
        this.box = box;
        this.canView = canView;
        this.canEdit = canEdit;
        this.id = new UserBoxId(user.getId(), box.getId());
    }

    // ===== UserBox getters and setters =====
    public UserBoxId getId() {
        return id;
    }

    public void setId(UserBoxId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Box getBox() {
        return box;
    }

    public void setBox(Box box) {
        this.box = box;
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
