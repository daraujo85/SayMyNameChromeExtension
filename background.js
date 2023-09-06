let name = "";
let interval = 1; // Valor padrão de 1 segundo
let monitoringIntervalId = null;

let isMonitoring = true;
let lastNotificationBody = ""; // Para rastrear a última ocorrência notificada

chrome.runtime.onMessage.addListener((message) => {
  if (message.startMonitoring !== undefined) {
    isMonitoring = message.startMonitoring;

    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }
});

function startMonitoring() {
  chrome.storage.sync.get(["name", "interval"], (result) => {
    name = result.name || "";
    interval = (result.interval || 1) * 1000; // Valor padrão de 1 segundo

    if (name) {
      monitoringIntervalId = setInterval(checkForName, interval);
    }
  });
}

function stopMonitoring() {
  clearInterval(monitoringIntervalId);
}

function checkForName() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: function (name) {
          const bodyText = document.body.innerText.toLowerCase();
          //const bodyHTML = document.body.innerHTML;
          // const highlightedText = bodyHTML.replace(
          //   new RegExp(`\\b${name}\\b`, 'gi'),
          //   (match) => `<mark style="background-color: yellow">${match}</mark>`
          // );

          // // Substitua o conteúdo do corpo da página pelo texto destacado
          // document.body.innerHTML = highlightedText;
          
          return bodyText;
        },
        args: [name],
      },
      (result) => {

        if (!result) {
          return; 
        }
        const bodyTextHighlighted = String(result[0].result);

        if (bodyTextHighlighted !== lastNotificationBody) {
          notifyUser();
          lastNotificationBody = bodyTextHighlighted; // Atualize a última ocorrência notificada
        }
      }
    );
  });
}

function notifyUser() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/assets/images/icon48.png",
    title: chrome.i18n.getMessage("extensionName"),
    message: chrome.i18n.getMessage("notificationMessage"),
  });
  playNotificationSound();
}

function playNotificationSound() {
  // Obtenha o URL do arquivo de som da extensão
  const audioURL = chrome.runtime.getURL("/assets/sounds/notification01.wav");

  // Envie uma mensagem para a página popup para reproduzir o som
  chrome.runtime.sendMessage({ playSound: audioURL });
}
