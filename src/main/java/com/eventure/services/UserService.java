package com.eventure.services;

import com.eventure.entities.User;

/**
 * Class containing logic regarding Users.
 */
public interface UserService {
	/**
	 * Return the User object with the given id.
	 */
	User getUser(int id, RuntimeException ifNone);

	/**
	 * Return the User object with the given email.
	 */
	User getUserByEmail(String email);

	/**
	 * Save the given User object to database.
	 */
	User createUser(User user);

	/**
	 * Update an existing User object in the database to match the given User
	 * object.
	 */
	User updateUser(User update, int initiatorId);

	/**
	 * Check user credentials and return user if they are correct.
	 */
	User login(String email, String password);
}
