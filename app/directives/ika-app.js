import angular from 'angular';
import moment from 'moment';
import {appName} from '../constants';

// Flux
import EventEmitter from '../vendor/mini-flux/EventEmitter';
import AppAction from '../app-action';
import SquidStore from '../squid-store';
import AuthStore from '../auth-store';
const dispatcher = new EventEmitter();
export const action = new AppAction(dispatcher);
const squidStore = new SquidStore(dispatcher);
const authStore = new AuthStore(dispatcher);

const location = window.location;

// Constants
const directiveName = 'ikaApp';

class IkaAppController {
  constructor($rootScope, $firebaseArray) {
    IkaAppController.$inject = ['$rootScope', '$firebaseArray'];
    this.$rootScope = $rootScope;
    this.$firebaseArray = $firebaseArray;

    squidStore.on('CHANGE', this.onSquidStoreChange.bind(this));
    authStore .on('CHANGE', this.onAuthStoreChange .bind(this));

    action.applicationReady();
    action.initAuthStatus();
  }

  /**
   * @private
   * @returns {void}
   */
  onSquidStoreChange() {
    this.hordeOfSquid = this.$firebaseArray(squidStore.ref);
    this.registered = squidStore.registered;
  }

  /**
   * @private
   * @returns {void}
   */
  onAuthStoreChange() {
    this.authStatus = authStore.status;
    authStore.waitForAuthPromise.then(() => {
      const uid = this.authStatus ? this.authStatus.uid : void 0;
      action.load(uid);
    });
  }

  /**
   * @param {number} time - unixtime
   * @returns {string}
   */
  relativeTime(time) {
    return moment(time, 'x').fromNow();
  }
}

function ddo() {
  return {
    restrict:     'E',
    scope:        {},
    templateUrl:  './app/directives/ika-app.html',
    controller:   IkaAppController,
    controllerAs: directiveName
  };
}

angular.module(appName).directive(directiveName, ddo);
