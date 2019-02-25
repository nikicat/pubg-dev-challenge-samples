/**
 * Game Event Provider service
 * This will listen to events from the game provided by
 * Overwolf's Game Events Provider
 */
define([
    '../services/screenshots-service.js'
  ],
  function (screenshotService) {

    const REQUIRED_FEATURES = ['kill', 'death', 'match', 'location', 'me', 'map', 'phase', 'roster', 'killer'];
    const REGISTER_RETRY_TIMEOUT = 10000;

    function registerToGEP() {
      // set the features we are interested in receiving
      overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, function (response) {
        if (response.status === 'error') {
          setTimeout(registerToGEP, REGISTER_RETRY_TIMEOUT);
        } else if (response.status === 'success') {
          overwolf.games.events.onNewEvents.removeListener(_handleGameEvent);
          overwolf.games.events.onNewEvents.addListener(_handleGameEvent);
        }
      });
      overwolf.games.getRunningGameInfo(function(value) {
        console.log('RunningGameInfo');
        console.log(value);
      })
    }

    async function _handleGameEvent(eventsInfo) {
      for (let eventData of eventsInfo.events) {
        console.log('event: ' + JSON.stringify(eventData));
        switch (eventData.name) {
          case 'kill': {
            try {
              let screenshotUrl = await screenshotService.takeScreenshot();
              window.ow_eventBus.trigger('screenshot', screenshotUrl);
            } catch (e) {
              console.error(e);
            }

            break;
          }
        }
      }
    }

    return {
      registerToGEP
    }
  });
