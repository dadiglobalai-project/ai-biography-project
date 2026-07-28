package com.AI.biography.dashboard;

import com.AI.biography.dashboard.dto.ActionSummary;
import com.AI.biography.dashboard.dto.DashboardResponse;
import com.AI.biography.dashboard.dto.StatisticsSummary;
import com.AI.biography.dashboard.dto.UserSummary;
import com.AI.biography.user.UserProfile;
import com.AI.biography.user.UserProfileRepository;
import org.springframework.stereotype.Service;
import com.AI.biography.onboarding.UserOnboarding;
import com.AI.biography.onboarding.UserOnboardingRepository;

@Service
public class DashboardService {

    private final UserProfileRepository userProfileRepository;
    private final UserOnboardingRepository userOnboardingRepository;

    public DashboardService(
        UserProfileRepository userProfileRepository,
        UserOnboardingRepository userOnboardingRepository) {

        this.userProfileRepository = userProfileRepository;
        this.userOnboardingRepository = userOnboardingRepository;
    }

    public DashboardResponse getDashboard(String userId) {

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(null);

        UserSummary userSummary = new UserSummary();

        if (profile != null) {
            userSummary.setFirstName(profile.getFirstName());
            userSummary.setLastName(profile.getLastName());
            userSummary.setProfilePhoto(profile.getProfilePhoto());
        } else {
            userSummary.setFirstName("User");
            userSummary.setLastName("");
            userSummary.setProfilePhoto(null);
        }

       String serviceType = userOnboardingRepository.findByUserId(userId)
        .map((UserOnboarding u) -> u.getServiceType())
        .orElse(null);

        userSummary.setServiceType(serviceType);

        StatisticsSummary statistics = new StatisticsSummary();
        statistics.setTotalWebsites(0);
        statistics.setDrafts(0);
        statistics.setPublished(0);

        ActionSummary actions = new ActionSummary();
        actions.setHasDraft(false);
        actions.setLatestDraftId(null);

        DashboardResponse response = new DashboardResponse();
        response.setUser(userSummary);
        response.setStatistics(statistics);
        response.setActions(actions);

        return response;
    }
}