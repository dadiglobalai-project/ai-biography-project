package com.AI.biography.dashboard.dto;

public class ActionSummary {

    private boolean hasDraft;
    private String latestDraftId;

    public ActionSummary() {
    }

    public boolean isHasDraft() {
        return hasDraft;
    }

    public void setHasDraft(boolean hasDraft) {
        this.hasDraft = hasDraft;
    }

    public String getLatestDraftId() {
        return latestDraftId;
    }

    public void setLatestDraftId(String latestDraftId) {
        this.latestDraftId = latestDraftId;
    }
}