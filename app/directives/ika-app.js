import angular from 'angular';
import Firebase from 'firebase';
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
  constructor($firebaseArray, Auth) {
    IkaAppController.$inject = ['$firebaseArray', 'Auth'];
    this.$firebaseArray = $firebaseArray;
    this.Auth = Auth;

    this.initAuthStatus();
    this.initWebsiteElements();

    store.on('CHANGE', this.onChange.bind(this));
    action.load();
  }

  /**
   * @private
   * @returns {void}
   */
  onChange() {
    this.hordeOfSquid = this.$firebaseArray(store.fireArrayRef);
  }

  /**
   * @private
   * @returns {void}
   */
  initAuthStatus() {
    this.Auth.$waitForAuth().then((res) => {
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
    this.Auth.$authWithOAuthPopup('github', (err, data) => {
      if (err) { console.error('Login Failed!', err); }
      console.info('Authenticated successfully with payload:', data);
    });
  }

  /**
   * @returns {void}
   */
  logout() {
    this.Auth.$unauth();
  }

  /**
   * @returns {void}
   */
  save() {
    this.post.siomeAuthId = this.authStatus.uid;
    action.addSquid(this.post);
    this.post = void 0;
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
