import ToolTip from './toolTip.js';
import XhrRequest from './xhrRequest.js';
import HTMLElems from './htmlElems.js';

export default class TaskList {
  constructor(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    // переменные для форм и сервера
    this._element = element;
    this.form = false;
    this.editTaskid = false;
    this.activeDescription = false;

    // классы для работы
    this.XhrRequest = new XhrRequest();
    this.toolTip = new ToolTip();
    this.htmlElems = new HTMLElems();

    // удаление и добавление форм
    this.addForm = this.addForm.bind(this);
    this.addAgreeFrom = this.addAgreeFrom.bind(this);
    this.addEditForm = this.addEditForm.bind(this);
    this.removeForm = this.removeForm.bind(this);

    // поведение сабмита форм
    this.onAddFormSubmit = this.onAddFormSubmit.bind(this);
    this.onEditFormSubmit = this.onEditFormSubmit.bind(this);

    // добавление таска
    this.printTaskItem = this.printTaskItem.bind(this);

    // взаимодействие с кнопками такска
    this.onTaskItem = this.onTaskItem.bind(this);
    this.editTask = this.editTask.bind(this);
    this.onTaskRadio = this.onTaskRadio.bind(this);
    this.removeItem = this.removeItem.bind(this);

    // добавление и удаление подробного описания таска
    this.printDescription = this.printDescription.bind(this);
    this.removeDescription = this.removeDescription.bind(this);

    // валидация, и тултипы форм
    this.errorsMsg = this.toolTip.errors();
    this.getErrorMsg = this.getErrorMsg.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.isHereToolTip = false;
  }

  init() {
    this._element.querySelector('.header__btn').addEventListener('click', this.addForm);
    this._element.querySelector('.task-list__items-list').addEventListener('click', this.onTaskItem);

    this.XhrRequest.getDataForItems('method=allTasks').then((body) => {
      if (body.length === 0) return;

      for (let i = 0; i < body.length; i++) {
        this.printTaskItem(body[i].name, body[i].created, body[i].status, body[i].id);
      }
    });
  }

  addForm() {
    const form = this.htmlElems.addFormHTML();

    document.querySelector('.conteiner').appendChild(form);

    form.addEventListener('submit', this.onAddFormSubmit);
    form.querySelector('.cancel-btn').addEventListener('click', this.removeForm);

    const inputs = form.querySelectorAll('.input');
    inputs.forEach((el) => {
      el.addEventListener('focus', () => {
        el.addEventListener('blur', this.onBlur);
      });
    });
    this.form = form;
  }

  onAddFormSubmit(e) {
    e.preventDefault();

    const { elements } = this.form;
    const isValidate = [...elements].some((el) => this.removeOrShowToolTip(el));

    if (isValidate) return;

    this.XhrRequest.sendDataItem(new FormData(this.form)).then((body) => {
      this.printTaskItem(body.name, body.created, body.status, body.id);
      this.form.reset();
      this.removeForm();
    });
  }

  addEditForm(id) {
    this.editTaskid = id;

    const form = this.htmlElems.editFormHTML();
    document.querySelector('.conteiner').appendChild(form);

    form.addEventListener('submit', this.onEditFormSubmit);
    form.querySelector('.cancel-btn').addEventListener('click', this.removeForm);

    const inputs = form.querySelectorAll('.input');
    inputs.forEach((el) => {
      el.addEventListener('focus', () => {
        el.addEventListener('blur', this.onBlur);
      });
    });

    this.XhrRequest.getDataForItems(`method=fullTask&id=${id}`).then((body) => {
      if (!body) return;

      this.form.elements[0].value = body.name;
      this.form.elements[1].value = body.description;
    });

    this.form = form;
  }

  onEditFormSubmit(e) {
    e.preventDefault();

    const { elements } = this.form;
    const isValidate = [...elements].some((el) => this.removeOrShowToolTip(el));

    if (isValidate) return;

    this.XhrRequest.patchDataForItem(`id=${this.editTaskid}`, new FormData(this.form)).then((body) => {
      this.editTask(body);
    });

    this.form.reset();
    this.removeForm();
  }

  addAgreeFrom(itemId) {
    const form = this.htmlElems.agreeFormHTML();

    this.form = form;
    document.querySelector('.conteiner').appendChild(form);

    form.querySelector('.delete').addEventListener('click', () => {
      this.removeItem(itemId);
    });

    form.querySelector('.cancel').addEventListener('click', () => {
      this.form.remove();
      this.form = false;
    });
  }

  removeForm() {
    if (!this.form) return;

    const toolTips = document.querySelectorAll('.tooltip');
    if (toolTips) {
      for (let i = 0; i <= toolTips.length - 1; i += 1) {
        toolTips[i].remove();
      }
    }

    this.form.removeEventListener('submit', this.onAddFormSubmit);
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

  onTaskItem(e) {
    if (!e.target.closest('.task__item')) return;

    const itemId = e.target.closest('.task__wrapper').id;

    if (e.target.className === 'item__edit-btn__icon') {
      this.addEditForm(itemId);
      this.removeDescription();

      return;
    }

    if (e.target.className === 'item__remove-btn__icon') {
      this.addAgreeFrom(itemId);
      this.removeDescription();

      return;
    }

    if (e.target.className === 'task__radio') {
      this.onTaskRadio(e.target);
      this.removeDescription();

      return;
    }

    if (!this.activeDescription) {
      this.printDescription(itemId);
    } else {
      this.removeDescription();
    }
  }

  printDescription(id) {
    const itemElem = document.getElementById(id);
    const request = `method=description&id=${id}`;

    this.XhrRequest.getDataForItems(request).then((body) => {
      const descriptionElem = this.htmlElems.descriptionElemHTML(body);
      this.activeDescription = descriptionElem;
      itemElem.appendChild(descriptionElem);
    });
  }

  removeDescription() {
    if (this.activeDescription) {
      this.activeDescription.remove();
      this.activeDescription = false;
    }
  }

  onTaskRadio(itemElem) {
    const { id } = itemElem.closest('.task__wrapper');

    if (itemElem.dataset.waschecked === 'true') {
      this.XhrRequest.patchDataForItem(`id=${id}&status=false`).then((body) => {
        itemElem.checked = false;
        itemElem.dataset.waschecked = (`${body.status}`);
      });
    } else {
      this.XhrRequest.patchDataForItem(`id=${id}&status=true`).then((body) => {
        itemElem.checked = true;
        itemElem.dataset.waschecked = (`${body.status}`);
      });
    }
  }

  editTask(data) {
    if (!this.editTaskid) return;

    const task = document.getElementById(data.id);
    task.querySelector('.item__name').textContent = data.name;
  }

  removeItem(itemId) {
    const itemElem = document.getElementById(itemId);

    this.XhrRequest.deleteItem(`id=${itemId}`);

    itemElem.remove();
    this.form.remove();
    this.form = false;
  }

  printTaskItem(name, date, status, id) {
    const item = this.htmlElems.taskHTML(name, date, status, id);

    document.querySelector('.task-list__items-list').appendChild(item);
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

  getErrorMsg(el) {
    const errorKey = Object.keys(ValidityState.prototype).find((key) => {
      if (!el.name) return;

      if (key === 'valid') return;

      return el.validity[key];
    });

    if (!errorKey) return;

    return this.errorsMsg[el.name][errorKey];
  }
}
