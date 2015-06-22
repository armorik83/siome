import angular from 'angular';
import moment from 'moment';
import {appName, firebaseUrl} from '../constants';

// Flux
import EventEmitter from '../vendor/mini-flux/EventEmitter';
import AppAction from '../app-action';
import SquidStore from '../squid-store';
const dispatcher = new EventEmitter();
const action = new AppAction(dispatcher);
const store = new SquidStore(dispatcher);

// Constants
const directiveName = 'ikaApp';

class IkaAppController {
  constructor($rootScope, $firebaseArray, Auth) {
    IkaAppController.$inject = ['$rootScope', '$firebaseArray', 'Auth'];
    this.$rootScope = $rootScope;
    this.$firebaseArray = $firebaseArray;
    this.Auth = Auth;

    this.Auth.$onAuth = () => {
      location.reload();
    };

    this.initWebsiteElements();
    this.postable = true;
    store.on('CHANGE', this.onChange.bind(this));

    this.initAuthStatus().then(() => {
      const uid = this.authStatus ? this.authStatus.uid : void 0
      action.load(uid);
    });
  }

  /**
   * @private
   * @returns {void}
   */
  onChange() {
    this.hordeOfSquid = this.$firebaseArray(store.ref);
    this.registered = store.registered;
  }

  /**
   * @private
   * @returns {Promise}
   */
  initAuthStatus() {
    return this.Auth.$waitForAuth().then((res) => {
      this.authStatus = res;
    });
  }

  /**
   * @private
   * @returns {void}
   */
  initWebsiteElements() {
    this.title = 'siome';
    this.description = '"siome"はTwitterアカウントとイカID（ニンテンドーネットワークID）が潮目に集まるようにまとめて登録・検索ができるサービスです！イカ、よろしく〜〜〜';
  }

  /**
   * @returns {void}
   */
  login() {
    this.Auth.$authWithOAuthPopup('twitter').then((data) => {
      console.info('Authenticated successfully with payload:', data);
      location.reload();
    }).catch((err) => {
      console.error('Login Failed!', err);
    });
  }

  /**
   * @returns {void}
   */
  logout() {
    this.Auth.$unauth();
    location.reload();
  }

  /**
   * @returns {void}
   */
  save() {
    this.resetPostable(Date, window, this.$rootScope);

    this.post.twitterId = this.authStatus.twitter.username;
    this.post.siomeAuthId = this.authStatus.uid;

    action.addSquid(this.post);

    this.post = void 0;
  }

  /**
   * @returns {void}
   */
  update() {
    if (!this.authStatus) { return console.error('Cannot update because you have not logged in'); }
    this.resetPostable(Date, window, this.$rootScope);

    this.post.twitterId = this.authStatus.twitter.username;
    this.post.siomeAuthId = this.authStatus.uid;

    action.updateSquid(this.post);
  }

  /**
   * @returns {void}
   */
  remove() {
    if (!this.authStatus) { return console.error('Cannot remove because you have not logged in'); }
    action.removeSquid(this.authStatus.uid);
  }

  /**
   * @private
   * @param {Date} Date - constructor
   * @param {window} window - Global window
   * @returns {void}
   */
  resetPostable(Date, window) {
    const waitTime = 3 * 1000;
    this.postable = false;

    window.setTimeout(() => {
      this.postable = true;
      this.$rootScope.$apply();
    }, waitTime);

    this.remaining = waitTime / 1000;
    const timer = window.setInterval(() => {
      this.remaining--;
      if (this.remaining === 0) { window.clearInterval(timer); }
      this.$rootScope.$apply();
    }, 1000);
  }

  /**
   * @param {number} time - unixtime
   * @returns {string}
   */
  relativeTime(time) {
    return moment(time, 'x').fromNow();
  }
}

const ddo = () => {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: './app/directives/ika-app.html',
    controller: IkaAppController,
    controllerAs: directiveName
  };
};

angular.module(appName).directive(directiveName, ddo);
