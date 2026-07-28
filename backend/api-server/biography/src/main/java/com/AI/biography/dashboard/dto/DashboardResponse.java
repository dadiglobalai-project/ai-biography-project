package com.AI.biography.dashboard.dto;

public class DashboardResponse {

    private UserSummary user;
    private StatisticsSummary statistics;
    private ActionSummary actions;

    public DashboardResponse() {
    }

    public UserSummary getUser() {
        return user;
    }

    public void setUser(UserSummary user) {
        this.user = user;
    }

    public StatisticsSummary getStatistics() {
        return statistics;
    }

    public void setStatistics(StatisticsSummary statistics) {
        this.statistics = statistics;
    }

    public ActionSummary getActions() {
        return actions;
    }

    public void setActions(ActionSummary actions) {
        this.actions = actions;
    }
}