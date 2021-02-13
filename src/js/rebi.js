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
    texts: {
      tip: 'Kliknij na piętro aby wybrać',
      floors: 'Kondygnacje',
      legend: 'Legenda',
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
      ],
      btnSwitchToList: 'Przełącz na listę',
      btnSwitchToPlan: 'Przełącz na rzut',
      listHeaders: [
        'Nazwa:',
        'Powierzchnia:',
        'Pokoje:',
        'Akcja:'
      ]
    }
  };
  options = { ...defaultOptions, ...options };
  const _properties = {
    container$: null,
    tooltip$: null,
    sections: {
      building$: null,
      params$: null,
      floors$: null,
      floorsList$: null,
      apartments$: null
    },
    carousels: {
      floors$: null,
      floorsList$: null,
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
    _properties.tooltip$ = document.createElement('div');
    _properties.tooltip$.setAttribute('id', 'tooltipFloor');
    _properties.tooltip$.classList.add('rebi__tooltip');
    _properties.container$.appendChild(_properties.tooltip$);

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

  /**
   * Scrolls window to given element by classname.
   *
   * @param {string} classname
   */
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
      const polygon$ = document.createElementNS(_properties.svgSchema, 'polygon');
      polygon$.setAttribute('points', elem.points.map(p => p.join(' ')).join(' '));
      polygon$.dataset.floor = elem.floor;
      polygon$.addEventListener('mousedown', function () {
        document.querySelector(`${options.container} input#floor${this.dataset.floor}`).click();
        _scrollTo('.rebi__section-floors-params');
      });
      _tooltipEvents(polygon$, _properties.resource.floors.find(f => f.id === elem.floor).name);

      svg.appendChild(polygon$);
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
      const polygon$ = document.createElementNS(_properties.svgSchema, 'polygon');
      polygon$.setAttribute('points', apartment.points.map(p => p.join(' ')).join(' '));

      const apartmentData = _properties.resource.apartments.find(apartmentData => apartmentData.id === apartment.apartment);
      if (apartmentData) {
        polygon$.classList.add(`status-${apartmentData.status}`);
        polygon$.dataset.apartment = apartment.apartment;
        polygon$.addEventListener('mousedown', function () {
          _carouselSwipe(
            _properties.carousels.apartments$,
            document
              .querySelector(`.rebi-carousel__slide[data-apartment="${this.dataset.apartment}"]`)
              .dataset.index
          );
          _scrollTo('.rebi__section-apartments-carousel');
        });
        _tooltipEvents(polygon$, `${apartmentData.name}<br/>${apartmentData.area} m<sup>2</sup> | <span class="rebi__flag--color-${apartmentData.status}">${options.texts.statuses.find(s => s.value === apartmentData.status).name}</span><br/>KLIKNIJ PO SZCZEGÓŁY`);
      }

      svg.appendChild(polygon$);
    });

    container$.appendChild(svg);
  };

  /**
   * Build section 'building'.
   */
  const _buildBuilding = function () {
    const buildingSection$ = document.createElement('div');
    _properties.sections.building$ = buildingSection$;
    buildingSection$.classList.add('rebi__section');
    buildingSection$.classList.add('rebi__section-building');

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
    tipText$.innerText = options.texts.tip;
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

    _properties.container$.appendChild(buildingSection$);
  };

  /**
   * Build section 'floors', floors params.
   */
  const _buildParams = function () {
    const floorsSection$ = document.createElement('div');
    _properties.sections.params$ = floorsSection$;
    floorsSection$.classList.add('rebi__section');
    floorsSection$.classList.add('rebi__section--padding');
    floorsSection$.classList.add('rebi__section-floors-params');

    const params$ = document.createElement('div');
    params$.classList.add('rebi__params');

    // floors title
    const titleFloors$ = document.createElement('span');
    titleFloors$.classList.add('rebi__subsection-title');
    titleFloors$.innerText = options.texts.floors;
    params$.appendChild(titleFloors$);

    // params floors
    const paramsFloors$ = document.createElement('div');
    paramsFloors$.classList.add('rebi__params-floors');
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
        _carouselSwipe(_properties.carousels.floorsList$, this.value);
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

      paramsFloors$.appendChild(paramBlock);
    });
    params$.appendChild(paramsFloors$);
    floorsSection$.appendChild(params$);

    // legend
    const legend$ = document.createElement('div');
    legend$.classList.add('rebi__legend');
    legend$.classList.add('rebi__row');

    // left
    const left$ = document.createElement('div');
    left$.classList.add('rebi__col');
    left$.classList.add('rebi__col--left');

    const titleLegend$ = document.createElement('span');
    titleLegend$.classList.add('rebi__subsection-title');
    titleLegend$.innerText = options.texts.legend;
    left$.appendChild(titleLegend$);

    // flags
    const flags$ = document.createElement('div');
    flags$.classList.add('rebi__flags');

    for (let i = 0; i < 3; i++) {
      const flag$ = document.createElement('div');
      flag$.classList.add('rebi__flag');

      const flagBlock$ = document.createElement('div');
      flagBlock$.classList.add('rebi__flag-block');
      flagBlock$.classList.add(`rebi__flag--${i}`);

      flag$.appendChild(flagBlock$);

      const flagName$ = document.createElement('span');
      flagName$.classList.add('rebi__flag-name');
      flagName$.innerText = options.texts.statuses[i].name;
      flag$.appendChild(flagName$);

      flags$.appendChild(flag$);
    }

    left$.appendChild(flags$);

    // right
    const right$ = document.createElement('div');
    right$.classList.add('rebi__col');
    right$.classList.add('rebi__col--right');
    right$.classList.add('rebi__views');

    const btn$ = document.createElement('button');
    btn$.classList.add('rebi__btn');
    btn$.classList.add('rebi__btn-view');
    btn$.setAttribute('type', 'button');
    btn$.dataset.state = 'list';
    btn$.addEventListener('mousedown', function () {
      if (this.dataset.state === 'list') {
        this.dataset.state = 'plan';
        this.children[0].innerText = options.texts.btnSwitchToPlan;
        _properties.sections.floors$.setAttribute('style', 'display:none;');
        _properties.sections.floorsList$.setAttribute('style', 'display:block;');
      } else if (this.dataset.state === 'plan') {
        this.dataset.state = 'list';
        this.children[0].innerText = options.texts.btnSwitchToList;
        _properties.sections.floorsList$.setAttribute('style', 'display:none;');
        _properties.sections.floors$.setAttribute('style', 'display:block;');
      }
    });

    const btnText$ = document.createElement('span');
    btnText$.innerText = options.texts.btnSwitchToList;
    btn$.appendChild(btnText$);

    right$.appendChild(btn$);

    legend$.appendChild(left$);
    legend$.appendChild(right$);

    floorsSection$.appendChild(legend$);

    _properties.container$.appendChild(floorsSection$);
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
    // plan
    const carousel$ = document.createElement('div');
    _properties.sections.floors$ = carousel$;
    carousel$.classList.add('rebi__section');
    carousel$.classList.add('rebi__section-floors-carousel');
    carousel$.classList.add('rebi-carousel');
    carousel$.classList.add('rebi-carousel__floors');

    _properties.carousels.floors$ = document.createElement('div');
    _properties.carousels.floors$.classList.add('rebi-carousel__slides');
    carousel$.appendChild(_properties.carousels.floors$);

    // list
    const carouselList$ = document.createElement('div');
    _properties.sections.floorsList$ = carouselList$;
    carouselList$.classList.add('rebi__section');
    carouselList$.classList.add('rebi__section-floors-list-carousel');
    carouselList$.classList.add('rebi-carousel');
    carouselList$.classList.add('rebi-carousel__floors-list');

    _properties.carousels.floorsList$ = document.createElement('div');
    _properties.carousels.floorsList$.classList.add('rebi-carousel__slides');
    carouselList$.appendChild(_properties.carousels.floorsList$);

    _properties.resource.floors.forEach(floor => {
      // plan
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

      // list
      const slideList$ = document.createElement('div');
      slideList$.classList.add('rebi-carousel__slide');
      slideList$.dataset.floor = floor.id;

      const apartmentsContainer$ = document.createElement('div');
      apartmentsContainer$.classList.add('rebi__table');

      const tr$ = document.createElement('div');
      tr$.classList.add('rebi__table-tr');

      const th0$ = document.createElement('div');
      th0$.classList.add('rebi__table-th');
      th0$.innerText = options.texts.listHeaders[0];

      const th1$ = document.createElement('div');
      th1$.classList.add('rebi__table-th');
      th1$.innerText = options.texts.listHeaders[1];

      const th2$ = document.createElement('div');
      th2$.classList.add('rebi__table-th');
      th2$.innerText = options.texts.listHeaders[2];

      // const th3$ = document.createElement('div');
      // th3$.classList.add('rebi__table-th');
      // th3$.innerText = _properties.texts.listHeaders[3];

      tr$.appendChild(th0$);
      tr$.appendChild(th1$);
      tr$.appendChild(th2$);
      // tr$.appendChild(th3$);

      apartmentsContainer$.appendChild(tr$);
      floor.apartments.forEach(apartmentId => {
        const apartment = _properties.resource.apartments.find(a => a.id === apartmentId);
        const tr$ = document.createElement('div');
        tr$.classList.add('rebi__table-tr');
        tr$.classList.add(`rebi__flag--${apartment.status}`);
        tr$.dataset.apartmentId = apartmentId;
        tr$.addEventListener('mousedown', function () {
          _carouselSwipe(
            _properties.carousels.apartments$,
            document
              .querySelector(`.rebi-carousel__slide[data-apartment="${apartmentId}"]`)
              .dataset.index
          );
          _scrollTo('.rebi__section-apartments-carousel');
        });

        const td0$ = document.createElement('div');
        td0$.classList.add('rebi__table-td');
        td0$.innerText = apartment.name;

        const td1$ = document.createElement('div');
        td1$.classList.add('rebi__table-td');
        td1$.innerHTML = `${apartment.area} m<sup>2</sup>`;

        const td2$ = document.createElement('div');
        td2$.classList.add('rebi__table-td');
        td2$.innerText = apartment.rooms;

        tr$.appendChild(td0$);
        tr$.appendChild(td1$);
        tr$.appendChild(td2$);

        apartmentsContainer$.appendChild(tr$);
      });
      slideList$.appendChild(apartmentsContainer$);

      _properties.carousels.floorsList$.appendChild(slideList$);
    });

    _properties.container$.appendChild(carousel$);
    _properties.container$.appendChild(carouselList$);
    _carouselSwipe(_properties.carousels.floors$, 0);
    _carouselSwipe(_properties.carousels.floorsList$, 0);
  };

  /**
   * Build section 'apartments', apartments carousel.
   */
  const _buildApartments = function () {
    const carousel$ = document.createElement('div');
    _properties.sections.apartments$ = carousel$;
    carousel$.classList.add('rebi__section');
    carousel$.classList.add('rebi__section-apartments-carousel');
    carousel$.classList.add('rebi-carousel');
    carousel$.classList.add('rebi-carousel__apartments');

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
      statusBlock$.classList.add(`rebi__flag--${apartment.status}`);

      const statusText$ = document.createElement('span');
      statusText$.classList.add('rebi__flag-name');
      statusText$.innerText = options.texts.statuses.find(s => s.value === apartment.status).name;

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

    _properties.container$.appendChild(carousel$);
    _carouselSwipe(_properties.carousels.apartments$, 0);
  };

  /**
   * Attach mouse events which shows tooltip.
   *
   * @param {HTMLElement} element$
   * @param {string} html
   */
  const _tooltipEvents = function (element$, html) {
    element$.addEventListener('mouseenter', function () {
      _properties.tooltip$.classList.add('rebi__tooltip--visible');
      _properties.tooltip$.innerHTML = html;
    });
    element$.addEventListener('mousemove', function (event) {
      _properties.tooltip$.setAttribute('style', `top:${event.pageY - 38}px;left:${event.pageX + 14}px`);
    });
    element$.addEventListener('mouseleave', function () {
      _properties.tooltip$.classList.remove('rebi__tooltip--visible');
    });
  };
}
