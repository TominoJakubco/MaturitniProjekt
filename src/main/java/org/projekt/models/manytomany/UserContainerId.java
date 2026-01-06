package org.projekt.models.manytomany;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserContainerId implements Serializable {

    private Long userId;
    private Long containerId;

    public UserContainerId() {}

    public UserContainerId(Long userId, Long containerId) {
        this.userId = userId;
        this.containerId = containerId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getContainerId() { return containerId; }
    public void setContainerId(Long containerId) { this.containerId = containerId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserContainerId)) return false;
        UserContainerId that = (UserContainerId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(containerId, that.containerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, containerId);
    }
}

