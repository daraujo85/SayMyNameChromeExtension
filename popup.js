let translationsList;

  // Função para carregar traduções com base no idioma atual
  function loadTranslations() {
    chrome.i18n.getAcceptLanguages(function (languages) {
      const userLanguage = languages[0];
      const languageCode = userLanguage.split("-")[0]; // Extrai o código do idioma principal
  
      // Carrega as traduções com base no código do idioma
      fetch(`_locales/${languageCode}/messages.json`)
        .then((response) => response.json())
        .then((translations) => {
          translationsList = translations
          // Aplica as traduções aos elementos com atributos data-i18n e data-i18n-placeholder
          const elements = document.querySelectorAll("[data-i18n], [data-i18n-placeholder]");
          elements.forEach((element) => {
            const key = element.getAttribute("data-i18n");
            const placeholderKey = element.getAttribute("data-i18n-placeholder");
  
            if (key) {
              if (translations[key]) {
                element.textContent = translations[key].message;
              }
            }
  
            if (placeholderKey) {
              if (translations[placeholderKey]) {
                element.setAttribute("placeholder", translations[placeholderKey].message);
              }
            }
          });
        });
    });
  }
  
  

document.addEventListener("DOMContentLoaded", function () {
  const nameInput = document.getElementById("name");
  const intervalInput = document.getElementById("interval");
  const startButton = document.getElementById("startButton");

  chrome.storage.sync.get(["name", "interval", "monitoring"], (result) => {
    nameInput.value = result.name || "";
    intervalInput.value = result.interval || 10;  

    if (result.monitoring) {
      // Verifique se o monitoramento está em andamento
      startButton.textContent = translationsList ? translationsList["stopMonitoring"].message : "";
      startButton.dataset.active = "true";
    }
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.playSound) {
      // Crie um elemento de áudio e reproduza o som
      const audio = new Audio(message.playSound);
      audio.play();
    }
  });
  startButton.addEventListener("click", () => {
    const isActive = startButton.dataset.active === "true";

    if (!isActive) {
      const name = nameInput.value.trim();
      const interval = parseInt(intervalInput.value);
      chrome.storage.sync.set({ name, interval, monitoring: true });
      startButton.textContent = translationsList["stopMonitoring"].message;
      startButton.dataset.active = "true";
      startButton.classList.remove("start");
      startButton.classList.add("stop");
      chrome.runtime.sendMessage({ startMonitoring: true });
    } else {
      chrome.storage.sync.set({ monitoring: false }); // Pare o monitoramento aqui
      startButton.textContent = translationsList["startMonitoring"].message;
      startButton.dataset.active = "false";
      startButton.classList.remove("stop");
      startButton.classList.add("start");
      chrome.runtime.sendMessage({ startMonitoring: false });
    }
  });


  // Chama a função para carregar as traduções quando a página é carregada
  loadTranslations();

});
