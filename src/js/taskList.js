import ToolTip from './toolTip.js';
import XhrRequest from './xhrRequest.js';

export default class TaskList {
  constructor(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    this._element = element;
    this.form = false;
    this.activeTask = false;

    this.XhrRequest = new XhrRequest();

    this.addForm = this.addForm.bind(this);
    this.removeForm = this.removeForm.bind(this);
    this.onTaskItem = this.onTaskItem.bind(this);
    this.printTaskItem = this.printTaskItem.bind(this);
    this.addAgreeFrom = this.addAgreeFrom.bind(this);

    this.editItem = this.editItem.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.toolTip = new ToolTip();
    this.errorsMsg = this.toolTip.errors();
    this.getErrorMsg = this.getErrorMsg.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.isHereToolTip = false;
  }

  init() {
    this._element.querySelector('.header__btn').addEventListener('click', this.addForm);
    this._element.querySelector('.task-list__items-list').addEventListener('click', this.onTaskItem);

    this.XhrRequest.getDataForItems().then((body) => {
      if (body.length == 0) return;

      for (let i = 0; i < body.length; i++) {
        this.printTaskItem(body[i].name, body[i].date);
      }
    });
  }

  addForm() {
    const form = document.createElement('form');
    form.className = 'task-widget__form';
    form.noValidate = 'novalidate';
    form.innerHTML = `<div class="form__item">
                        <h2 class="form__item__title">Описание</h2>
                        <input name="name" id="name" class="input name" type="text" placeholder="Описание" required>
                      </div>
                      <div class="form__item">
                        <h2 class="form__item__title">Подробное описане</h2>
                        <textarea class="form__textarea" name="textarea" placeholder="Подробное описание" required></textarea>
                      </div>
                      <div class="form__buttons">
                        <button type="submit" class="form-btn save-btn">Добавить</button>
                        <button type="reset" class="form-btn cancel-btn">Отмена</button>
                      </div>`;

    document.querySelector('.conteiner').appendChild(form);

    form.addEventListener('submit', this.onSubmit);
    form.querySelector('.cancel-btn').addEventListener('click', this.removeForm);

    const inputs = form.querySelectorAll('.input');
    inputs.forEach((el) => {
      el.addEventListener('focus', () => {
        el.addEventListener('blur', this.onBlur);
      });
    });

    this.form = form;
  }

  removeForm() {
    if (!this.form) return;

    const toolTips = document.querySelectorAll('.tooltip');
    if (toolTips) {
      for (let i = 0; i <= toolTips.length - 1; i += 1) {
        toolTips[i].remove();
      }
    }

    this.form.removeEventListener('submit', this.onSubmit);
    this.form.querySelector('.cancel-btn').removeEventListener('click', this.removeForm);

    const inputs = this.form.querySelectorAll('.input');
    inputs.forEach((el) => {
      el.removeEventListener('focus', () => {
        el.removeEventListener('blur', this.onBlur);
      });
    });

    this.form.remove();
    this.form = false;
  }

  onSubmit(e) {
    e.preventDefault();

    const { elements } = this.form;
    const isValidate = [...elements].some((el) => this.removeOrShowToolTip(el));

    if (isValidate) return;

    // сбор данных
    const name = this.form.elements[0].value;
    const textarea = this.form.elements[1].value;
    const setDate = new Date();
    let date = [setDate.getFullYear(), setDate.getMonth(), setDate.getDay()].join('.');
    const time = setDate.getHours();
    date = `${date} ${time}`;

    this.printTaskItem(name, date);

    // отправка данных на сервер
    this.XhrRequest.sendDataItem(new FormData(this.form));

    this.form.reset();
    this.removeForm();
  }

  getErrorMsg(el) {
    const errorKey = Object.keys(ValidityState.prototype).find((key) => {
      if (!el.name) return;
      if (key === 'valid') return;
      return el.validity[key];
    });

    if (!errorKey) return;
    return this.errorsMsg[el.name][errorKey];
  }

  onBlur(e) {
    const el = e.target;
    this.removeOrShowToolTip(el);
    el.removeEventListener('blur', this.onBlur);
  }

  removeOrShowToolTip(el) {
    const error = this.getErrorMsg(el);
    const currentErrorMessage = this.toolTip._tooltip;

    if (!this.isHereToolTip && error) {
      this.toolTip.showTooltip(error, el);
      this.isHereToolTip = true;

      return true;
    } if (this.isHereToolTip && error) {
      this.toolTip.removeTooltip(currentErrorMessage.id);
      this.toolTip.showTooltip(error, el);
      this.isHereToolTip = true;

      return true;
    }
    if (this.isHereToolTip && !error) {
      this.toolTip.removeTooltip(currentErrorMessage.id);
      this.isHereToolTip = false;

      return false;
    }
  }

