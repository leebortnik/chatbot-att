const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const chat = document.getElementById("chat");

// Obter nome de usuário da URL
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

if (username) {
    socket.emit("setUsername", username);
} else {
    window.location.href = 'index.html'; // Redireciona para a tela de login se o nome de usuário não estiver definido
}

// Mapeamento de palavras para sons
const wordSoundMap = {
  "gato": "sounds/gato.mp3",
  "cachorro": "sounds/cachorro.mp3",
  "pato": "sounds/pato.mp3"
};

// Carregar os elementos de áudio
const audioElements = {};
Object.keys(wordSoundMap).forEach(word => {
  const audio = new Audio(wordSoundMap[word]);
  audioElements[wordSoundMap[word]] = audio;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const message = `${username}:${input.value}`;
    socket.emit("chatMessage", message);
    input.value = "";
  }
});

socket.on("userJoined", (username) => {
  const item = document.createElement("li");
  item.textContent = `${username} Entrou no chat`;
  chat.appendChild(item);
  scrollToBottom();
});

socket.on("chatMessage", async (msg) => {
  if (typeof msg === 'string') {
    const [msgUsername, msgText] = msg.split(':');
    const item = document.createElement("li");
    const isSentMessage = msgUsername === username;

    item.classList.add(isSentMessage ? "sent" : "received");
    item.innerHTML = `<strong>${msgUsername}:</strong> ${msgText}`;
    chat.appendChild(item);
    scrollToBottom();

    // Verifica se a mensagem contém palavras correspondentes aos sons e faz solicitações para as APIs de imagem
    playSoundAndFetchImageFromMessage(msgText.toLowerCase());
  }
});

function scrollToBottom() {
  chat.scrollTop = chat.scrollHeight;
}

async function playSoundAndFetchImageFromMessage(message) {
  // Verifica cada palavra da mensagem
  Object.keys(wordSoundMap).forEach(async word => {
    if (message.includes(word)) {
      const audio = audioElements[wordSoundMap[word]];
      audio.play();

      // Requisição para a API correspondente à palavra-chave
      try {
        const response = await axios.get(`/api/cat`); // Ajuste a rota conforme necessário
        const imageUrl = response.data.imageUrl;
        // Aqui você pode exibir a imagem ou fazer o que quiser com ela
        console.log(`Received image URL for ${word}: ${imageUrl}`);
      } catch (error) {
        console.error(`Failed to fetch image for ${word}: ${error.message}`);
      }
    }
  });
}
