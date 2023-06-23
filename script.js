
const currentPrices = {};

let currentUser = null;
const users = {
  Jero: {
    balance: {
      bitcoin: 1,
      flux: 10000,
      radiant: 3000000,
      nexa: 1500000,
      ergo: 888,
      usd: 1000 
    }
  },
  Sofi: {
    balance: {
      bitcoin: 5,
      flux: 10,
      radiant: 3,
      nexa: 8,
      ergo: 12,
      usd: 5000 
    }
  }
};


function showSuccessMessage(message) {
  Swal.fire({
    icon: 'success',
    title: 'Éxito',
    text: message
  });
}


function showErrorMessage(message) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message
  });
}


function showMainSection() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('main-section').style.display = 'block';

  const welcomeUsername = document.getElementById('welcome-username');
  welcomeUsername.textContent = currentUser;

  updateBalanceDisplay();
  updateCryptoList();
}


function updateCryptoList() {
  const cryptoSelect = document.getElementById('crypto-select');
  const currentUserBalance = users[currentUser].balance;

  cryptoSelect.innerHTML = '';

  Object.keys(currentUserBalance).forEach(crypto => {
    if (crypto !== 'usd') {
      const option = document.createElement('option');
      option.value = crypto;
      option.textContent = `${crypto} (${currentUserBalance[crypto]})`;
      cryptoSelect.appendChild(option);
    }
  });
}


function register() {
  const newUsername = document.getElementById('new-username').value;
  const usdAmount = parseFloat(document.getElementById('usd-amount').value);

  if (newUsername !== '' && !isNaN(usdAmount) && usdAmount >= 0) {
    if (users.hasOwnProperty(newUsername)) {
      showErrorMessage('El usuario ya existe. Por favor, elige otro nombre de usuario.');
    } else {
      users[newUsername] = {
        balance: {
          usd: usdAmount
        }
      };
      showSuccessMessage(`Usuario ${newUsername} registrado con éxito.`);
    }
  } else {
    showErrorMessage('Por favor, ingresa un usuario válido y un monto en USD válido.');
  }
}


function login() {
  const username = document.getElementById('username').value;
  if (users.hasOwnProperty(username)) {
    currentUser = username;
    showMainSection();
    showSuccessMessage(`¡Bienvenido, ${currentUser}!`);
  } else {
    showErrorMessage('Por favor, ingresa un usuario válido.');
  }
}


function buy() {
  const crypto = document.getElementById('crypto-select').value;
  const quantity = parseFloat(document.getElementById('crypto-quantity').value);

  if (users[currentUser].balance.hasOwnProperty(crypto)) {
    if (!isNaN(quantity) && quantity > 0) {
      const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`;
      fetch(priceUrl)
        .then(response => response.json())
        .then(data => {
          const price = data[crypto].usd;
          const cost = price * quantity;
          if (cost <= users[currentUser].balance.usd) {
            users[currentUser].balance.usd -= cost;
            users[currentUser].balance[crypto] += quantity;
            updateBalanceDisplay();
            showSuccessMessage(`Has comprado ${quantity} ${crypto} por ${cost.toFixed(2)} USD!`);
          } else {
            showErrorMessage('No tienes suficientes fondos para realizar esta compra.');
          }
        })
        .catch(error => console.log(error));
    } else {
      showErrorMessage('Por favor, ingresa una cantidad válida.');
    }
  } else {
    showErrorMessage('Por favor, ingresa una criptomoneda válida.');
  }
}

function sell() {
  const crypto = document.getElementById('crypto-select').value;
  const quantity = parseFloat(document.getElementById('crypto-quantity').value);

  if (users[currentUser].balance.hasOwnProperty(crypto)) {
    if (!isNaN(quantity) && quantity > 0 && quantity <= users[currentUser].balance[crypto]) {
      const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`;
      fetch(priceUrl)
        .then(response => response.json())
        .then(data => {
          const price = data[crypto].usd;
          const earnings = price * quantity;
          users[currentUser].balance.usd += earnings;
          users[currentUser].balance[crypto] -= quantity;
          updateBalanceDisplay();
          showSuccessMessage(`Has vendido ${quantity} ${crypto} por ${earnings.toFixed(2)} USD!`);
        })
        .catch(error => console.log(error));
    } else {
      showErrorMessage('Por favor, ingresa una cantidad válida.');
    }
  } else {
    showErrorMessage('Por favor, ingresa una criptomoneda válida.');
  }
}


function updateBalanceDisplay() {
  const balanceList = document.getElementById('balance-list');
  balanceList.innerHTML = '';

  const currentUserBalance = users[currentUser].balance;

  Object.keys(currentUserBalance).forEach(crypto => {
    const listItem = document.createElement('li');
    listItem.textContent = `${crypto}: ${currentUserBalance[crypto]}`;
    balanceList.appendChild(listItem);
  });
}