  onTaskItem(e) {
    if (!e.target.closest('.task__item')) return;

    const itemElem = e.target.closest('.task__item');
    const itemName = itemElem.querySelector('.item__name').textContent;

    if (e.target.className === 'item__edit-btn__icon') {
      this.editItem(itemElem);

      return;
    }

    if (e.target.className === 'item__remove-btn__icon') {
      this.addAgreeFrom(itemElem);

      return;
    }

    if (this.activeTask) this.activeTask.checked = false;
    e.target.closest('.task__item').querySelector('.check').checked = true;
    this.activeTask = e.target.closest('.task__item').querySelector('.check');

    this.XhrRequest.getDataForItems().then((body) => {
      if (body.length == 0) return;

      for (let i = 0; i < body.length; i++) {
        if (body[i].name == itemName) {
          const textarea = document.createElement('span');
          textarea.className = 'textarea';
          textarea.textContent = body[i].textarea;
          itemElem.querySelector('.item__name').insertAdjacentElement('afterend', textarea);
        }
      }
    });
  }

  editItem(itemElem) {
    this.XhrRequest.getDataForItems().then((body) => {
      if (body.length == 0) return;

      this.addEditForm(itemElem);

      const itemName = itemElem.querySelector('.item__name').textContent;
      let index;

      for (let i = 0; i < body.length; i++) {
        if (body[i].name == itemName) {
          index = i;
        }
      }
      this.form.elements[0].value = body[index].name;
      this.form.elements[1].value = body[index].textarea;
    });
  }

  addEditForm(itemElem) {
    const itemName = itemElem.querySelector('.item__name').textContent;
    const form = document.createElement('form');
    form.className = 'task-widget__form';
    form.noValidate = 'novalidate';
    form.innerHTML = `<div class="form__item">
                        <h2 class="form__item__title">Описание</h2>
                        <input name="name" id="name" class="input name" type="text" disabled placeholder="Описание">
                      </div>
                      <div class="form__item">
                        <h2 class="form__item__title">Подробное описане</h2>
                        <textarea class="form__textarea" name="textarea" placeholder="Подробное описание" required></textarea>
                      </div>
                      <div class="form__buttons">
                        <button type="submit" class="form-btn save-btn">Добавить</button>
                        <button type="reset" class="form-btn cancel-btn">Отмена</button>
                      </div>`;

    document.querySelector('.conteiner').appendChild(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const { elements } = this.form;
      const isValidate = [...elements].some((el) => this.removeOrShowToolTip(el));

      if (isValidate) return;

      // сбор данных
      const name = this.form.elements[0].value;
      const textarea = this.form.elements[1].value;
      const setDate = new Date();
      let date = [setDate.getFullYear(), setDate.getMonth(), setDate.getDay()].join('.');
      const time = setDate.getHours();
      date = `${date} ${time}`;

      // отправка данных на сервер
      let nameItem = itemElem.querySelector('.item__name').textContent;
      nameItem = `name=${encodeURIComponent(nameItem)}`;
      this.XhrRequest.patchDataForItem(`name=${name}&textarea=${textarea}`);

      this.form.reset();
      this.removeForm();
    });

    form.querySelector('.cancel-btn').addEventListener('click', this.removeForm);

    const inputs = form.querySelectorAll('.input');
    inputs.forEach((el) => {
      el.addEventListener('focus', () => {
        el.addEventListener('blur', this.onBlur);
      });
    });

    this.form = form;
  }

  addAgreeFrom(itemElem) {
    const form = document.createElement('form');
    form.className = 'task-widget__form';
    form.innerHTML = `<h2 class="form__item__title">Вы уверены?</h2>
                        <button type="submit" class="form-btn delete">Да</button>
                        <button type="reset" class="form-btn cancel">Нет</button>
                      </div>`;

    this.form = form;
    document.querySelector('.conteiner').appendChild(form);

    form.querySelector('.delete').addEventListener('click', () => {
      this.removeItem(itemElem);
    });

    form.querySelector('.cancel').addEventListener('click', () => {
      this.form.remove();
      this.form = false;
    });
  }

  removeItem(itemElem) {
    let nameItem = itemElem.querySelector('.item__name').textContent;
    nameItem = `name=${encodeURIComponent(nameItem)}`;

    this.XhrRequest.deleteItem(nameItem);

    itemElem.remove();
    this.form.remove();
    this.form = false;
  }

  printTaskItem(name, date) {
    const item = document.createElement('li');
    item.className = 'task__item';

    const checkRadio = document.createElement('input');
    checkRadio.type = 'radio';
    checkRadio.className = 'check';

    const nameItem = document.createElement('span');
    nameItem.className = 'item__name item__text';
    nameItem.textContent = name;

    const dateItem = document.createElement('span');
    dateItem.className = 'item__date item__text';
    dateItem.textContent = date;

    const itemButtons = document.createElement('li');
    itemButtons.className = 'item__buttons';
    itemButtons.innerHTML = `<a href="#"  class="item__remove-btn__link">
                              <img src="./image/xmark-solid.svg" alt="icon-xmark" class="item__remove-btn__icon">
                            </a>
                            <a href="#" class="item__edit-btn__link">
                              <img src="./image/pencil.png" alt="icon-edit" class="item__edit-btn__icon">
                            </a>`;

    item.appendChild(checkRadio);
    item.appendChild(nameItem);
    item.appendChild(dateItem);
    item.appendChild(itemButtons);

    document.querySelector('.task-list__items-list').appendChild(item);
  }
}
