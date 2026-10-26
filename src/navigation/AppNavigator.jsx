import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, Send, Settings, Tv } from 'lucide-react-native';

import AlertScreen from '../screens/AlertScreen';
import ManageScreen from '../screens/ManageScreen';
import PublishScreen from '../screens/PublishScreen';
import RemoteScreen from '../screens/RemoteScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Controle"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 65,
            paddingTop: 5,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color, size }) => {
            const Icon = {
              Controle: Tv,
              Publicar: Send,
              Alertas: Bell,
              Gerenciar: Settings,
            }[route.name];

            return <Icon size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Controle" component={RemoteScreen} />
        <Tab.Screen name="Publicar" component={PublishScreen} />
        <Tab.Screen name="Alertas" component={AlertScreen} />
        <Tab.Screen name="Gerenciar" component={ManageScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
