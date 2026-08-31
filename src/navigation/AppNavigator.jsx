import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RemoteScreen from '../screens/RemoteScreen';
import PublishScreen from '../screens/PublishScreen';
import AlertScreen from '../screens/AlertScreen';
import ManageScreen from '../screens/ManageScreen';

import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 65,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Controle"
        component={RemoteScreen}
      />

      <Tab.Screen
        name="Publicar"
        component={PublishScreen}
      />

      <Tab.Screen
        name="Alertas"
        component={AlertScreen}
      />

      <Tab.Screen
        name="Gerenciar"
        component={ManageScreen}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Main"
          component={MainTabs}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}