// Get data from the backend. The first argument should be 'this'. See example.js for context.
export function getData(component, url, succ) {
  return getDataCustomError(url, succ, (err) => {
    console.log("There was an error: " + err);
    component.setState({ error: err });
  });
}

// Same as getData, but allows the error handler to be defined
export function getDataCustomError(url, succ, fail) {
  return fetch(url, { credentials: 'same-origin' })
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      throw new Error(resp.status);
    })
    .then(succ)
    .catch(fail);
}

// Post data from to the backend.
export function postData(url, body, succ, fail) {
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  return fetch(url, { method: 'POST', credentials: 'same-origin', headers, body })
    .then((resp) => {
      if (resp.ok) {
        return resp.text();
      }
      throw new Error(resp.status);
    })
    .then(succ)
    .catch(fail);
}

export function formElToJsonStr(formEl) {
  return formDataToJsonStr(new FormData(formEl));
}

export function formDataToJsonStr(form) {
  let json = {};
  for (let key of form.keys()) {
    json[key] = form.get(key);
  }
  return JSON.stringify(json);
}

export function getLoggedInUserId() {
  return document.getElementById('user').innerHTML;
}

export function toTimeString(date, time, suffix) {
  if (!date) {
    return '';
  }
  const day = date.substr(0, 2);
  const month = date.substr(3, 2);
  const year = '20' + date.substr(6, 2);

  let hr = Number(time.substr(0, 2));
  if (suffix === 'pm') {
    if (hr !== 12) {
      hr += 12;
      time = hr + time.substr(2, 3);
    }
  } else {
    if (hr === 12) {
      time = '00' + time.substr(2, 3);
    }
  }

  return  year + '-' + month + '-' + day + 'T' + time + ':00.000Z';
}

function pad(num, size) {
  return ('000000000' + num).substr(-size);
}

export function getDayMonthYearFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${pad(date.getUTCDate(),2)}/${pad(date.getUTCMonth() + 1,2)}/${String(date.getUTCFullYear()).slice(-2)}`;
}

export function getTimeFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  let hr = date.getUTCHours();
  let meridiem = 'am';
  if (hr >= 12) {
    meridiem = 'pm';
    hr -= 12;
  }
  if (hr == 0) {
    hr = 12;
  }
  return {
    time: `${pad(hr, 2)}:${pad(date.getUTCMinutes(),2)}`,
    meridiem: meridiem
  };
}

export function toggleSave(eventId, saveId, createSucc, deleteSucc) {
  if (!saveId) {
    postData('/api/event/user/save/create/' + eventId, null,
      createSucc,
      () => {
        console.log("error saving");
      }
    );
  } else {
    postData('/api/event/user/save/delete/' + saveId, null,
      deleteSucc,
      () => {
        console.log("error deleting");
      }
    );
  }
}

export function toggleSaveHandler(component, event) {
  return (e) => {
    e.preventDefault();
    e.cancelBubble = true;
    e.stopPropagation();
    toggleSave(event.id, event.saved,
      (data) => {
        event.saved = JSON.parse(data).id;
        component.forceUpdate();
      },
      () => {
        event.saved = null;
        component.forceUpdate();
      }
    );
  };
}

export function getPriceString(price, prefix) {
  if (typeof price === 'number') {
    if (price) {
      return prefix + '$' + price.toFixed(2);
    } else {
      return prefix + 'Free';
    }
  } else {
    return null;
  }
}

// As per the HTML5 Specification
export const emailRegex = '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$';
export const passwordRegex = '^$|.{6,100}';

export const dateRegex = '^((0[1-9])|([1-2][0-9])|(3[0-1]))/((0[1-9])|(1[0-2]))/[0-9][0-9]$';
export const timeRegex = '^((0[1-9])|(1[0-2])):[0-5][0-9]';
export const priceRegex = '^[0-9]+(\.[0-9]{1,2})?$';
