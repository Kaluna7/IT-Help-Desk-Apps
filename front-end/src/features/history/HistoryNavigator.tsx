import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HistoryScreen } from './screens/HistoryScreen';
import { ReportHistoryScreen } from './screens/ReportHistoryScreen';
import { RequestHistoryScreen } from './screens/RequestHistoryScreen';

export type HistoryStackParamList = {
  HistoryHome: undefined;
  ReportHistory: undefined;
  RequestHistory: undefined;
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryHome" component={HistoryScreen} />
      <Stack.Screen name="ReportHistory" component={ReportHistoryScreen} />
      <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
    </Stack.Navigator>
  );
}
