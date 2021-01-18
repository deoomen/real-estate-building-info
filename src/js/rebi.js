/**
 * @author deoomen <deoomen@pm.me>
 *
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

  /**
   * Log message to `console.error` output.
   *
   * @param {string} message text to log output error
   */
  const _logError = function (message) {
    console.error(`REBI failed: ${message}`);
  };

  /**
   * Build section 'building'.
   */
  const _buildBuilding = function () {
    document.querySelector(`${options.container} .rebi__title`).innerText = _properties.resource.title;
    document.querySelector(`${options.container} .rebi__subtitle`).innerText = _properties.resource.subtitle;
    document.querySelector(`${options.container} .rebi__building img`).src = _properties.resource.image;
  };

  /**
   * Build section 'floors'.
   */
  const _buildParams = function () {
    _properties.resource.floors.forEach((floor, index) => {
      const paramId = 'floor' + index;

      const paramBlock = document.createElement('div');
      paramBlock.classList.add('rebi__params-floor');

      const paramRadio = document.createElement('input');
      paramRadio.setAttribute('type', 'radio');
      paramRadio.setAttribute('name', 'floor');
      paramRadio.setAttribute('id', paramId);
      paramRadio.setAttribute('value', index);

      const paramLabel = document.createElement('label');
      paramLabel.setAttribute('for', paramId);
      paramLabel.innerText = floor.name;

      paramBlock.appendChild(paramRadio);
      paramBlock.appendChild(paramLabel);

      document.querySelector(`${options.container} .rebi__params-floors`).appendChild(paramBlock);
    });
  };

  /**
   * Build process.
   */
  const _buildREBI = function () {
    _buildBuilding();
    _buildParams();
  };

  /**
   * Load resource and runs build process.
   */
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

  /**
   * Initialize REBI plugin.
   */
  this.init = function () {
    _properties.container = document.querySelector(options.container);
    if (_properties.container === null) {
      _logError('Container not found');

      return;
    }

    _getResource();
  };
}
