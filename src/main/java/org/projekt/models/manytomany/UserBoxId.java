package org.projekt.models.manytomany;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserBoxId implements Serializable {

    private Long userId;
    private Long boxId;

    public UserBoxId() {}

    public UserBoxId(Long userId, Long boxId) {
        this.userId = userId;
        this.boxId = boxId;
    }

    // ===== Gettery a Settery =====
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBoxId() { return boxId; }
    public void setBoxId(Long boxId) { this.boxId = boxId; }

    // ===== equals a hashCode =====
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserBoxId)) return false;
        UserBoxId that = (UserBoxId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(boxId, that.boxId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, boxId);
    }
}

