package com.jimo.callback.sentrycallback;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/callback")
public class CallbackController {

    @PostMapping("/event")
    public boolean acceptEvent(HttpServletRequest request, @RequestBody(required = false) String body) throws IOException {
        log.info("body:{}", body);
        return true;
    }
}
