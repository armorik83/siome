import angular from 'angular';
import {appName} from '../constants';
import {action} from './ika-app';

const directiveName = 'ikaEntryForm';

class IkaEntryFormController {
  constructor($rootScope) {
    IkaEntryFormController.$inject = ['$rootScope'];
    this.$rootScope = $rootScope;
    this.postable = true;
  }

  /**
   * @returns {void}
   */
  login() {
    action.login();
  }

  /**
   * @returns {void}
   */
  logout() {
    action.logout();
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
}

function ddo() {
  return {
    restrict:         'E',
    templateUrl:      './app/directives/ika-entry-form.html',
    controller:       IkaEntryFormController,
    controllerAs:     directiveName,
    scope:            {},
    bindToController: {
      authStatus: '=ikaAuthStatus',
      registered: '=ikaRegistered',
      postable:   '=ikaPostable'
    }
  };
}

angular.module(appName).directive(directiveName, ddo);
