package org.projekt.dto;

public class UserUpdateDTO {
    private String email;
    private String name;
    private String surname;
    private String password; // volitelné – hashujeme jen pokud je vyplněné
    private String role;

    // Getters a Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
