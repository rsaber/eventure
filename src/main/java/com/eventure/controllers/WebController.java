package com.eventure.controllers;

import org.springframework.boot.autoconfigure.web.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import static com.eventure.entities.SessionToken.CURRENT_USER_REQUEST_ATTRIBUTE;

/**
 * Frontend endpoints that are rendered through ReactJS.
 */
@Controller
public class WebController implements ErrorController {
    private static final String ERROR_PATH = "error";

    /**
     * All frontend public URLs go through this method so that the ReactJS handles rendering.
     */
    @RequestMapping(value = { "/", "login", "create", "my", "event/*", "profile/*", "settings" }, method = RequestMethod.GET)
    public String index(@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = false) String userId, Model model) {
        model.addAttribute(CURRENT_USER_REQUEST_ATTRIBUTE, userId);
        return "index";
    }

    /**
     * Forward errors to the ReactJS frontend to render.
     */
    @RequestMapping(value = ERROR_PATH)
    public String error(@RequestAttribute(value = CURRENT_USER_REQUEST_ATTRIBUTE, required = false) String userId, Model model) {
        model.addAttribute(CURRENT_USER_REQUEST_ATTRIBUTE, userId);
        return "index";
    }

    @Override
    public String getErrorPath() {
        return ERROR_PATH;
    }
}
