package com.eventure.repositories;

import com.eventure.entities.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA repository class to access Events saved in the database.
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Integer>, EventRepositoryCustom {
}
