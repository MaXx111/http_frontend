import TaskList from './taskList.js';

export default class XhrRequest {
  constructor() {
  }

  sendDataItem(body) {

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:7060');
  
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            resolve(JSON.parse(xhr.response));
          }
        };
  
        xhr.send(body);
      });
  }

  async getDataForItems(method) {
      
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:7060/?' + method);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(JSON.parse(xhr.response));
        }
      };

      xhr.send();
    });
  }

  patchDataForItem(id, body) {

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PATCH', `http://localhost:7060/?${id}`);
  
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            resolve(JSON.parse(xhr.response));
          }
        };
  
        xhr.send(body);
      });
  }


  deleteItem(itemName) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
    };

    xhr.open('DELETE', `http://localhost:7060/?${itemName}`);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send();
  }
}
