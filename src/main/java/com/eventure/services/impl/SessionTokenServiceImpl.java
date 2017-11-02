package com.eventure.services.impl;

import com.eventure.entities.SessionToken;
import com.eventure.entities.User;
import com.eventure.exceptions.ServerException;
import com.eventure.repositories.SessionTokenRepository;
import com.eventure.services.SessionTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import java.util.Base64;

import static com.eventure.entities.SessionToken.SESSION_COOKIE_NAME;
import static com.eventure.entities.SessionToken.SESSION_MAX_AGE;

@Service
public class SessionTokenServiceImpl implements SessionTokenService {
	private final SessionTokenRepository sessionTokenRepository;
	private final Cipher cipher;

	@Autowired
	public SessionTokenServiceImpl(SessionTokenRepository sessionTokenRepository, Cipher cipher) {
		this.sessionTokenRepository = sessionTokenRepository;
		this.cipher = cipher;
	}

	@Override
	public SessionToken getSession(int id) {
		return sessionTokenRepository.findOne(id);
	}

	@Override
	public void createSession(User user, HttpServletResponse response) {
		SessionToken token = sessionTokenRepository.save(new SessionToken(user));
		setSessionToken(token, response);
	}

	@Override
	public void deleteSession(int id, HttpServletResponse response) {
		sessionTokenRepository.delete(id);
		removeSessionToken(response);
	}

	@Override
	public void setSessionToken(SessionToken sessionToken, HttpServletResponse response) {
		try {
			// Store encrypted session ID in session cookie.
			byte[] encryptedData = cipher.doFinal(sessionToken.getId().toString().getBytes());
			String value = Base64.getEncoder().encodeToString(encryptedData);
			Cookie cookie = new Cookie(SESSION_COOKIE_NAME, value);
			cookie.setPath("/");
			cookie.setMaxAge(SESSION_MAX_AGE);
			response.addCookie(cookie);
		} catch (IllegalBlockSizeException | BadPaddingException e) {
			throw new ServerException(e);
		}
	}

	@Override
	public void removeSessionToken(HttpServletResponse response) {
		Cookie cookie = new Cookie(SESSION_COOKIE_NAME, "removed");
		cookie.setPath("/");
		cookie.setMaxAge(0);
		response.addCookie(cookie);
	}
}
