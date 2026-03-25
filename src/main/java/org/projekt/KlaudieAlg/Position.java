package org.projekt.KlaudieAlg;

import java.util.Objects;

/**
 * Pozice v kontejneru
 */
public class Position {
    public final int x;
    public final int y;
    public final int z;
    
    public Position(int x, int y, int z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    @Override
    public String toString() {
        return String.format("(%d,%d,%d)", x, y, z);
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Position)) return false;
        Position p = (Position) o;
        return x == p.x && y == p.y && z == p.z;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(x, y, z);
    }
}
