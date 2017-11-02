package com.eventure.requests;

/**
 * Request containing the credentials a user entered on log in.
 */
public class CredentialsRequest {
    private String email;
    private String password;

    public CredentialsRequest() {
    }

    public CredentialsRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
