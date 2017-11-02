package com.eventure.services;

import com.eventure.entities.Event;
import com.eventure.entities.Save;
import com.eventure.requests.FilterEventsRequest;

import java.text.ParseException;
import java.util.List;

/**
 * Class containing logic regarding Events and their Saves.
 */
public interface EventService {
	/**
	 * Get the Event object with the given event id and whether the user has
	 * saved it.
	 */
	Event getEventAndSaved(int eventId, Integer userId);

	/**
	 * Get the number of saves on an event.
	 */
	long getSaveCount(int eventId);

	/**
	 * Update an Event.
	 */
	Event updateEvent(Event e, int id, int userId);

	/**
	 * Return a list of Event objects matching the parameters specified in the
	 * given request.
	 */
	List<Event> filterEvents(FilterEventsRequest request, Integer userId) throws ParseException;

	/**
	 * Save given Event object to database.
	 */
	Event createEvent(Event event, int userId);

	/**
	 * Remove the Event with the given id from database, provided user is
	 * creator.
	 */
	void deleteEvent(int eventId, int userId);

	/**
	 * Create a Save object with an Event of given id and the currently logged
	 * in user.
	 */
	Save createSave(int userId, int eventId);

	/**
	 * Return the save by user of given id for the event of given id. If none,
	 * returns null.
	 */
	Save getSave(int userId, int eventId);

	/**
	 * Delete a save if it exists.
	 */
	void deleteSave(int userId, int saveId);
}
