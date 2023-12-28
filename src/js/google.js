/* global settings, addVoiceService, googleVoices */

function getGoogleVoices() {
  if (!settings.GOOGLE.USE_GOOGLE) {
    return;
  }

  addVoiceService('Google');

  const primaryVoice = document.querySelector('#primaryGoogleVoice');
  const secondaryVoice = document.querySelector('#secondaryGoogleVoice');

  function setVoicesinSelect(voiceSelect) {
    const voices = Object.values(googleVoices);
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.classList.add('option');

      option.value = voice;
      option.innerHTML = voice;

      voiceSelect.appendChild(option);
    });
  }
  setVoicesinSelect(primaryVoice);
  primaryVoice.value = settings.GOOGLE.PRIMARY_VOICE;
  setVoicesinSelect(secondaryVoice);
  secondaryVoice.value = settings.GOOGLE.SECONDARY_VOICE;
}

if (settings.GOOGLE.USE_GOOGLE) {
  getGoogleVoices();
}
