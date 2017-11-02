package com.eventure.services.impl;

import com.eventure.entities.Event;
import com.eventure.entities.Save;
import com.eventure.entities.User;
import com.eventure.exceptions.NotFoundException;
import com.eventure.exceptions.UnauthorizedException;
import com.eventure.repositories.EventRepository;
import com.eventure.repositories.SaveRepository;
import com.eventure.requests.FilterEventsRequest;
import com.eventure.services.EventService;
import com.eventure.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.text.ParseException;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {
	private final EventRepository eventRepository;
	private final SaveRepository saveRepository;
	private final UserService userService;

	@Autowired
	public EventServiceImpl(EventRepository eventRepository, UserService userService, SaveRepository saveRepository) {
		this.eventRepository = eventRepository;
		this.userService = userService;
		this.saveRepository = saveRepository;
	}

	@Override
	public Event getEventAndSaved(int eventId, Integer userId) {
		Event event = eventRepository.findOne(eventId);
		if (event == null) {
			throw new NotFoundException("No event with id " + eventId);
		}
		setEventSaved(event, userId);
		return event;
	}

	@Override
	public long getSaveCount(int eventId) {
		return saveRepository.countByEventId(eventId);
	}

	@Override
	public Event updateEvent(Event e, int id, int userId) {
		Event event = eventRepository.findOne(id);

		if (event == null) {
			throw new NotFoundException("No event with id " + id);
		}
		if (event.getCreator().getId() != userId) {
			throw new UnauthorizedException("Cannot edit another user's event");
		}

		// Copy image and location fields from original event if they were not updated.
		if (StringUtils.isEmpty(e.getImageUrl())) {
			e.setImageUrl(event.getImageUrl());
		}

		if (e.getLocationAddress().equals(event.getLocationAddress())) {
			e.setLocationName(event.getLocationName());
			e.setLatitude(event.getLatitude());
			e.setLongitude(event.getLongitude());
			e.setMapsUrl(event.getMapsUrl());
			e.setLocality(event.getLocality());
		}

		if (e.getLink() != null && !e.getLink().isEmpty() && !e.getLink().matches("^https?://.+")) {
			e.setLink("http://" + e.getLink());
		}

		e.setId(id);
		e.setCreator(event.getCreator());

		return eventRepository.save(e);
	}

	@Override
	public List<Event> filterEvents(FilterEventsRequest request, Integer userId) throws ParseException {
		List<Event> events = eventRepository.findWithFilter(request, userId);
		events.forEach(event -> setEventSaved(event, userId));
		return events;
	}

	@Override
	public Event createEvent(Event event, int userId) {
		event.setCreator(userService.getUser(userId, new UnauthorizedException("User must be logged in to create event")));
		if (event.getLink() != null && !event.getLink().isEmpty() && !event.getLink().matches("^https?://.+")) {
			event.setLink("http://" + event.getLink());
		}
		return eventRepository.save(event);
	}

	@Override
	public void deleteEvent(int eventId, int userId) {
		Event event = eventRepository.findOne(eventId);
		if (event == null) {
			throw new NotFoundException("Couldn't find event with id " + eventId);
		}
		if (event.getCreator().getId() != userId) {
			throw new UnauthorizedException("Cannot delete another user's event");
		}

		// Delete saves on the event.
		saveRepository.deleteByEventId(eventId);

		eventRepository.delete(event);
	}

	@Override
	public Save createSave(int userId, int eventId) {
		Save existingSave = saveRepository.findByUserIdAndEventId(userId, eventId);
		if (existingSave != null) {
			return existingSave;
		}

		User user = userService.getUser(userId, new UnauthorizedException("User does not exist, or is not logged in"));

		Event event = eventRepository.getOne(eventId);
		if (event == null) {
			throw new NotFoundException("No event with id " + eventId);
		}

		return saveRepository.save(new Save(user, event));
	}

	@Override
	public Save getSave(int userId, int eventId) {
		Save save = saveRepository.findByUserIdAndEventId(userId, eventId);
		if (save == null) {
			throw new NotFoundException("No save for this user and event");
		}

		return save;
	}

	@Override
	public void deleteSave(int userId, int saveId) {
		Save save = saveRepository.findOne(saveId);
		if (save.getUser().getId() != userId) {
			throw new UnauthorizedException("User attempting to delete a save which isn't theirs");
		}

		saveRepository.delete(saveId);
	}

	/**
	 * Set the `saved` field on the event to the ID of the save linked to the given user, or null if it none exists.
	 */
	private void setEventSaved(Event event, Integer userId) {
	    if (userId != null) {
			Save save = saveRepository.findByUserIdAndEventId(userId, event.getId());
			event.setSaved(save == null ? null : save.getId());
		}
	}
}
