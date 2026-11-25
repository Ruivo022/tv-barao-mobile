import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Send, Settings, Tv } from 'lucide-react-native';

import AlertScreen from '../screens/AlertScreen';
import ManageScreen from '../screens/ManageScreen';
import PublishScreen from '../screens/PublishScreen';
import RemoteScreen from '../screens/RemoteScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ usuario, nomeBiometria, biometriaAtiva, aoAlterarBiometria, aoSair }) {
  const { top, right, bottom, left } = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Controle"
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneStyle: {
            backgroundColor: colors.background,
            paddingTop: top,
            paddingLeft: left,
            paddingRight: right,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 65 + bottom,
            paddingTop: 5,
            paddingBottom: 8 + bottom,
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
        <Tab.Screen name="Publicar">
          {() => <PublishScreen usuarioId={usuario.id} />}
        </Tab.Screen>
        <Tab.Screen name="Alertas" component={AlertScreen} />
        <Tab.Screen name="Gerenciar">
          {() => (
            <ManageScreen
              emailDaConta={usuario.email}
              nomeBiometria={nomeBiometria}
              biometriaAtiva={biometriaAtiva}
              aoAlterarBiometria={aoAlterarBiometria}
              aoSair={aoSair}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
