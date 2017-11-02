package com.eventure.services.impl;

import com.eventure.entities.User;
import com.eventure.exceptions.ConflictException;
import com.eventure.exceptions.ServerException;
import com.eventure.exceptions.UnauthorizedException;
import com.eventure.repositories.UserRepository;
import com.eventure.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
	private final UserRepository userRepository;
	private final PasswordEncoder encoder;

	@Autowired
	UserServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
		this.encoder = new BCryptPasswordEncoder(10);
	}

	@Override
	public User getUser(int id, RuntimeException ifNone) {
		User user = userRepository.findOne(id);
		if (user == null) {
			throw ifNone;
		}
		return user;
	}

	@Override
	public User getUserByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	@Override
	public User createUser(User newUser) {
		try {
			// Check email is not taken.
			if (getUserByEmail(newUser.getEmail()) != null) {
				throw new ConflictException("Email is invalid");
			}
			// Create user with hashed password.
			newUser.setPassword(hashPassword(newUser.getPassword()));
			return userRepository.save(newUser);
		} catch (DataAccessException e) {
			throw new ServerException(e);
		}
	}

	@Override
	public User updateUser(User update, int initiatorId) {
		User user = getUser(initiatorId, new UnauthorizedException("User does not exist, or not logged in"));
		User userWithEmail = getUserByEmail(update.getEmail());
		if (userWithEmail != null && userWithEmail.getId() != initiatorId) {
			throw new ConflictException("Email already taken");
		}

		// Set any new values to be updated on `user`.
		if (update.getPassword() != null && !update.getPassword().isEmpty()) {
			user.setPassword(hashPassword(update.getPassword()));
		} else {
			user.setPassword(user.getPassword());
		}

		if (update.getEmail() != null && !update.getEmail().isEmpty()) {
			user.setEmail(update.getEmail());
		}

		if (update.getPassword() != null && !update.getPassword().isEmpty()) {
			user.setPassword(update.getPassword());
		}

		if (update.getBio() != null) {
			user.setBio(update.getBio());
		}

		if (update.getName() != null && !update.getName().isEmpty()) {
			user.setName(update.getName());
		}

		if (update.getProfilePicture() != null && !update.getProfilePicture().isEmpty()) {
			user.setProfilePicture(update.getProfilePicture());
		}

		return userRepository.save(user);
	}

	@Override
	public User login(String email, String password) {
		User user = getUserByEmail(email);
		if (user == null || !encoder.matches(password, user.getPassword())) {
			throw new UnauthorizedException("Incorrect credentials");
		}
		return user;
	}

	private String hashPassword(String password) {
		return encoder.encode(password);
	}
}
