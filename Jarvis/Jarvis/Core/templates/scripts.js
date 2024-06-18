window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let sendButton = document.getElementById('btn');
let MicButton = document.getElementById('speechbtn');
let searchBox = document.getElementById('searchbox');
let NewChatBtn = document.getElementById('newChatbtn');
const userInput = document.getElementById('searchbox');
let history = [];

function GetText() {
    let text = document.getElementById("searchbox").value;
    const userParagraph = document.createElement('div');
    userParagraph.classList.add('message', 'user-message');
    userParagraph.innerHTML = `<p>${text}</p>`;
    document.getElementById('main-area').appendChild(userParagraph);
    userInput.value = '';
    return text;
}

function GetTextformMic(val) {
    return new Promise((resolve, reject) => {
        if (window.SpeechRecognition) {
            const recognition = new SpeechRecognition() || new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false; // Set to true if you want partial results as you speak

            recognition.onresult = function (event) {
                const transcript = event.results[event.results.length - 1][0].transcript;
                resolve(transcript);
            }

            recognition.onerror = function (event) {
                console.error('Speech recognition error:', event.error);
                reject(event.error);
            };

            recognition.onend = function () {
                console.log('Speech recognition ended');
            };

            if (val === 'start') {
                console.log("start");
                recognition.start();
            } else {
                console.log("end");
                recognition.stop();
            }
        } else {
            console.error('SpeechRecognition is not supported in this browser.');
            resolve('nothing');
        }
    });
}

async function Generateprompt(text) {
    const message = text;
    history.push({ role: 'user', text: message });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, history }),
        });

        const data = await response.json();
        updateChatHistory(data.text);
    } catch (error) {
        console.error('Error sending message:', error);
    }
    // Scroll to the bottom
    const mainArea = document.getElementById('main-area');
    mainArea.scrollTop = mainArea.scrollHeight;
}

function updateChatHistory(data) {
    const aiParagraph = document.createElement('div');
    aiParagraph.style.display = 'flex';
    aiParagraph.style.flexDirection = 'column';
    aiParagraph.classList.add('message', 'ai-response');
    aiParagraph.innerHTML = `${data}`;
    document.getElementById('main-area').appendChild(aiParagraph);
}

function deleteLastChatHistory() {
    document.getElementById('main-area').lastChild.remove();
}

sendButton.addEventListener("click", async function() {
    await Generateprompt(GetText());
});

MicButton.addEventListener("click", async function () {
    MicButton.classList.toggle("Mic-on");
    if (MicButton.classList.contains("Mic-on")) {
        MicButton.style.color = "green";
        try {
            let tempData = await GetTextformMic('start');
            console.log(tempData);
        } catch (error) {
            console.error('Error with microphone:', error);
        }
    }
    else {
        MicButton.style.color = "#00E5FF";
        await GetTextformMic('end');
    }
});

searchBox.addEventListener("keydown", async function (event) {
    if (event.key === 'Enter') {
        await Generateprompt(GetText());
    }
});

function NewChat() {
    let list = document.getElementById('Chats-box');
    document.getElementById('main-area').innerHTML = "";
    const chat = document.createElement('div');
    chat.innerHTML = '<li>Last Chat</li>';
    list.appendChild(chat);
}

NewChatBtn.addEventListener('click', NewChat);
