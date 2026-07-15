import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReportScreen } from './screens/ReportScreen';
import { ReportDetailScreen } from './screens/ReportDetailScreen';

export type ReportStackParamList = {
  ReportList: undefined;
  ReportDetail: { reportId: string };
};

const Stack = createNativeStackNavigator<ReportStackParamList>();

export function ReportNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportList" component={ReportScreen} />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
