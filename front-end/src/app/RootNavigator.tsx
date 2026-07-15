import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../shared/constants';
import { AuthNavigator, useAuth } from '../features/auth';
import { AppNavigator } from './AppNavigator';

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
