package com.eventure.repositories;

import com.eventure.entities.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA repository class to access Session Tokens saved in the database.
 */
@Repository
public interface SessionTokenRepository extends JpaRepository<SessionToken, Integer> {
}
