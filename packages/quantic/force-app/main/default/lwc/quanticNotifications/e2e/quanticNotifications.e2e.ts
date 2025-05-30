import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import {testInsight, testSearch, expect} from './fixture';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic notifications trigger ${useCase.label}`, () => {
    test.describe('when we have a notifications trigger', () => {
      test('should display the notifications trigger component and send the analytics', async ({
        notifications,
        search,
      }) => {
        const notificationsMessages = ['Notification 1'];

        await search.mockSearchWithNotifyTriggerResponse(notificationsMessages);
        const searchResponsePromise = search.waitForSearchResponse();
        const expectedUaRequest =
          notifications.waitForNotifyTriggerCustomAnalytics(
            notificationsMessages
          );
        notifications.performSearch();
        await searchResponsePromise;
        await expectedUaRequest;

        expect((await notifications.notifications).length).toBe(1);
        const firstNotification = notifications.getNotification(0);
        await expect(firstNotification).toContainText(notificationsMessages[0]);
      });
    });

    test.describe('without a notifications trigger', () => {
      test('should not display the notifications trigger component', async ({
        notifications,
        search,
      }) => {
        const searchResponsePromise = search.waitForSearchResponse();
        notifications.performSearch();
        await searchResponsePromise;

        expect((await notifications.notifications).length).toBe(0);
        const firstNotification = notifications.getNotification(0);
        await expect(firstNotification).not.toBeVisible();
      });
    });
  });
});
