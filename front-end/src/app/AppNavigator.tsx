import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {
  Home,
  ClipboardList,
  Send,
  History,
  UserRound,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../features/home';
import { ReportNavigator } from '../features/report';
import { RequestScreen } from '../features/request';
import { HistoryNavigator } from '../features/history';
import { ProfileScreen } from '../features/profile';
import { colors, fonts } from '../shared/constants';
import { useLanguage } from '../shared/i18n';
import { useResponsive } from '../shared/hooks';

export type RootTabParamList = {
  Home: undefined;
  Report: undefined;
  Request: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const TAB_BAR_CONTENT_HEIGHT = 64;

export function AppNavigator() {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 10);
  const { t } = useLanguage();
  const { tabLabelSize } = useResponsive();

  const tabBarStyle = {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: TAB_BAR_CONTENT_HEIGHT + paddingBottom,
    paddingTop: 8,
    paddingBottom,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarButton: props => (
          <PlatformPressable
            {...props}
            pressColor="transparent"
            pressOpacity={1}
          />
        ),
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: Math.max(tabLabelSize, 11),
          fontFamily: fonts.semiBold,
          lineHeight: 15,
          marginTop: 2,
          marginBottom: 0,
          includeFontPadding: false,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          justifyContent: 'center',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t.tabs.home,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'ReportList';
          const hideTab = focused === 'ReportDetail';
          return {
            tabBarLabel: t.tabs.report,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <ClipboardList color={color} size={size} />
            ),
            tabBarStyle: hideTab ? { display: 'none' as const } : tabBarStyle,
          };
        }}
      />
      <Tab.Screen
        name="Request"
        component={RequestScreen}
        options={{
          tabBarLabel: t.tabs.request,
          tabBarIcon: ({ color, size }) => <Send color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryNavigator}
        options={{
          tabBarLabel: t.tabs.history,
          tabBarIcon: ({ color, size }) => (
            <History color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t.tabs.profile,
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
