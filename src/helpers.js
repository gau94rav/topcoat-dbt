import Vue from 'vue';
import { EXTENSIONS_LABELS } from './assets/constants/labels';

// File functions
function getColor(type) {
    let color = 'rgb(42, 59, 77)';
    switch (type) {
      case 'success':
        color = '#4caf50' 
        break;
      case 'info':
        color = '#2196f3';
        break;
      case 'warning':
        color = '#fb8c00';
        break;
      case 'error':
        color = '#ff5252'
        break;
    }
    return color;
}
// File functions

// Global functions
Vue.prototype.$alert = (data) => {
  const { message, type } = data;
  if (message && type) {
    const alertElement = document.querySelector('.alert-content');
    if (!alertElement) return;
    alertElement.innerHTML = message;
    alertElement.style.background = getColor(type);
    alertElement.style.display = 'block';
    setTimeout(() => {
      alertElement.innerHTML = '';
      alertElement.style.display = 'none';
    }, 2000);
  }
}

Vue.prototype.$getLanguage = (key) => {
  var path_parts = key.split('/');
  var file_name = path_parts[path_parts.length-1];
  var file_parts = file_name.split('.');
  var extension = null;
  if (file_parts.length > 1) {
      extension = file_parts[file_parts.length-1];
  }
  return EXTENSIONS_LABELS[extension] ? EXTENSIONS_LABELS[extension] : 'html';
}

Vue.prototype.$isImage = (key) => {
  const parts = key.split('.')
  const extension = parts[parts.length-1];
  const image_extensions = [ 'svg', 'png', 'jpg', 'tif', 'tiff', 'webp', 'gif', 'jpeg', 'svg' ];
  return image_extensions.indexOf(extension) > -1;
}

Vue.prototype.$objExtract = (array, key, value, nestedKey) => {
  const recursive = (array, key, value, nestedKey) => {
    for (let obj of array) {
      if (obj[key].includes(value) || obj[key] === value) {
        return obj;
      } else if (obj[nestedKey]) {
        const data = recursive(obj[nestedKey], key, value, nestedKey);
        if (Object.keys(data).length) {
          return data;
        }
      }
    }
    return {};
  }
  return recursive(array, key, value, nestedKey);
}

Vue.prototype.$addKeyToUrl = (key) => {
  let urlString = key.substring(2).replace('.', '|');

  let {protocol, host, pathname} = window.location;
  let url = `${protocol}//${host}${pathname}`;
  
  url = url.slice(0, url.indexOf('develop') + 8);
  url = !pathname.includes('develop/') ? url = `${url}/${urlString}` : `${url}${urlString}`;

  window.history.pushState(null, null, url);
  //window.snowplow('trackPageView');
}

Vue.prototype.$resetUrl = (section) => {
  let {protocol, host, pathname} = window.location;
  let url = `${protocol}//${host}${pathname}`;
  url = url.slice(0, url.indexOf(section) + section.length + 1);
  window.history.pushState(null, null, url);
  //window.snowplow('trackPageView');
}

Vue.prototype.$addQueryToUrl = (key, value) => {
  let searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  let {protocol, host, pathname} = window.location;
  let newurl = `${protocol}//${host}${pathname}?${searchParams.toString()}`;

  window.history.pushState({path: newurl}, '', newurl);
  //window.snowplow('trackPageView');
}

Vue.prototype.$removeQueryFromUrl = (name) => {
  let {protocol, host, pathname} = window.location;
  let url = `${protocol}//${host}${pathname}`;
  if (name) {
    let searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(name);
    url = `${url}?${searchParams.toString()}`;
  }
  window.history.pushState(null, null, url);
  //window.snowplow('trackPageView');
}

Vue.prototype.$extractFilesByType = (array, type, fileNamesOnly) => {
  const data = [];
  const typeRegex = new RegExp("^.*REPLACE.*$".replace("REPLACE", type), 'gmi');
  const recursive = (array, type) => {
    for (let index in array) {
      const obj = array[index];
      let { key, title, children } = obj;
      if (key.match(typeRegex) && key.match(/^.*\.[^\\]+$/)) {
        if (fileNamesOnly) {
          data.push(title.slice(0, title.indexOf('.')));
        } else {
          data.push(obj);
        }
      }
      if (children) {
        recursive(children, type);
      }
    }
  }
  recursive(array, type);
  return data;
}

Vue.prototype.$extractKeysByType = (array, type) => {
  const keys = [];
  const typeRegex = new RegExp("^.*REPLACE.*$".replace("REPLACE", type), 'gmi');
  const recursive = (array, type) => {
    for (let index in array) {
      const obj = array[index];
      let { key, children } = obj;
      if (key.match(typeRegex) && key.match(/^.*\.[^\\]+$/)) {
        keys.push(key.substring(1));
      }
      if (children) {
        recursive(children, type);
      }
    }
  }
  recursive(array, type);
  return keys;
}

Vue.prototype.$convertToSuggestionsArray = (array, kind, insertTextRules, append) => {
  const data = [];
  const processed = [];
  const processedKeys = [];
  for (let item of array) {
    const isKey = item.includes('/');
    let fullPath = item;
    let documentation = item;
    if (isKey) {
      const split = item.split('/');
      documentation = split.slice(0, split.length - 1).join('/');
      item = split[split.length - 1];
      item = item.slice(0, item.indexOf('.'));
    }
    if (processedKeys.indexOf(fullPath) < 0) {
      data.push({
        label: item,
        insertText: `${item}${append}`,
        kind,
        insertTextRules,
        documentation,
      })
      processed.push(item);
      processedKeys.push(fullPath);
    }
  }
  return data;
}

Vue.prototype.$indexOfAll = (str, s) => {
  var flag = false;
  const indexes = [];
  for (var i = 0; i < str.length - s.length + 1; i++) {
    if (str.substring(i, s.length + i) == s) {
      indexes.push(i);
      flag = true;
    }
  }
  return indexes;
}

Vue.prototype.$firstCapitalString = (str) => {
  if (str.length > 1) {
    return str.slice(0,1).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str.toUpperCase();
}

// Global functions