package com.AI.biography;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BiographyApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void biographySectionComponentsArePresent() throws ClassNotFoundException {
		Class.forName("com.AI.biography.section.controller.BiographySectionController");
		Class.forName("com.AI.biography.section.controller.ContactMessageController");
		Class.forName("com.AI.biography.section.service.impl.BiographySectionServiceImpl");
		Class.forName("com.AI.biography.section.service.impl.ContactMessageServiceImpl");
	}

}
