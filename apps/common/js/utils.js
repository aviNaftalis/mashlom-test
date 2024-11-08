function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getItem(key) {
    var objectAsString = localStorage.getItem(key);
    if (!objectAsString) {
        return {};
    }
    return JSON.parse(objectAsString);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getUpdatedQueryParameter(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
}

function getFirstResourcePart() {
    // Create a URL object
    const urlObject = new URL(window.location.href);
    
    // Get the pathname and split it by '/'
    const pathParts = urlObject.pathname.split('/');
    
    // Return the first non-empty part
    for (const part of pathParts) {
        if (part !== '') {
            return part;
        }
    }
    
    // If no non-empty part is found, return an empty string
    return '';
}

function updateQueryParameter(key, value, url) {
    if (history.pushState) {
        var newurl = getUpdatedQueryParameter(key, value, url);
        window.history.pushState({path:newurl},'',newurl);
    }
}

function scrollToElement(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function getHospitalConfig(property) {
    window.hospital = getParameterByName("hospital") || getFirstResourcePart();
    const hospital = window.hospital;
    const allConfigs = window.allHospitalConfigs;
  
    if (allConfigs[hospital] && allConfigs[hospital].hasOwnProperty(property)) {
      return allConfigs[hospital][property];
    } else if (allConfigs.apps && allConfigs.apps.hasOwnProperty(property)) {
      console.log(`Property "${property}" not found for ${hospital}. Falling back to "apps" configuration.`);
      return allConfigs.apps[property];
    } else {
      console.log(`Property "${property}" not found for ${hospital} or in "apps" configuration.`);
      return undefined;
    }
  }