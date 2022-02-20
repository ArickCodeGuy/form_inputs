'use strict';
const defaultOptions = {
  hideSelect: true,
  init: true,
  multipleSelect: false,
  hideOnOutsideClick: true,
};

class CustomSelect {
  constructor(el, options) {
    this.el = el;
    this.elType = this.#getType();
    this.options = Object.assign({}, defaultOptions, options);
    this.options.init ? this.init(): false;
  }

  #createOptions(elObj) {
    let optionsEl = document.createElement('div');
    optionsEl.classList.add('custom-select-options');
    optionsEl.style.display = 'none';
    elObj.optionElArr.forEach((el) => {
      let optionEl = document.createElement('div');
      optionEl.classList.add('custom-select-option');
      el.selected ? optionEl.classList.add('selected'): false;
      el.disabled ? optionEl.classList.add('disabled'): false;
      optionEl.innerHTML = el.innerHTML;
      optionEl.dataset.value = el.value;
      elObj.customOptionElArr.push(optionEl);
      optionsEl.insertAdjacentElement('beforeend', optionEl);
    });
    return optionsEl
  }

  #createPlaceholder(elObj) {
    let placeholder = document.createElement('div');
    placeholder.innerHTML = elObj.selectEl.querySelector(`option:nth-child(${elObj.selectEl.selectedIndex + 1})`).innerHTML;
    placeholder.classList.add('custom-select-placeholder');
    return placeholder
  }

  #createCustomSelect(elObj) {
    let customSelectEl = document.createElement('div');
    customSelectEl.classList.add('custom-select-select');
    customSelectEl.insertAdjacentElement('afterbegin', elObj.placeholder);
    customSelectEl.insertAdjacentElement('beforeend', elObj.customOptionsEl);
    return customSelectEl
  }

  #create(elObj) {
    // Creating custom select elements
    elObj.customOptionsEl = this.#createOptions(elObj);
    elObj.placeholder = this.#createPlaceholder(elObj);
    elObj.customSelectEl = this.#createCustomSelect(elObj);

    // hide / not hide <select> element if option is specified
    this.options.hideSelect ? elObj.selectEl.style.display = 'none': false;

    // adding .custom-select-select element beforeend of .custom-select
    elObj.el.insertAdjacentElement('beforeend', elObj.customSelectEl);
  }

  #addEvents(elObj) {
    // click on placeholder
    elObj.placeholder.addEventListener('click', () => this.#toggleOptions(elObj));

    // click on custom option element
    elObj.customOptionElArr.forEach((customOptionElement) => {
      customOptionElement.addEventListener('click', (e) => {
        if (!customOptionElement.classList.contains('disabled')) {
          elObj.placeholder.innerHTML = customOptionElement.innerHTML;
          this.#toggleOptions(elObj);
          elObj.selectEl.value = customOptionElement.dataset.value;

          elObj.customOptionsEl.querySelector('.selected').classList.remove('selected');
          e.currentTarget.classList.add('selected');
        }
      });
    });

    // hide on click outside of custom select
    if (this.options.hideOnOutsideClick) {
      // currently there is no removeEventListener for this event on destroy()
      const onDocumentMouseClick = e => {
        if (!e.target === elObj.el || !elObj.el.contains(e.target)) {
          this.#closeOptions(elObj);
        };
      };
      document.addEventListener('click', onDocumentMouseClick);
    };
  }

  #toggleOptions(elObj) {
    elObj.el.classList.toggle('options-toggled');
    elObj.customOptionsEl.classList.toggle('toggled');
    elObj.customOptionsEl.style.display === 'none' ? elObj.customOptionsEl.style.display = 'block': elObj.customOptionsEl.style.display = 'none';
  }

  #closeOptions(elObj) {
    elObj.el.classList.remove('options-toggled');
    elObj.customOptionsEl.classList.remove('toggled');
    elObj.customOptionsEl.style.display = 'none';
  }

  #afterInitFunc(elObj) {
    typeof this.options.afterInit === 'function' ? this.options.afterInit(): false;
  }

  #initSingleElement(el) {
    const elObj = {
      el: el,
      selectEl: el.querySelector('select'),
      optionElArr: null,
      customOptionsEl: null,
      customOptionElArr: [],
      placeholder: null,
      customSelectEl: null,
    };
    if (!elObj.selectEl) {
      throw `CustomSelect Err: No <select> tag found within ${this.el} element`
    };
    elObj.optionElArr = elObj.selectEl.querySelectorAll('option');

    this.#create(elObj);
    this.#addEvents(elObj);
    this.#afterInitFunc(elObj);
    el.classList.add('custom-select-initialized');
  }

  #initArray(arr) {
    arr.forEach((el, i) => this.#initSingleElement(el));
  }

  #destroySingleElement(el) {
    let customSelect = el.querySelector('.custom-select-select');
    customSelect.remove();
    el.classList.remove('custom-select-initialized');
    el.classList.remove('options-toggled');
    el.querySelector('select').style.display = 'block';
    document.removeEventListener('click', onDocumentMouseClick);
  }

  #destroyArray(arr) {
    arr.forEach((el) => this.#destroySingleElement(el));
  }

  #getType() {
    if (typeof this.el === 'string') {
      return 'string'
    }else if (NodeList.prototype.isPrototypeOf(this.el)) {
      return 'NodeList'
    }else if (HTMLElement.prototype.isPrototypeOf(this.el)) {
      return 'HTMLElement'
    }else {
      throw `CustomSelect err: specified el: ${this.el} doesn't match eny allowed type of variable`;
    };
  }

  init() {
    if (this.elType === 'string') {
      const el = document.querySelectorAll(this.el);
      el ? this.#initArray(el): false;
    }else if (this.elType === 'NodeList') {
      this.#initArray(this.el);
    }else if (this.elType === 'HTMLElement') {
      this.#initSingleElement(this.el);
    };
  }

  destroy() {
    if (this.elType === 'string') {
      const el = document.querySelectorAll(this.el);
      el ? this.#destroyArray(el): false;
    }else if (this.elType === 'NodeList') {
      this.#destroyArray(this.el);
    }else if (this.elType === 'HTMLElement') {
      this.#destroySingleElement(this.el);
    };
  }
};