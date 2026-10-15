import SidePanelActions from '@libs/actions/SidePanel';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type * as RHPVariantTest from '../../../../src/components/SidePanel/RHPVariantTest/index';

const mockIsReportTopmostSplitNavigator = jest.fn(() => false);

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(() => false),
        shouldUseStaging: jest.fn(),
        closeReactNativeApp: jest.fn(),
        completeOnboarding: jest.fn(),
        switchAccount: jest.fn(),
        sendAuthToken: jest.fn(),
        getHybridAppSettings: jest.fn(() => Promise.resolve(null)),
        getInitialURL: jest.fn(() => Promise.resolve(null)),
        onURLListenerAdded: jest.fn(),
        signInToOldDot: jest.fn(),
        signOutFromOldDot: jest.fn(),
        startSignOut: jest.fn(),
        cancelSignOut: jest.fn(),
        clearOldDotAfterSignOut: jest.fn(),
    },
}));

jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        connectWithoutView: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => ({
    __esModule: true,
    default: () => mockIsReportTopmostSplitNavigator(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/actions/SidePanel', () => ({
    __esModule: true,
    default: {
        openSidePanel: jest.fn(),
    },
}));

const {handleRHPVariantNavigation, shouldOpenRHPVariant} = jest.requireActual<typeof RHPVariantTest>('../../../../src/components/SidePanel/RHPVariantTest/index.ts');

describe('shouldOpenRHPVariant', () => {
    it('does not route the trackExpensesWithConcierge variant through the RHP variant navigation', () => {
        // Given a Track workspace or Track personal user, who lands on Home with the side panel closed like the homePageNoRHP arm
        const variant = CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE;

        // When deciding whether the RHP variant navigation handles the user after onboarding
        const result = shouldOpenRHPVariant(variant);

        // Then it does not, because that navigation is only for the retired micro-company arms of the experiment
        expect(result).toBe(false);
    });
});

describe('handleRHPVariantNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
    });

    it('preserves the topmost report for the rhpHomePage variant without opening the side panel', () => {
        // Given a report is already showing when onboarding finishes
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        // When the retired rhpHomePage arm is handled
        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        // Then the report stays where it is and the side panel is not opened over it
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
    });

    it('navigates home for the rhpHomePage variant without opening the side panel when no report is topmost', () => {
        // Given no report is showing when onboarding finishes

        // When the retired rhpHomePage arm is handled
        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        // Then the user lands on Home, the arm's destination, with the side panel closed
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
    });

    it.each([CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM, CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM])(
        'navigates to the workspace overview for the %s variant without opening the side panel',
        (variant) => {
            // Given an admin whose onboarding created a workspace

            // When a retired arm that lands on the workspace is handled
            handleRHPVariantNavigation('policyID', variant);

            // Then the user lands on the workspace overview, the arm's destination, with the side panel closed
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_OVERVIEW.getRoute('policyID'), undefined);
            expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
        },
    );
});
