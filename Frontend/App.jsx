// =============================================
// App.jsx — Main entry point and navigation
// =============================================

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen   from './src/screens/AuthScreen';
import HomeScreen   from './src/screens/HomeScreen';
import LobbyScreen  from './src/screens/LobbyScreen';
import GameScreen   from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import HelpScreen   from './src/screens/HelpScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
          animation:   'slide_from_right'
        }}
      >
        <Stack.Screen name="Auth"   component={AuthScreen}   />
        <Stack.Screen name="Home"   component={HomeScreen}   />
        <Stack.Screen name="Lobby"  component={LobbyScreen}  />
        <Stack.Screen name="Game"   component={GameScreen}   />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Help"   component={HelpScreen}   />
      </Stack.Navigator>
    </NavigationContainer>
  );
}