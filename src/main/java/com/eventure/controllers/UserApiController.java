package com.eventure.controllers;

import com.eventure.entities.User;
import com.eventure.exceptions.NotFoundException;
import com.eventure.exceptions.UnauthorizedException;
import com.eventure.requests.CredentialsRequest;
import com.eventure.services.SessionTokenService;
import com.eventure.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import javax.servlet.http.HttpServletResponse;

import static com.eventure.entities.SessionToken.CURRENT_SESSION_REQUEST_ATTRIBUTE;
import static com.eventure.entities.SessionToken.CURRENT_USER_REQUEST_ATTRIBUTE;

/**
 * Backend api for interacting with users.
 */
@RestController
@RequestMapping("/api")
public class UserApiController {
	private final UserService userService;
	private final SessionTokenService sessionTokenService;

	@Autowired
	public UserApiController(UserService userService, SessionTokenService sessionTokenService) {
		this.userService = userService;
		this.sessionTokenService = sessionTokenService;
	}

	/**
	 * Get the current logged in User.
	 */
	@RequestMapping(value = "user", method = RequestMethod.GET)
	public User getCurrentUser(@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE) int userId) {
		return userService.getUser(userId, new UnauthorizedException("User does not exist, or not logged in"));
	}

	/**
	 * Get the User with the given ID.
	 */
	@RequestMapping(value = "profile/{id}", method = RequestMethod.GET)
	public User getUser(@PathVariable("id") int id) {
		User user = userService.getUser(id, new NotFoundException("User does not exist"));
		user.setPassword(null);
		return user;
	}

	/**
	 * Log the user in with the given credentials. Fails if the credentials are incorrect.
	 */
	@RequestMapping(value = "login", method = RequestMethod.POST)
	public void login(@RequestBody CredentialsRequest credentials, HttpServletResponse response) {
		User user = userService.login(credentials.getEmail(), credentials.getPassword());
		sessionTokenService.createSession(user, response);
	}

	/**
	 * Create a user and log them in.
	 */
	@RequestMapping(value = "signup", method = RequestMethod.POST)
	public void signup(@RequestBody User newUser, HttpServletResponse response) {
		User user = userService.createUser(newUser);
		// Log new user in.
		sessionTokenService.createSession(user, response);
	}

	/**
	 * Log a user out.
	 */
	@RequestMapping(value = "logout", method = RequestMethod.GET)
	public RedirectView logout(
			@RequestAttribute(value = CURRENT_SESSION_REQUEST_ATTRIBUTE, required = false) int sessionId,
			HttpServletResponse response) {
		sessionTokenService.deleteSession(sessionId, response);
		return new RedirectView("/");
	}

	/**
	 * Update the current user's details.
	 */
	@RequestMapping(value = "user/update", method = RequestMethod.POST)
	public User updateUser(
			@RequestBody User user,
			@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = true) int userId) {
		return userService.updateUser(user, userId);
	}
}
