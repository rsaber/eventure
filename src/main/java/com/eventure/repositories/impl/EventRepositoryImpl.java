package com.eventure.repositories.impl;

import com.eventure.entities.Event;
import com.eventure.repositories.EventRepositoryCustom;
import com.eventure.requests.FilterEventsRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.HashMap;
import java.util.List;

/**
 * Implementation that applies a custom filter and pagination when accessing the Events table.
 */
@Repository
public class EventRepositoryImpl implements EventRepositoryCustom {
	private static final int PAGE_SIZE = 20;

	private final NamedParameterJdbcTemplate jdbcTemplate;

	@Autowired
	EventRepositoryImpl(NamedParameterJdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	/**
	 * Get the list of events that satisfy the given filter.
	 */
	@Transactional(readOnly = true)
	@Override
	public List<Event> findWithFilter(FilterEventsRequest filter, Integer userId) throws ParseException {
		// Execute the custom SQL query.
		Pair<String, HashMap<String, Object>> sqlValues = filter.toSql(userId);
		List<Event> allEvents = jdbcTemplate.query(
				sqlValues.getFirst(),
				sqlValues.getSecond(),
				new BeanPropertyRowMapper<>(Event.class)
		);

		// Restrict results to one page if requested.
		if (filter.getPage() != null && !allEvents.isEmpty()) {
			int from = Integer.min(filter.getPage() * PAGE_SIZE, allEvents.size() - 1);
			int to = Integer.min(from + PAGE_SIZE + 1, allEvents.size());
			return allEvents.subList(from, to);
		}
		
		return allEvents.subList(0, Integer.min(PAGE_SIZE + 1, allEvents.size()));
	}
}
