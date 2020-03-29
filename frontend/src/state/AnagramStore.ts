import MicroEmitter from 'micro-emitter';
import SuperStore  from './SuperStore';
import DB from '../server/ServerStore';

import Anagram from '../wrappers/Anagram';
import {AnagramObject, AnagramState, User} from '../../types';

enum EVENTS {
    START_GAME = 'start-game',
    END_GAME = 'end-game',
    SCORE_WORD = 'score-word',
    UPDATE_GAMES_LIST= 'update-games-list'
}

class AnagramStore {
    private emitter: MicroEmitter;
    private games: Anagram[];

    private timeout_handle: number | null;
    private active_game: Anagram | null;

    constructor() {
        this.emitter = new MicroEmitter();

        this.active_game = null;
        this.timeout_handle = null;

        this.setListeners();

        this.games = [];
    }

    setListeners() {
        SuperStore.onStateToAnagramGame((game: Anagram) => {
            this.processLoadGame(game, true);
        });

        DB.onNewGames((new_games: AnagramObject[]) => {
            new_games.forEach(game => this.processLoadGame(new Anagram(game, DB.getUserID()), false));
        });

        DB.onNewGameState((game_uuid: string, user: User, state: AnagramState) => {
            let index = this.games.findIndex(game => game.getID() === game_uuid);

            if (index > -1) {
                this.games[index].setState(user.user_id, state);

                this.emitter.emit(EVENTS.UPDATE_GAMES_LIST, this.games);
            }

            // TODO: Maybe add game if not found?
        });
    }

    processLoadGame(game_object: Anagram, set_active: boolean) {
        let index = this.games.findIndex(game => game.getID() === game_object.getID());

        if (index > -1) {
            this.games[index] = game_object;
        } else {
            this.games.push(game_object);
        }

        if (set_active) {
            this.startNewGame(game_object);
        }

        this.emitter.emit(EVENTS.UPDATE_GAMES_LIST, this.games);
    }

    startNewGame(game_object: Anagram) {
        this.active_game = game_object;

        if (this.timeout_handle) clearTimeout(this.timeout_handle);
        this.timeout_handle = setTimeout(() => {
            this.endActiveGame()
        }, this.active_game.getConfig().duration * 1000);

        this.active_game.setLocalState({
            stage: 'RUNNING'
        });

        this.emitter.emit(EVENTS.START_GAME, this.active_game);
    }

    endActiveGame() {
        if (this.timeout_handle) clearTimeout(this.timeout_handle);

        if (this.active_game) {
            this.active_game.setLocalState({
                stage: 'FINISHED'
            });

            DB.updateGameState(
                this.active_game.getID(),
                this.active_game.getLocalState()
            );

            this.emitter.emit(EVENTS.END_GAME, this.active_game);
        } else {
            console.error('Game not initialized! ', 'endGame()');
        }
    }

    scoreWord(word: string) {
        if (this.active_game) {
            this.active_game.lazyScoreWord(word);

            this.emitter.emit(EVENTS.SCORE_WORD, this.active_game);
        } else {
            console.error('Game not initialized! ', 'scoreWord() ', word);
        }
    }

    // TODO: Replace with one method

    onUpdateGamesList(handler: Function) {
        this.emitter.on(EVENTS.UPDATE_GAMES_LIST, handler);
    }

    onStartNewGame(handler: Function) {
        this.emitter.on(EVENTS.START_GAME, handler);
    }

    onEndGame(handler: (game: Anagram) => void) {
        this.emitter.on(EVENTS.END_GAME, handler);
    }

    onScoreWord(handler: Function) {
        this.emitter.on(EVENTS.SCORE_WORD, handler);
    }

    closeAllListeners() {
        for (const event of Object.values(EVENTS)) {
            // @ts-ignore
            this.emitter.off(event);
        }
    }

    getActiveGame(): Anagram {
        if (this.active_game) {
            return this.active_game;
        } else {
            throw 'getActiveGame(): Game not initialized properly!'
        }
    }

    getGamesList(): Anagram[] {
        return this.games;
    }
}

export default new AnagramStore();