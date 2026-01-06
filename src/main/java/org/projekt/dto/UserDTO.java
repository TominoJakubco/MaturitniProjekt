package org.projekt.dto;

public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String surname;

    public UserDTO(Long id, String email, String name, String surname) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.surname = surname;
    }

    public Long getId()        { return id; }
    public String getEmail()   { return email; }
    public String getName()    { return name; }
    public String getSurname() { return surname; }
}