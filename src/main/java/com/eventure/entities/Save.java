package com.eventure.entities;

import org.springframework.data.annotation.Id;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

/**
 * Entity representing a save of an event by a user, tied to the Save table in
 * the database.
 */
@Entity
@Table(name = "save")
@SequenceGenerator(name = "sequence_generator", sequenceName = "save_id_seq")
public class Save {
	@Id
	@javax.persistence.Id
	@GeneratedValue(generator = "sequence_generator")
	@Column(name = "id")
	private Integer id;

	@ManyToOne
	@JoinColumn(name = "event_id")
	private Event event;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	public Save() {
	}
	
	public Save(User user, Event event) {
		this.user = user;
		this.event = event;
	}

	public Save(Event event, User user) {
		this.event = event;
		this.user = user;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Event getEvent() {
		return event;
	}

	public void setEvent(Event event) {
		this.event = event;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
