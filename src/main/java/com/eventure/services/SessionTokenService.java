package com.eventure.services;

import com.eventure.entities.SessionToken;
import com.eventure.entities.User;

import javax.servlet.http.HttpServletResponse;

/**
 * Class containing logic regarding Session Tokens and cookies.
 */
public interface SessionTokenService {
	/**
	 * Return the SessionToken object with the given id.
	 */
	SessionToken getSession(int id);

	/**
	 * Save the given SessionToken object to database and set the session cookie.
	 */
	void createSession(User user, HttpServletResponse response);

	/**
	 * Delete the SessionToken object with the given id and remove the session cookie.
	 */
	void deleteSession(int id, HttpServletResponse response);

	/**
	 * Set the given SessionToken to the response as a cookie.
	 */
	void setSessionToken(SessionToken sessionToken, HttpServletResponse response);

	/**
	 * Set the SessionToken cookie from the response.
	 */
	void removeSessionToken(HttpServletResponse response);
}
