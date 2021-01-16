/**
 * @author deoomen <deoomen@pm.me>
 * @param {*} options
 */
function REBI(options) {
  'use strict';

  const defaultOptions = {
    container: '#rebi',
    resourceUrl: './sample.json'
  };
  options = { ...defaultOptions, ...options };
  const _this = this;
  const _properties = {
    container: null,
    resource: {},
  };

  // *** private methods ***
  const _logError = function (message) {
    console.error(`REBI failed: ${message}`);
  };

  const _buildBuilding = function () {
    document.querySelector(`${options.container} .rebi__title`).innerText = _properties.resource.title;
    document.querySelector(`${options.container} .rebi__subtitle`).innerText = _properties.resource.subtitle;
    document.querySelector(`${options.container} .rebi__building img`).src = _properties.resource.image;
  };

  const _buildREBI = function () {
    _buildBuilding();
  };

  const _getResource = function () {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', options.resourceUrl, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
      if (xhr.status === 200) {
        _properties.resource = xhr.response;
        console.log(_properties);
        _buildREBI();
      } else {
        _logError(`Cannot load resource. ${xhr.status} - ${xhr.statusText}`);
      }
    };
    xhr.onerror = function () {
      _logError('Fetching resource crashed.');
    };
    xhr.send();
  };

  // *** public methods ***
  this.init = function () {
    _properties.container = document.querySelector(options.container);
    if (_properties.container === null) {
      _logError('Container not found');

      return;
    }
    _getResource();
  };
}
