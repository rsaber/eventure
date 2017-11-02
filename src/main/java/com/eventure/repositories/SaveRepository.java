package com.eventure.repositories;

import com.eventure.entities.Save;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * JPA repository class to access Saves in the database.
 */
@Repository
public interface SaveRepository extends JpaRepository<Save, Integer> {
	Save findByUserIdAndEventId(int userId, int eventId);
	
	@Transactional
	void deleteByEventId(int eventId);

	long countByEventId(int eventId);
}
