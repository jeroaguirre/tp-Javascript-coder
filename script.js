// Variables globales
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
      usd: 1000 // Añadí un balance en USD para el usuario Jero
    }
  },
  Sofi: {
    balance: {
      bitcoin: 5,
      flux: 10,
      radiant: 3,
      nexa: 8,
      ergo: 12,
      usd: 5000 // Añadí un balance en USD para el usuario Sofi
    }
  }
};

// Función para mostrar la sección principal después del inicio de sesión
function showMainSection() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('main-section').style.display = 'block';

  const welcomeUsername = document.getElementById('welcome-username');
  welcomeUsername.textContent = currentUser;

  const balanceList = document.getElementById('balance-list');
  balanceList.innerHTML = '';

  const currentUserBalance = users[currentUser].balance;

  Object.entries(currentUserBalance).forEach(([crypto, quantity]) => {
    if (crypto === 'usd') {
      const listItem = document.createElement('li');
      listItem.textContent = `USD: ${quantity}`;
      balanceList.appendChild(listItem);
    } else {
      const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`;
      fetch(priceUrl)
        .then(response => response.json())
        .then(data => {
          currentPrices[crypto] = data[crypto].usd;
          const listItem = document.createElement('li');
          listItem.textContent = `${crypto}: ${quantity} (Valor en USD: ${(quantity * currentPrices[crypto]).toFixed(2)})`;
          balanceList.appendChild(listItem);
        })
        .catch(error => console.log(error));
    }
  });

  const usdBalanceElement = document.getElementById('usd-balance');
  if (usdBalanceElement) {
    // Actualizar el balance en USD si el elemento ya existe
    const usdBalance = (currentUserBalance.usd).toFixed(2);
    usdBalanceElement.textContent = `Balance en USD: ${usdBalance}`;
  } else {
    // Crear un nuevo elemento para mostrar el balance en USD si no existe
    const usdBalanceElement = document.createElement('li');
    const usdBalance = (currentUserBalance.usd).toFixed(2);
    usdBalanceElement.textContent = `Balance en USD: ${usdBalance}`;
    usdBalanceElement.id = 'usd-balance';
    balanceList.appendChild(usdBalanceElement);
  }

  updateCryptoList();
}

// Función para actualizar la lista de selección de monedas
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

// Función para registrar un nuevo usuario
function register() {
  const newUsername = document.getElementById('new-username').value;
  const usdAmount = parseFloat(document.getElementById('usd-amount').value);

  if (newUsername !== '' && !isNaN(usdAmount) && usdAmount >= 0) {
    if (users.hasOwnProperty(newUsername)) {
      Swal.fire({
        icon: 'error',
        title: 'Error de registro',
        text: 'El usuario ya existe. Por favor, elige otro nombre de usuario.'
      });
    } else {
      users[newUsername] = {
        balance: {
          usd: usdAmount
        }
      };
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: `Usuario ${newUsername} registrado con éxito.`
      });
    }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de registro',
      text: 'Por favor, ingresa un usuario válido y un monto en USD válido.'
    });
  }
}

// Función de inicio de sesión
function login() {
  const username = document.getElementById('username').value;
  if (users.hasOwnProperty(username)) {
    currentUser = username;
    showMainSection();
    Swal.fire({
      icon: 'success',
      title: 'Inicio de sesión exitoso',
      text: `¡Bienvenido, ${currentUser}!`
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Usuario inválido',
      text: 'Por favor, ingresa un usuario válido.'
    });
  }
}

// Función para realizar una compra
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
            Swal.fire({
              icon: 'success',
              title: 'Compra exitosa',
              text: `Has comprado ${quantity} ${crypto} por ${cost.toFixed(2)} USD!`
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Fondos insuficientes',
              text: 'No tienes suficientes fondos para realizar esta compra.'
            });
          }
        })
        .catch(error => console.log(error));
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Cantidad inválida',
        text: 'Por favor, ingresa una cantidad válida.'
      });
    }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Criptomoneda inválida',
      text: 'Por favor, ingresa una criptomoneda válida.'
    });
  }
}

// Función para realizar una venta
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
          Swal.fire({
            icon: 'success',
            title: 'Venta exitosa',
            text: `Has vendido ${quantity} ${crypto} por ${earnings.toFixed(2)} USD!`
          });
        })
        .catch(error => console.log(error));
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Cantidad inválida',
        text: 'Por favor, ingresa una cantidad válida.'
      });
    }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Criptomoneda inválida',
      text: 'Por favor, ingresa una criptomoneda válida.'
    });
  }
}

// Función para actualizar la pantalla de balance
function updateBalanceDisplay() {
  const balanceList = document.getElementById('balance-list');
  balanceList.innerHTML = '';

  const currentUserBalance = users[currentUser].balance;

  Object.entries(currentUserBalance).forEach(([crypto, quantity]) => {
    if (crypto === 'usd') {
      const listItem = document.createElement('li');
      listItem.textContent = `USD: ${quantity}`;
      balanceList.appendChild(listItem);
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = `${crypto}: ${quantity} (Valor en USD: ${(quantity * currentPrices[crypto]).toFixed(2)})`;
      balanceList.appendChild(listItem);
    }
  });

  const usdBalanceElement = document.getElementById('usd-balance');
  const usdBalance = (currentUserBalance.usd).toFixed(2);
  usdBalanceElement.textContent = `Balance en USD: ${usdBalance}`;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const welcomeSection = document.getElementById('welcome-section');
  const loginSection = document.getElementById('login-section');
  const mainSection = document.getElementById('main-section');

  if (currentUser) {
    showMainSection();
  } else {
    welcomeSection.style.display = 'block';
    loginSection.style.display = 'block';
  }
});
