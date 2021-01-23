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
    container$: null,
    carousels: {
      floors$: null
    },
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
   * Build section 'floors', floors params.
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
      paramRadio.addEventListener('change', function () {
        _carouselSwipe(_properties.carousels.floors$, this.value);
      });

      const paramLabel = document.createElement('label');
      paramLabel.setAttribute('for', paramId);
      paramLabel.innerText = floor.name;

      paramBlock.appendChild(paramRadio);
      paramBlock.appendChild(paramLabel);

      document.querySelector(`${options.container} .rebi__params-floors`).appendChild(paramBlock);
    });
  };

  /**
   * Move given carousel to given index.
   *
   * @param {HTMLElement} carousel$
   * @param {number} index
   */
  const _carouselSwipe = function (carousel$, index) {
    if (carousel$.children[index].dataset.src) {
      carousel$.children[index].setAttribute('src', carousel$.children[index].dataset.src);
      carousel$.children[index].dataset.src = '';
    }

    carousel$.setAttribute('style', `transform: translateX(-${index}00%)`);
  };

  /**
   * Build section 'floors', floors carousel.
   */
  const _buildFloors = function () {
    const carousel = document.querySelector(`${options.container} .rebi-carousel__floors`);
    _properties.carousels.floors$ = document.createElement('div');
    _properties.carousels.floors$.classList.add('rebi-carousel__slides');
    carousel.appendChild(_properties.carousels.floors$);

    _properties.resource.floors.forEach(floor => {
      const img = document.createElement('img');
      img.setAttribute('id', `floor${floor.id}`);
      img.dataset.src = floor.image;
      img.setAttribute('alt', floor.name);

      _properties.carousels.floors$.appendChild(img);
    });

    _carouselSwipe(_properties.carousels.floors$, 0);
  };

  /**
   * Build process.
   */
  const _buildREBI = function () {
    _buildBuilding();
    _buildParams();
    _buildFloors();
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
    _properties.container$ = document.querySelector(options.container);
    if (_properties.container$ === null) {
      _logError('Container not found');

      return;
    }

    _getResource();
  };
}
