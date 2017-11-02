package com.eventure.controllers;

import com.eventure.entities.Event;
import com.eventure.entities.Save;
import com.eventure.requests.FilterEventsRequest;
import com.eventure.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static com.eventure.entities.SessionToken.CURRENT_USER_REQUEST_ATTRIBUTE;

/**
 * Backend endpoints for interacting with events and saves on events.
 */
@RestController
@RequestMapping("/api/event")
public class EventApiController {
	private final EventService eventService;

	@Autowired
	public EventApiController(EventService eventService) {
		this.eventService = eventService;
	}

	/**
	 * Get an event by its ID. Sets the `saved` field based on whether the given user has saved the event.
	 */
	@RequestMapping(value = "{id}", method = RequestMethod.GET)
	public Event getEvent(
			@PathVariable("id") int id,
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = false) Integer userId) {
		return eventService.getEventAndSaved(id, userId);
	}

	/**
	 * Get the number of users that have saved the event with the given ID.
	 */
	@RequestMapping(value = "{id}/savecount", method = RequestMethod.GET)
	public Map getEvent(@PathVariable("id") int id) {
		return Collections.singletonMap("saveCount", eventService.getSaveCount(id));
	}

	/**
	 * Edit the event with the given ID with the new values in the request body. Fails if the given user did not create
	 * the event being edited.
	 */
	@RequestMapping(value = "user/edit/{id}", method = RequestMethod.POST)
	public Event updateEvent(
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = true) int userId,
			@RequestBody Event event,
			@PathVariable("id") int id) {
		return eventService.updateEvent(event, id, userId);
	}

	/**
	 * Get a list of events that satisfy the filters in the request body.
	 */
	@RequestMapping(value = "filter", method = RequestMethod.GET)
	public List<Event> filterEvents(
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = false) Integer userId,
			FilterEventsRequest request) throws ParseException {
		return eventService.filterEvents(request, userId);
	}

	/**
	 * Create a new event.
	 */
	@RequestMapping(value = "user/create", method = RequestMethod.POST)
	public Event createEvent(
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = true) int userId,
			@RequestBody Event event) {
		return eventService.createEvent(event, userId);
	}

	/**
	 * Delete the event with the given ID. Fails if event was not created by the given user.
	 */
	@RequestMapping(value = "user/delete/{id}", method = RequestMethod.POST)
	public void deleteEvent(
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = true) int userId,
			@PathVariable("id") int eventId) {
		eventService.deleteEvent(eventId, userId);
	}

	/**
	 * Save the given event for the given user.
	 */
	@RequestMapping(value = "user/save/create/{id}", method = RequestMethod.POST)
	public Save createSave(
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = true) int userId,
			@PathVariable("id") int eventId) {
		return eventService.createSave(userId, eventId);
	}

	/**
	 * Unsave the given event for the given user.
	 */
	@RequestMapping(value = "user/save/delete/{id}", method = RequestMethod.POST)
	public void deleteSave(
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = true) int userId,
			@PathVariable("id") int saveId) {
		eventService.deleteSave(userId, saveId);
	}

	/**
	 * Get the Save between the given user and event if it exists, null otherwise.
	 */
	@RequestMapping(value = "user/save/get/{id}", method = RequestMethod.GET)
	public Save getSave(
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = true) int userId,
			@PathVariable("id") int eventId) {
		return eventService.getSave(userId, eventId);
	}
}
