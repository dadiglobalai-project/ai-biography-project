package com.AI.biography.section.dto.response;

import com.AI.biography.section.enums.SectionType;

public class SectionResponse {
    public String sectionId;
    public SectionType sectionType;
    public String sectionKey;
    public Integer sortOrder;
    public Boolean isVisible;
    public Object content;
}
