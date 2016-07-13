package br.com.mg.bodyshock.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Muehlner de Paula Arão
 * @email <muehlner.arao@gmail.com>
 * @date 08/07/2016
 * @time 17:00:00
 */

@Controller
public class HomeController {

	@RequestMapping("/")
	public String index() {
		return "index";
	}
}
