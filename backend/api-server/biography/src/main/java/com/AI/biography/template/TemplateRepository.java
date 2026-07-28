package com.AI.biography.template;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TemplateRepository
        extends JpaRepository<Template, String> {

    List<Template> findByStatusOrderByCreatedAtAsc(String status);

}