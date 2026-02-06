let commands = {};
let responses = {};
let currentSuggestion = "";
let suggestionIndex = -1;

// fungsi similarity sederhana
function similarity(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++;
    }
    return matches / Math.max(a.length, b.length);
}

// load data dari file eksternal
fetch("data.txt")
    .then(res => res.json())
    .then(data => {
        commands = data.commands;
        responses = data.responses;
    });

function getResponse(command) {
    command = command.toLowerCase().trim();

    // cek exact match di commands
    if (commands[command]) {
        return { type: "link", text: "Membuka " + command + "...", url: commands[command] };
    }

    // cek exact match di responses
    if (responses[command]) {
        return { type: "text", text: responses[command] };
    }

    // fuzzy match di responses
    for (let key in responses) {
        if (similarity(command, key) > 0.6) {
            return { type: "text", text: responses[key] };
        }
    }

    return { type: "text", text: "Perintah tidak dikenali. Coba salah satu: " + Object.keys(commands).join(", ") };
}

function sendMessage() {
    const input = document.getElementById("input");
    const chatbox = document.getElementById("chatbox");
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";
    suggestionIndex = -1;

    if (!input.value.trim()) return;

    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.textContent = input.value;
    chatbox.appendChild(userMsg);

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.textContent = "Bot sedang mengetik...";
    chatbox.appendChild(typing);

    setTimeout(() => {
        typing.remove();
        const result = getResponse(input.value);

        const botMsg = document.createElement("div");
        botMsg.className = "message bot";
        botMsg.textContent = result.text;
        chatbox.appendChild(botMsg);

        // simpan ke LocalStorage 
        saveHistory(input.value, result.text);

        if (result.type === "link") {
            setTimeout(() => {
                window.location.href = result.url;
            }, 1500);
        }

        input.value = "";
        chatbox.scrollTop = chatbox.scrollHeight;
    }, 1000);
}

function showSuggestions(value) {
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";
    currentSuggestion = "";
    suggestionIndex = -1;
    if (!value.trim()) return;

    const lowerValue = value.toLowerCase();

    // gabungkan commands + responses
    const allKeys = [...Object.keys(commands), ...Object.keys(responses)];
    const matches = allKeys.filter(key => key.includes(lowerValue));

    if (matches.length > 0) {
        currentSuggestion = matches[0];
    }

    matches.forEach(match => {
        const div = document.createElement("div");
        // tambahkan label kategori
        if (commands[match]) {
            div.textContent = match;
        } else {
            div.textContent = match;
        }
        div.onclick = () => {
            document.getElementById("input").value = match;
            suggestions.innerHTML = "";
        };
        suggestions.appendChild(div);
    });
}


document.getElementById("input").addEventListener("keydown", function (e) {
    const suggestions = document.getElementById("suggestions").children;
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
    if (e.key === "Tab" && currentSuggestion) {
        e.preventDefault();
        this.value = currentSuggestion;
        document.getElementById("suggestions").innerHTML = "";
    }
    if (e.key === "ArrowDown" && suggestions.length > 0) {
        e.preventDefault();
        suggestionIndex = (suggestionIndex + 1) % suggestions.length;
        updateActiveSuggestion(suggestions);
    }
    if (e.key === "ArrowUp" && suggestions.length > 0) {
        e.preventDefault();
        suggestionIndex = (suggestionIndex - 1 + suggestions.length) % suggestions.length;
        updateActiveSuggestion(suggestions);
    }
});

function updateActiveSuggestion(suggestions) {
    for (let i = 0; i < suggestions.length; i++) {
        suggestions[i].classList.remove("active");
    }
    suggestions[suggestionIndex].classList.add("active");
    // perbaikan regex agar label kategori dihapus dengan benar
    document.getElementById("input").value = suggestions[suggestionIndex].textContent.replace(/\[(Perintah|Respon)\]\s*/, "");

    // 🔑 Tambahan: auto-scroll agar suggestion aktif selalu terlihat 
    suggestions[suggestionIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function saveHistory(userText, botText) {
  let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ user: userText, bot: botText, time: new Date().toLocaleString() });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}


function loadHistory() {
  const chatbox = document.getElementById("chatbox");
  let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.forEach(entry => {
    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.textContent = entry.user;
    chatbox.appendChild(userMsg);

    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.textContent = entry.bot;
    chatbox.appendChild(botMsg);
  });
  chatbox.scrollTop = chatbox.scrollHeight;
}


window.onload = loadHistory;
