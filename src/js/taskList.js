import ToolTip from './toolTip.js';
import XhrRequest from './xhrRequest.js';
import HTMLElems from './htmlElems.js';

export default class TaskList {
  constructor(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    this._element = element;
    this.form = false;
    this.editITaskid = false;

    this.activeTask = false;


    this.XhrRequest = new XhrRequest();
    this.toolTip = new ToolTip();
    this.htnlElems = new HTMLElems();

    this.addForm = this.addForm.bind(this);
    this.addAgreeFrom = this.addAgreeFrom.bind(this);
    this.removeForm = this.removeForm.bind(this);

    this.onAddSubmit = this.onAddSubmit.bind(this);
    this.onEditSubmit = this.onEditSubmit.bind(this);

    this.onTaskItem = this.onTaskItem.bind(this);
    this.printTaskItem = this.printTaskItem.bind(this);
    this.editTask = this.editTask.bind(this);
    
    this.errorsMsg = this.toolTip.errors();
    this.getErrorMsg = this.getErrorMsg.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.isHereToolTip = false;
  }

  init() {
    this._element.querySelector('.header__btn').addEventListener('click', this.addForm);
    this._element.querySelector('.task-list__items-list').addEventListener('click', this.onTaskItem);

    this.XhrRequest.getDataForItems(`method=allTasks`).then((body) => {
      if (body.length == 0) return;
      console.log(body)

      for (let i = 0; i < body.length; i++) {
        this.printTaskItem(body[i].name, body[i].created, body[i].status, body[i].id);
      }
    });
  }

  addForm() {
    const form = this.htnlElems.addFormHTML();

    document.querySelector('.conteiner').appendChild(form);

    form.addEventListener('submit', this.onAddSubmit);
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

    this.form.removeEventListener('submit', this.onAddSubmit);
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

  onAddSubmit(e) {
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

  onEditSubmit(e) {
      e.preventDefault();

      const { elements } = this.form;
      const isValidate = [...elements].some((el) => this.removeOrShowToolTip(el));

      if (isValidate) return;

      this.XhrRequest.patchDataForItem(`id=${this.editITaskid}`, new FormData(this.form)).then((body) => {
        this.editTask(body);
      });

      this.form.reset();
      this.removeForm();
    
  }

  onTaskItem(e) {
    if (!e.target.closest('.task__item')) return;

    const itemId = e.target.closest('.task__wrapper').id;

    if (e.target.className === 'item__edit-btn__icon') {
      this.addEditForm(itemId);

      return;
    }

    if (e.target.className === 'item__remove-btn__icon') {
      this.addAgreeFrom(itemElem);

      return;
    }

    // this.XhrRequest.getDataForItems().then((body) => {
    //   if (body.length == 0) return;

    //   for (let i = 0; i < body.length; i++) {
    //     if (body[i].name == itemName) {
    //       const textarea = document.createElement('span');
    //       textarea.className = 'textarea';
    //       textarea.textContent = body[i].textarea;
    //       itemElem.querySelector('.item__name').insertAdjacentElement('afterend', textarea);
    //     }
    //   }
    // });
  }

  editTask(data) {
    if(!this.editITaskid) return;
    
    const task = document.getElementById(data.id);
    task.querySelector('.item__name').textContent = data.name;
  }

  addEditForm(id) {
    this.editITaskid = id;

    const form = this.htnlElems.editFormHTML();
    document.querySelector('.conteiner').appendChild(form);

    form.addEventListener('submit', this.onEditSubmit);
    form.querySelector('.cancel-btn').addEventListener('click', this.removeForm);

    const inputs = form.querySelectorAll('.input');
    inputs.forEach((el) => {
      el.addEventListener('focus', () => {
        el.addEventListener('blur', this.onBlur);
      });
    });

    this.XhrRequest.getDataForItems(`method=fullTask&id=${id}`).then((body) => {
      if (!body) return;
      console.log(body)
      this.form.elements[0].value = body.name;
      this.form.elements[1].value = body.description;
    });

    this.form = form;
  }

  addAgreeFrom(itemElem) {
    const form = this.htnlElems.agreeFormHTML();

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

  printTaskItem(name, date, status, id) {
    const item = this.htnlElems.taskHTML(name, date, status, id);

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
