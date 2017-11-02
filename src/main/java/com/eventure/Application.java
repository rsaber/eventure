package com.eventure;

import com.eventure.filters.AuthenticationFilter;
import com.eventure.filters.AuthorizationFilter;
import com.eventure.services.SessionTokenService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.sql.DataSource;
import java.security.GeneralSecurityException;

@SpringBootApplication
public class Application {
    // Private key used to encrypt and decrypt session tokens.
    private static final String PRIVATE_KEY = "%LKj51&k~fd2$S73";

    /**
     * Initialise JDBC template.
     */
    @Bean
    NamedParameterJdbcTemplate namedParameterJdbcTemplate(@Qualifier("dataSource") DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }

    /**
     * Initialise authentication filter with cipher to decrypt session tokens.
     */
    @Bean
    FilterRegistrationBean authenticationFilter(SessionTokenService sessionTokenService) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        SecretKeySpec key = new SecretKeySpec(PRIVATE_KEY.getBytes(), "AES");
        cipher.init(Cipher.DECRYPT_MODE, key);
        AuthenticationFilter authenticationFilter = new AuthenticationFilter(sessionTokenService, cipher);
        return new FilterRegistrationBean(authenticationFilter);
    }

    /**
     * Initialise authorization filter on required endpoints.
     */
    @Bean
    FilterRegistrationBean authorizationFilter() {
        AuthorizationFilter authorizationFilter = new AuthorizationFilter();
        FilterRegistrationBean registrationBean = new FilterRegistrationBean(authorizationFilter);
        // Apply this filter to backend APIs that are only accessible by a logged in user.
        registrationBean.addUrlPatterns("/api/user/*", "/api/event/user/*");
        return registrationBean;
    }

    /**
     * Initialise cipher with the private key to encrypt and decrypt session tokens.
     */
    @Bean
    Cipher encryptionCipher() throws GeneralSecurityException {
		Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
		SecretKeySpec k = new SecretKeySpec(PRIVATE_KEY.getBytes(), "AES");
		cipher.init(Cipher.ENCRYPT_MODE, k);
		return cipher;
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
