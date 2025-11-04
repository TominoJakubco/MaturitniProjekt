package org.projekt.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    // ⬅️ Načte hodnotu z .env nebo application.properties
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    private byte[] getSecretKeyBytes() {
        return SECRET_KEY.getBytes();
    }

    //Vytvoření tokenu
    public String generateToken(String email) {
        System.out.println("SECRET_KEY=" + SECRET_KEY);
        System.out.println("Generating token for email: " + email);
        String token = Jwts.builder()
                .setSubject(email)                      // e-mail jako identifikátor uživatele
                .setIssuedAt(new Date(System.currentTimeMillis())) // kdy byl token vydán
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // platnost 10 hodin
                .signWith(SignatureAlgorithm.HS256, getSecretKeyBytes())   // podepsání tajným klíčem
                .compact();
        System.out.println("Generated token: " + token);
        return token;
    }

    //Získání emailu (subject) z tokenu
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    //Ověření, zda je token platný
    public boolean isTokenValid(String token, String userEmail) {
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(userEmail) && !isTokenExpired(token));
    }

    //Ověření platnosti (expirace)
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    //Pomocné metody
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSecretKeyBytes())
                .parseClaimsJws(token)
                .getBody();
    }
}
