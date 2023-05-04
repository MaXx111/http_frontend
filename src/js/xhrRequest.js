export default class XhrRequest {
  constructor() {
  }

  sendDataItem(body) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://http-backend.onrender.com');

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
      xhr.open('GET', `https://http-backend.onrender.com/?${method}`);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(JSON.parse(xhr.response));
        }
      };

      xhr.send();
    });
  }

  patchDataForItem(id, body = { nothing: 'nothing' }) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PATCH', `https://http-backend.onrender.com/?${id}`);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(JSON.parse(xhr.response));
        }
      };

      xhr.send(body);
    });
  }

  deleteItem(id) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return false;
    };

    xhr.open('DELETE', `https://http-backend.onrender.com/?${id}`);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send();
  }
}
