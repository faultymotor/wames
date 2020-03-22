import React, { Component } from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

import AnagramStore from '../../../state/AnagramStore';
import SuperStore, { State } from "../../../state/SuperStore";
import { AnagramState } from "../../../state/wrappers/Anagram";

export default class GameBrowser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            games: []
        };
    }

    // TODO: Fix games being displayed as 'running' instead of 'finished'...
    // For some reason, AnagramStore.getGamesList() returns a bad list, while onUpdateGamesList has the correct one...

    componentDidMount() {
        this.setState({
            games: AnagramStore.getGamesList()
        });

        AnagramStore.onUpdateGamesList(games_list => {
            this.setState({
                games: games_list
            });
        });
    }

    render() {
        return (
            <View style={styles.view_games}>
                <Text style={styles.title}> Games </Text>
                {
                    this.state.games.map((game, idx) =>
                        <View style={ styles.game_row } key={idx} flexDirection='row'>
                            {
                                game.getPlayers().map((user_id, iidx) =>
                                    <Text key={this.state.games.length + iidx}>
                                        {user_id + (game.getPlayers().length - 1 !== iidx ? ', ' : ' ')}
                                    </Text>
                                )
                            }
                            {
                                game.getLocalState().stage === AnagramState.FINISHED ?
                                    <TouchableOpacity
                                        style={ styles.button }
                                        onPress={ _ => {
                                            alert(game.getPlayers().map(user_id =>
                                            user_id + ' vs ' + game.getState(user_id).score + ', with: ' + game.getState(user_id).words.join(' '),)
                                                .join('\n'))
                                        } }
                                    >
                                        <Text>View Results</Text>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity
                                        style={ styles.button }
                                        disabled={ game.getLocalState().stage !== AnagramState.NOT_STARTED }
                                        onPress={ _ => {SuperStore.setState(State.ANAGRAM_GAME, game)} }
                                    >
                                        <Text>{ game.getLocalState().stage }</Text>
                                    </TouchableOpacity>

                            }
                        </View>
                    )
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view_games: {
        alignItems: 'center',
        justifyContent: 'flex-start',

        marginVertical: 50,
    },

    game_row: {
        marginVertical: 5
    },

    title: {
        marginBottom: 10,
        fontSize: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
});

