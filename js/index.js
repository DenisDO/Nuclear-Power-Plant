const url = `ws://178.20.156.145:3000`;
let socket;

const startButton = document.getElementById(`start_button`);
const reloadButton = document.getElementById(`reload_button`);
const stopButton = document.getElementById(`stop_button`);

const levers = [true, null, null, null];
const currentLever = 0;
let nextLever = 1;
let currentID = null;
let marker = true;

function startTheProgram() {
  socket = new WebSocket(url);

  socket.onopen = () => {console.log(`Connected to the ${url}`);};
  socket.onerror = (error) => {console.log(`Error: ${error.message}`);};
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.pulled !== undefined) {
      console.log(`Pulled: ${data.pulled}`);
  
      switchLever(data.pulled);
      const query = createCheckQuery(currentLever, nextLever, data.stateId);
      sendQuery(query);
    }
  
    if (data.same === true) {
      syncServerAndLocalLevers();
  
      if(isLeversSame()) {
        turnOffPlant(data.stateId);
      }
  
      console.log(`Array: ${levers}`);
    }
  
    if (data.newState === `poweredOn`) {
      marker = !marker;
      console.warn(`Maker is changed from ${!marker} to ${marker}`);
    }
  
    if (data.newState === `poweredOff`) {
      console.log(`Token: ${data.token}`);
      showToken(data.token);
      stopTheProgram();
    }
  };
}

function reloadTheProgram() {
  stopTheProgram();
  startTheProgram();
}

function stopTheProgram() {
  socket.onclose = () => {console.log(`Connection is closed`);};
  socket.close();
}

function turnOffPlant(stateId) {
  const query = createTurnOffQuery(stateId);
  sendQuery(query);
}

function createTurnOffQuery(stateId) {
  return {
    action: `powerOff`,
    stateId: stateId
  }
}

function isLeversSame() {
  for (let i = 0; i < levers.length; i++) {
    if(levers[i] !== marker) {
      return false;
    }
  }

  return true;
}

function switchLever(lever) {
  levers[lever] = !levers[lever];

  const leverElement = document.getElementById(`lever${lever}`);
  if (leverElement.classList.contains(`lever__pos1`)) {
    leverElement.classList.toggle(`lever__pos2`);
  } else {
    leverElement.classList.toggle(`lever__pos1`);
  }
}

function createCheckQuery(currentLever, nextLever, id) {
  return {
    action: "check",
    "lever1": currentLever,
    "lever2": nextLever,
    stateId: id
  };
}

function sendQuery(query) {
  socket.send(JSON.stringify(query));
}

function syncServerAndLocalLevers() {
  levers[nextLever] = levers[currentLever];
  if (nextLever < 3) {
    nextLever++;
  }
}

function showToken(token) {
  let tokenContainer = document.createElement('div');
  let tokenTitle = document.createElement('h2');
  let tokenContent = document.createElement('textarea');
      tokenContainer.className = 'plant__bar__token';
      tokenTitle.className = 'token__title';
      tokenContent.className = 'token__content';

  tokenTitle.innerHTML = 'Token: ';
  tokenContent.value = `${token}`;

  let parent = document.getElementsByClassName('plant__bar');
  tokenContainer.appendChild(tokenTitle);
  tokenContainer.appendChild(tokenContent);
  parent[0].appendChild(tokenContainer);
}

startButton.addEventListener('click', startTheProgram);
reloadButton.addEventListener('click', reloadTheProgram);
stopButton.addEventListener('click', stopTheProgram);