import 'expo/build/Expo.fx';
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import { activateKeepAwake } from 'expo-keep-awake';

import Root from './components/Root';

if (__DEV__) {
    activateKeepAwake();
}

registerRootComponent(Root);
