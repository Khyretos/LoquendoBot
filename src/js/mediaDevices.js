/* global settings, */

const micSelect = document.querySelector('#microphone');
let selectedMic;

function getAvailableMediaDevices(type) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        const microphones = devices.filter(device => device.kind === type);
        resolve(microphones);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// Microphones
getAvailableMediaDevices('audioinput')
  .then(microphones => {
    let i = 0;
    let tempname = '';
    for (const mic of microphones) {
      if (mic.deviceId === 'default') {
        tempname = mic.label.slice(10); // remove "default -" from the label to get the default device name.
      }

      if (mic.deviceId === 'communications' || mic.label === tempname) {
        continue;
      }

      const option = document.createElement('option');

      // Set the options value and text.
      option.value = i;
      option.innerHTML = `${mic.label}`;

      // Add the option to the voice selector.
      micSelect.appendChild(option);

      if (i === microphones.length - 1) {
        document.getElementById('microphone').value = settings.STT.SELECTED_MICROPHONE;
      }
      i++;
    }
  })
  .catch(error => {
    console.error('Error retrieving microphones:', error);
  });
