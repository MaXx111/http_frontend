export default class HTMLElens {
    constructor () {

    }

    taskHTML(name, date, status, id) {
        const div = document.createElement('div')
        div.className = 'task__wrapper';
        div.id = id;

        const item = document.createElement('li');
        item.className = 'task__item';
    
        const checkRadio = document.createElement('input');
        checkRadio.type = 'radio';
        checkRadio.className = 'task__radio';
        checkRadio.checked = status;
    
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

        div.appendChild(item)

        return div;
    }

    agreeFormHTML() {
        const agreeForm = document.createElement('form');
        agreeForm.className = 'task-widget__form';
        agreeForm.innerHTML = `<h2 class="form__item__title">Вы уверены?</h2>
                        <button type="submit" class="form-btn delete">Да</button>
                        <button type="reset" class="form-btn cancel">Нет</button>
                      </div>`;
        return agreeForm;
    }

    editFormHTML() {
        const editForm = document.createElement('form');
        editForm.className = 'task-widget__form';
        editForm.noValidate = 'novalidate';
        editForm.innerHTML = `<div class="form__item">
                        <h2 class="form__item__title">Описание</h2>
                        <input name="name" id="name" class="input name" type="text" placeholder="Описание">
                      </div>
                      <div class="form__item">
                        <h2 class="form__item__title">Подробное описане</h2>
                        <textarea class="form__textarea" name="textarea" placeholder="Подробное описание" required></textarea>
                      </div>
                      <div class="form__buttons">
                        <button type="submit" class="form-btn save-btn">Добавить</button>
                        <button type="reset" class="form-btn cancel-btn">Отмена</button>
                      </div>`;
        return editForm;
    }

    addFormHTML() {
        const addForm = document.createElement('form');
        addForm.className = 'task-widget__form';
        addForm.noValidate = 'novalidate';
        addForm.innerHTML = `<div class="form__item">
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
        return addForm;
    }
}