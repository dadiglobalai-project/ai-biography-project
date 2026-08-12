package com.AI.biography.aiwriting.entity;

import com.AI.biography.user.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserAiUsageTest {

    @Test
    void newUsageWithAssignedUserIdIsStillNewForSpringData() {
        User user = new User();
        user.setUserId("user-1");

        UserAiUsage usage = new UserAiUsage();
        usage.setUserId(user.getUserId());
        usage.setUser(user);

        assertThat(usage.getId()).isEqualTo("user-1");
        assertThat(usage.isNew()).isTrue();
    }

    @Test
    void persistedOrLoadedUsageIsNoLongerNewForSpringData() {
        UserAiUsage usage = new UserAiUsage();
        usage.setUserId("user-1");

        usage.markNotNew();

        assertThat(usage.isNew()).isFalse();
    }

    @Test
    void prePersistStillAppliesUsageDefaults() {
        UserAiUsage usage = new UserAiUsage();

        usage.prePersist();

        assertThat(usage.getEnglishWordsUsed()).isZero();
        assertThat(usage.getChineseCharactersUsed()).isZero();
        assertThat(usage.getEnglishWordLimit()).isEqualTo(100000);
        assertThat(usage.getChineseCharacterLimit()).isEqualTo(200000);
        assertThat(usage.getLimitEnabled()).isFalse();
        assertThat(usage.getCreatedAt()).isNotNull();
        assertThat(usage.getUpdatedAt()).isNotNull();
    }
}
