package com.AI.biography.dashboard.dto;

public class StatisticsSummary {

    private long totalWebsites;
    private long drafts;
    private long published;

    public StatisticsSummary() {
    }

    public long getTotalWebsites() {
        return totalWebsites;
    }

    public void setTotalWebsites(long totalWebsites) {
        this.totalWebsites = totalWebsites;
    }

    public long getDrafts() {
        return drafts;
    }

    public void setDrafts(long drafts) {
        this.drafts = drafts;
    }

    public long getPublished() {
        return published;
    }

    public void setPublished(long published) {
        this.published = published;
    }
}