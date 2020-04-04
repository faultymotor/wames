import React, { Component } from 'react';
import { Icon } from 'react-native-elements';

import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import GamePortal from './subcomponents/GamePortal';
import PlayMenu from './subcomponents/Play';
import Settings from './subcomponents/Settings';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Statistics from './subcomponents/Statistics';
import {connect, DispatchProp} from 'react-redux';
import RootNavigator from 'lib/RootNavigator';
import {setMenuScreen} from 'store/actions';
import {MenuState, State} from 'store/types';

export type ParamList = {
    [key: string]: any
}

const Stack = createStackNavigator<ParamList>();
const Drawer = createDrawerNavigator<ParamList>();

function DrawerWrapper() {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name='Home' component={PlayMenu}/>
            <Drawer.Screen name='Games List' component={Statistics}/>
            <Drawer.Screen name='Settings' component={Settings}/>
        </Drawer.Navigator>
    )
}

type Props = {
    style?: any,
    dispatch: any,
    screen: MenuState["screen"]
}

const getActiveRouteName = (state: any): MenuState["screen"] => {
    const route = state.routes[state.index];

    if (route.state) {
        // Dive into nested navigators
        return getActiveRouteName(route.state);
    }

    return route.name;
};


class Menu extends Component<Props, any> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name='Drawer'
                    component={ DrawerWrapper }
                    options={{
                        headerLeft: () => (
                            <Icon
                                raised={true}
                                name='menu'
                                onPress={() => RootNavigator.toggleDrawer()}
                            />
                        ),
                    }}
                />
                <Stack.Screen
                    name='Game Portal'
                    component={GamePortal}/>
            </Stack.Navigator>
        )
    }
}

function mapStateToProps(state: State) {
    return {
        screen: state.menu.screen,
    }
}

export default connect(mapStateToProps)(Menu);