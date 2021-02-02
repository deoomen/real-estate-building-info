/**
 * @author deoomen <deoomen@pm.me>
 *
 * @param {*} options
 */
function REBI(options) {
  'use strict';

  const defaultOptions = {
    container: '#rebi',
    resourceUrl: './sample.json',
    tipText: 'Kliknij na piętro aby wybrać',
    statuses: [
      {
        name: 'Dostępne',
        value: 0
      },
      {
        name: 'Zarezerwowane',
        value: 1
      },
      {
        name: 'Sprzedane',
        value: 2
      },
    ]
  };
  options = { ...defaultOptions, ...options };
  const _this = this;
  const _properties = {
    container$: null,
    carousels: {
      floors$: null,
      apartments$: null
    },
    resource: {},
    svgSchema: 'http://www.w3.org/2000/svg'
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

  // *** private methods ***

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

  /**
   * Build process.
   */
  const _buildREBI = function () {
    _buildBuilding();
    _buildParams();
    _buildFloors();
    _buildApartments();
  };

  /**
   * Log message to `console.error` output.
   *
   * @param {string} message text to log output error
   */
  const _logError = function (message) {
    console.error(`REBI failed: ${message}`);
  };

  const _scrollTo = function (classname) {
    window.scroll({
      top: document.querySelector(`${options.container} ${classname}`).offsetTop,
      behavior: 'smooth'
    });
  };

  /**
   * Build a svg building map with polygons.
   *
   * @param {HTMLElement} container$ svg parent element
   * @param {number} width naturalWidth for viewBox
   * @param {number} height naturalHeight for viewBox
   * @param {object} polygons array of polygons
   */
  const _buildMapBuilding = function (container$, width, height, polygons) {
    const svg = document.createElementNS(_properties.svgSchema, 'svg');
    svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);
    svg.classList.add('rebi__map');

    polygons.forEach(elem => {
      const polygon = document.createElementNS(_properties.svgSchema, 'polygon');
      polygon.setAttribute('points', elem.points.map(p => p.join(' ')).join(' '));
      polygon.dataset.floor = elem.floor;
      polygon.addEventListener('mousedown', function () {
        document.querySelector(`${options.container} input#floor${this.dataset.floor}`).click();
        _scrollTo('.rebi__section-floors-params');
      });

      svg.appendChild(polygon);
    });

    container$.appendChild(svg);
  };

  /**
   * Build a svg floor map with polygons.
   *
   * @param {HTMLElement} container$ svg parent element
   * @param {number} width naturalWidth for viewBox
   * @param {number} height naturalHeight for viewBox
   * @param {object} polygons array of polygons
   */
  const _buildMapFloor = function (container$, width, height, polygons) {
    const svg = document.createElementNS(_properties.svgSchema, 'svg');
    svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);
    svg.classList.add('rebi__map');

    polygons.forEach(apartment => {
      const polygon = document.createElementNS(_properties.svgSchema, 'polygon');
      polygon.setAttribute('points', apartment.points.map(p => p.join(' ')).join(' '));

      const apartmentData = _properties.resource.apartments.find(apartmentData => apartmentData.id === apartment.apartment);
      if (apartmentData) {
        polygon.classList.add(`status-${apartmentData.status}`);
        polygon.dataset.apartment = apartment.apartment;
        polygon.addEventListener('mousedown', function () {
          _carouselSwipe(
            _properties.carousels.apartments$,
            document
              .querySelector(`.rebi-carousel__slide[data-apartment="${this.dataset.apartment}"]`)
              .dataset.index
          );
          _scrollTo('.rebi__section-apartments-carousel');
        });
      }

      svg.appendChild(polygon);
    });

    container$.appendChild(svg);
  };

  /**
   * Build section 'building'.
   */
  const _buildBuilding = function () {
    const buildingSection$ = document.querySelector(`${options.container} .rebi__section-building`);

    // building
    const building$ = document.createElement('div');
    building$.classList.add('rebi__building');
    const buildingImage$ = document.createElement('img');
    buildingImage$.src = _properties.resource.image;
    buildingImage$.onload = function () {
      _buildMapBuilding(
        building$,
        this.naturalWidth,
        this.naturalHeight,
        _properties.resource.polygons
      );
    };
    building$.appendChild(buildingImage$);
    buildingSection$.appendChild(building$);

    // tip
    const tip$ = document.createElement('div');
    tip$.classList.add('rebi__tip');
    const tipText$ = document.createElement('span');
    tipText$.innerText = options.tipText;
    tip$.appendChild(tipText$);
    buildingSection$.appendChild(tip$);

    // title block
    const titleBlock$ = document.createElement('div');
    titleBlock$.classList.add('rebi__title-block');

    if (_properties.resource.subtitle) {
      const subtitle$ = document.createElement('span');
      subtitle$.classList.add('rebi__subtitle');
      subtitle$.innerText = _properties.resource.subtitle;
      titleBlock$.appendChild(subtitle$);
    }

    const title$ = document.createElement('h1');
    title$.classList.add('rebi__title');
    title$.innerText = _properties.resource.title;
    titleBlock$.appendChild(title$);

    buildingSection$.appendChild(titleBlock$);
  };

  /**
   * Build section 'floors', floors params.
   */
  const _buildParams = function () {
    _properties.resource.floors.forEach((floor, index) => {
      const paramId = `floor${floor.id}`;

      const paramBlock = document.createElement('div');
      paramBlock.classList.add('rebi__params-floor');

      const paramRadio = document.createElement('input');
      paramRadio.setAttribute('type', 'radio');
      paramRadio.setAttribute('name', 'floor');
      paramRadio.setAttribute('id', paramId);
      paramRadio.setAttribute('value', index);
      paramRadio.addEventListener('change', function () {
        _carouselSwipe(_properties.carousels.floors$, this.value);
        _carouselSwipe(
          _properties.carousels.apartments$,
          document
            .querySelector(`.rebi-carousel__slide[data-apartment="${_properties.resource.floors[this.value].polygons[0].apartment}"]`)
            .dataset.index
        );
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
    const img = carousel$.children[index].firstElementChild;
    if (img.dataset.src) {
      img.setAttribute('src', img.dataset.src);
      img.dataset.src = '';
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
      const slide = document.createElement('div');
      slide.classList.add('rebi-carousel__slide');
      slide.dataset.floor = floor.id;

      const img = document.createElement('img');
      img.setAttribute('id', `floor${floor.id}`);
      img.dataset.src = floor.image;
      img.setAttribute('alt', floor.name);
      img.onload = function () {
        _buildMapFloor(slide, this.naturalWidth, this.naturalHeight, floor.polygons);
      };

      slide.appendChild(img);
      _properties.carousels.floors$.appendChild(slide);
    });

    _carouselSwipe(_properties.carousels.floors$, 0);
  };

  /**
   * Build section 'apartments', apartments carousel.
   */
  const _buildApartments = function () {
    const carousel$ = document.querySelector(`${options.container} .rebi-carousel__apartments`);
    _properties.carousels.apartments$ = document.createElement('div');
    _properties.carousels.apartments$.classList.add('rebi-carousel__slides');
    carousel$.appendChild(_properties.carousels.apartments$);

    _properties.resource.apartments.forEach((apartment, index) => {
      // slide
      const slide$ = document.createElement('div');
      slide$.classList.add('rebi-carousel__slide');
      slide$.dataset.apartment = apartment.id;
      slide$.dataset.index = index;

      // image
      const img$ = document.createElement('img');
      img$.setAttribute('id', `floor${apartment.id}`);
      img$.dataset.src = apartment.image;
      img$.setAttribute('alt', apartment.name);
      slide$.appendChild(img$);

      // props
      const props$ = document.createElement('div');
      props$.classList.add('rebi-apartments-props');

      // props - name
      const name$ = document.createElement('p');
      name$.classList.add('rebi-apartments-props__name');
      name$.innerText = apartment.name;
      props$.appendChild(name$);

      // props - status
      const status$ = document.createElement('div');
      status$.classList.add('rebi-apartments-props__status');
      status$.classList.add('rebi__flag');
      const statusBlock$ = document.createElement('div');
      statusBlock$.classList.add('rebi__flag-block');
      switch (apartment.status) {
        case options.statuses[0].value:
          statusBlock$.classList.add('rebi__flag--available');
          break;

        case options.statuses[1].value:
          statusBlock$.classList.add('rebi__flag--reserved');
          break;

        case options.statuses[2].value:
          statusBlock$.classList.add('rebi__flag--sold');
          break;
      }

      const statusText$ = document.createElement('span');
      statusText$.classList.add('rebi__flag-name');
      statusText$.innerText = options.statuses.find(s => s.value === apartment.status).name;

      status$.appendChild(statusBlock$);
      status$.appendChild(statusText$);
      props$.appendChild(status$);

      // props - floor
      const floor$ = document.createElement('p');
      floor$.classList.add('rebi-apartments-props__floor');
      floor$.innerHTML = `Piętro: ${_properties.resource.floors.find(f => f.id === apartment.floor).name}`;
      props$.appendChild(floor$);

      // props - area
      const area$ = document.createElement('p');
      area$.classList.add('rebi-apartments-props__area');
      area$.innerHTML = `Powierzchnia: ${apartment.area} m<sup>2</sup>`;
      props$.appendChild(area$);

      // props - rooms
      const rooms$ = document.createElement('p');
      rooms$.classList.add('rebi-apartments-props__rooms');
      rooms$.innerText = `Pokoje: ${apartment.rooms}`;
      props$.appendChild(rooms$);

      // props - desc
      const desc$ = document.createElement('p');
      desc$.classList.add('rebi-apartments-props__desc');
      desc$.innerHTML = apartment.description.replace(/(?:\r\n|\r|\n)/g, '<br>');
      props$.appendChild(desc$);

      // props - other
      // apartment.properties.forEach(prop => {
      //   const prop$ = document.createElement('p');
      //   prop$.classList.add('rebi-apartments-props__prop');
      //   prop$.innerText = ;
      //   props$.appendChild(prop$);
      // });

      // button
      const btn$ = document.createElement('a');
      btn$.classList.add('rebi__btn');
      btn$.classList.add('rebi-apartments-btn');
      btn$.innerText = 'Pobierz kartę mieszkania';
      btn$.setAttribute('href', apartment.pdf);
      btn$.setAttribute('rel', 'nofollow');
      props$.appendChild(btn$);

      slide$.appendChild(props$);
      _properties.carousels.apartments$.appendChild(slide$);
    });

    _carouselSwipe(_properties.carousels.apartments$, 0);
  };
}
