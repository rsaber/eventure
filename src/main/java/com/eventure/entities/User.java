package com.eventure.entities;

import org.springframework.data.annotation.Id;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

/**
 * Entity representing the account of a user of the application, tied to the
 * User table in the database.
 */
@Entity
@Table(name = "user")
@SequenceGenerator(name = "sequence_generator", sequenceName = "user_id_seq")
public class User {
	@Id
	@javax.persistence.Id
	@GeneratedValue(generator = "sequence_generator")
	@Column(name = "id")
	private Integer id;

	@Column(name = "email")
	private String email;

	@Column(name = "password")
	private String password;

	@Column(name = "name")
	private String name;

	@Column(name = "bio")
	private String bio;

	@Column(name = "profile_picture")
	private String profilePicture;

	public User() {
	}

	public User(String email, String password, String name, String bio) {
		this.email = email;
		this.password = password;
		this.name = name;
		this.bio = bio;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public String getProfilePicture() {
		return profilePicture;
	}

	public void setProfilePicture(String profilePicture) {
		this.profilePicture = profilePicture;
	}
}
