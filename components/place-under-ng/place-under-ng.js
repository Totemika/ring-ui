/**
 * @name Place Under Ng
 * @category Angular Components
 * @description Displays a sidebar that fills the entire right half of its container.
 * To make sidebar have fixed positioning under some other element (e.g. toolbar),
 * a selector for that element should be passed as placeUnderSibling parameter.
 * @example-file ./place-under-ng.examples.html
 */

import 'dom4';
import debounce from 'mout/function/debounce';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';

import {getDocumentScrollTop} from '../dom/dom';

/* global angular: false */
const angularModule = angular.module('Ring.place-under', []);
angularModule.directive('rgPlaceUnder', ($window, getClosestElementWithCommonParent, rgPlaceUnderHelper) => ({
  restrict: 'A',
  link(scope, iElement, iAttrs) {
    const element = iElement[0];
    const synchronizer = rgPlaceUnderHelper.createPositionSynchronizer(element, iAttrs, scope);

    function startSyncing(placeUnderSelector) {
      if (placeUnderSelector) {
        scope.$evalAsync(() => {
          const syncWith = getClosestElementWithCommonParent(element, placeUnderSelector);

          if (syncWith) {
            synchronizer.syncPositionWith(syncWith);
          } else {
            throw new Error('rgPlaceUnder cannot find element to sync with.');
          }
        });
      }
    }

    iAttrs.$observe('rgPlaceUnder', startSyncing);
  }
}));


angularModule.factory('getClosestElementWithCommonParent', () => function getClosestElementWithCommonParent(currentElement, selector) {
  const parent = currentElement.parentNode;
  if (parent) {
    return parent.query(selector) || getClosestElementWithCommonParent(parent, selector);
  } else {
    return null;
  }
});


angularModule.factory('rgPlaceUnderHelper', $window => {
  const DEBOUNCE_INTERVAL = 10;
  const AFTER_SCROLL_RECHECK_INTERVAL = 50;
  const HEIGHT_CHECK_INTERVAL = 50;

  return {
    DEBOUNCE_INTERVAL,
    AFTER_SCROLL_RECHECK_INTERVAL,
    HEIGHT_CHECK_INTERVAL,
    createPositionSynchronizer: (element, iAttrs, scope) => {
      const topOffset = parseInt(iAttrs.placeTopOffset, 10) || 0;
      const syncHeight = iAttrs.syncHeight;

      let syncBottom = [];
      let removeScrollListener = [];

      if (iAttrs.syncBottom) {
        syncBottom = iAttrs.syncBottom.split(',');
      }

      function waitForNonZeroHeight(elementToCheck) {
        return new Promise(resolve => {
          function checkElementHeight() {
            if (elementToCheck.offsetHeight === 0) {
              $window.setTimeout(checkElementHeight, HEIGHT_CHECK_INTERVAL);
            } else {
              resolve();
            }
          }

          checkElementHeight();
        });
      }

      function onScroll(syncElement) {
        const documentScrollTop = getDocumentScrollTop();
        const documentOffsetHeight = ($window.document.documentElement && $window.document.documentElement.offsetHeight) || $window.document.body.offsetHeight;

        const syncedElementHeight = syncElement.offsetHeight;
        const syncedElementOffsetTop = syncElement.getBoundingClientRect().top + documentScrollTop;

        const bottom = syncedElementOffsetTop + syncedElementHeight;

        const margin = Math.max(bottom - documentScrollTop, syncedElementHeight);

        element.style.marginTop = `${margin + topOffset}px`;

        if (syncHeight) {
          /**
           * Decrease height by margin value to make scroll work properly
           */
          let bottomOffset = 0;
          if (syncBottom.length) {
            for (let i = 0; i < syncBottom.length; i++) {
              const elem = $window.document.querySelector(syncBottom[i]);

              if (elem) {
                const boundingRect = elem.getBoundingClientRect();

                if (boundingRect.top === 0) {
                  continue;
                }

                const marginTop = parseInt($window.getComputedStyle(elem).
                  getPropertyValue('margin-top'), 10);
                bottomOffset = documentOffsetHeight - boundingRect.top + marginTop;
                if (bottomOffset < 0) {
                  bottomOffset = 0;
                }

                break;
              }
            }
          }

          element.style.height = `calc(100% - ${parseInt(element.style.marginTop, 10) + bottomOffset}px)`;
        }
      }

      function removeScrollListeners() {
        removeScrollListener.map(cb => cb());
        removeScrollListener = [];
      }

      function syncPositionWith(syncElement) {
        removeScrollListeners();

        const afterScrollFinishRecheck = debounce(() => this.onScroll(syncElement), AFTER_SCROLL_RECHECK_INTERVAL);

        const sidebarScrollListener = debounce(() => {
          this.onScroll(syncElement);
          afterScrollFinishRecheck();
        }, DEBOUNCE_INTERVAL);

        this.waitForNonZeroHeight(syncElement).then(sidebarScrollListener);

        $window.addEventListener('scroll', sidebarScrollListener);
        removeScrollListener.push(() => {
          $window.removeEventListener('scroll', sidebarScrollListener);
        });


        removeScrollListener.push(scope.$watch('show', sidebarScrollListener));
        removeScrollListener.push(scope.$on('rgPlaceUnder:sync', sidebarScrollListener));


        const elementToHeightListening = iAttrs.listenToHeightChange ? $window.document.querySelector(iAttrs.listenToHeightChange) : $window.document.body;
        const documentResizeSensor = new ResizeSensor(elementToHeightListening, sidebarScrollListener);
        removeScrollListener.push(documentResizeSensor.detach.bind(documentResizeSensor));
      }

      scope.$on('$destroy', removeScrollListeners);

      return {
        waitForNonZeroHeight,
        onScroll,
        syncPositionWith
      };
    }
  };
});

export default angularModule.name;
