package com.eventure.repositories;

import com.eventure.entities.Event;
import com.eventure.requests.FilterEventsRequest;

import java.text.ParseException;
import java.util.List;

/**
 * Repository class to apply custom filter to when accessing Events saved in the database.
 */
public interface EventRepositoryCustom {
	/**
	 * Find all events that satisfy the given filter.
	 */
	List<Event> findWithFilter(FilterEventsRequest filter, Integer userId) throws ParseException;
}
