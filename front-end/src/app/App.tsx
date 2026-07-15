import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { colors } from '../shared/constants';
import { LanguageProvider } from '../shared/i18n';
import { AuthProvider } from '../features/auth';
import { RootNavigator } from './RootNavigator';

enableScreens();

function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={colors.background}
          />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

export default App;
