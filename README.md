# Real estate building info

TODO: add some info about package...

## Usage

Include script in your HTML code:

```html
<script src="js/rebi.js"></script>
```

Next, in your JS just init REBI:

```js
(new REBI()).init();
```

It is safer to be sure that all DOM content are ready:

```js
(function() {
  (new REBI()).init();
})();
```

## Default options

```js
{
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
}
```

Options are passed through the constructor.

```js
const rebi = new REBI({
  container: '#myContainer',
  resourceUrl: 'https://mysite.com/schema'
});
rebi.init();
```
