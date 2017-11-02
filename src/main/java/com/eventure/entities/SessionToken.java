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
 * Entity representing a session token in the application, tied to the
 * SessionToken table in the database. Will be used to determine logged in user.
 */
@Entity
@Table(name = "session_token")
@SequenceGenerator(name = "sequence_generator", sequenceName = "session_token_id_seq")
public class SessionToken {
	public static final String SESSION_COOKIE_NAME = "ef.session.token";
	public static final int SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
	public static final String CURRENT_USER_REQUEST_ATTRIBUTE = "current_user";
	public static final String CURRENT_SESSION_REQUEST_ATTRIBUTE = "current_session";

	@Id
	@javax.persistence.Id
	@GeneratedValue(generator = "sequence_generator")
	@Column(name = "id")
	private Integer id;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	public SessionToken() {
	}

	public SessionToken(User user) {
		this.user = user;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
