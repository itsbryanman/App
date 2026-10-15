import SidePanelActions from '@libs/actions/SidePanel';
import {setOnboardingRHPVariant} from '@libs/actions/Welcome';
import {navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: jest.fn((options?: {afterTransition?: () => void}) => options?.afterTransition?.()),
        navigate: jest.fn(),
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
    },
}));

jest.mock('@libs/actions/SidePanel', () => ({
    __esModule: true,
    default: {openSidePanel: jest.fn()},
}));

jest.mock('@libs/actions/Welcome', () => ({
    setOnboardingRHPVariant: jest.fn(),
}));

jest.mock('@libs/actions/Modal', () => ({
    setDisableDismissOnEscape: jest.fn(),
}));

const navigationMock = jest.mocked(Navigation);

describe('navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to HOME without opening the side panel when policyID is missing', () => {
        navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(undefined);

        expect(navigationMock.dismissModal).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledWith(ROUTES.HOME);
        // Without a workspace there is no #admins room to surface in the side panel.
        expect(setOnboardingRHPVariant).not.toHaveBeenCalled();
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
    });

    it('navigates to Spend > Expenses without opening the side panel', () => {
        // Given an employee who created or joined a Submit workspace while onboarding with the "Get paid back by my employer" intent
        const policyID = 'test-policy-id';

        // When onboarding finishes
        navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(policyID);

        // Then the user still lands on Spend > Expenses, since a separate A/B test decides where Submit users land
        expect(navigationMock.dismissModal).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}),
        );
        // And the side panel stays closed so the user isn't onboarded in two places at once, while opening it later still shows the
        // #admins room, where the Submit welcome and its suggested responses are posted
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
        expect(setOnboardingRHPVariant).toHaveBeenCalledWith(CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM);
    });
});
