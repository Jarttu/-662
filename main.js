let users = [];
let loggedInUser = null;
let votes = [];
let maxOptions = 4;


window.onload = function () {
    let storedUsers = localStorage.getItem("users");
    let storedVotes = localStorage.getItem("votes");
    let storedUser = localStorage.getItem("loggedInUser");

    if (storedUsers) users = JSON.parse(storedUsers);
    if (storedVotes) votes = JSON.parse(storedVotes);
    if (storedUser) loggedInUser = JSON.parse(storedUser);

    if (loggedInUser) {
        showDashboard(loggedInUser);
    }

    loadVotes();
};


function showLogin() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}


function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
}


function register() {
    let username = document.getElementById("regUsername").value;
    let password = document.getElementById("regPassword").value;
    let role = document.getElementById("regRole").value;

    if (!username || !password) {
        alert("Kirjoita käyttäjänimi ja salasana.");
        return;
    }

    if (users.some(user => user.username === username)) {
        alert("Käyttäjänimi on jo olemassa!");
        return;
    }

    users.push({ username, password, role });

    
    localStorage.setItem("users", JSON.stringify(users));

    alert("Rekisteröinti onnistui, kirjaudu sisään.");
    showLogin();
}


function login() {
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    let user = users.find(user => user.username === username && user.password === password);
    if (user) {
        loggedInUser = user;
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        showDashboard(user);
    } else {
        alert("Virheelliset tiedot. Yritä uudelleen.");
    }
}


function showDashboard(user) {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");

    document.getElementById("userWelcome").textContent = user.username;
    document.getElementById("userRole").textContent = user.role;

    if (user.role === "admin") {
        document.getElementById("adminPanel").classList.remove("hidden");
    } else {
        document.getElementById("voteSection").classList.remove("hidden");
    }

    loadVotes();
}


function logout() {
    loggedInUser = null;
    localStorage.removeItem("loggedInUser");
    location.reload();
}


function addOption() {
    let optionsContainer = document.getElementById("optionsContainer");
    let currentOptions = optionsContainer.getElementsByClassName("voteOption").length;

    if (currentOptions >= maxOptions) {
        alert("Voit lisätä max. 4 vaihtoehtoa.");
        return;
    }

    let input = document.createElement("input");
    input.type = "text";
    input.className = "voteOption";
    input.placeholder = `Vaihtoehto ${currentOptions + 1}`;
    optionsContainer.appendChild(input);
}


function createVote() {
    let voteTitle = document.getElementById("voteTitle").value;
    let optionInputs = document.querySelectorAll(".voteOption");

    if (!voteTitle) {
        alert("Kirjoita äänestyksen aihe.");
        return;
    }

    let options = {};
    optionInputs.forEach(input => {
        if (input.value) {
            options[input.value] = [];
        }
    });

    if (Object.keys(options).length < 2) {
        alert("Sinulla on oltava min. 2 vaihtoehtoa.");
        return;
    }

    votes.push({ title: voteTitle, options });

    
    localStorage.setItem("votes", JSON.stringify(votes));

    alert("Äänestys lisätty!");
    document.getElementById("voteTitle").value = "";
    document.getElementById("optionsContainer").innerHTML = `
        <input type="text" class="voteOption" placeholder="Vaihtoehto 1" required>
        <input type="text" class="voteOption" placeholder="Vaihtoehto 2" required>
    `;

    loadVotes();
}


function loadVotes() {
    let voteSection = document.getElementById("votesList");
    voteSection.innerHTML = "";

    votes.forEach((vote, index) => {
        let voteElement = document.createElement("div");
        voteElement.innerHTML = `<h3>${vote.title}</h3>`;

        Object.keys(vote.options).forEach(option => {
            let voteCount = vote.options[option].length;
            let hasVoted = vote.options[option].includes(loggedInUser?.username);

            let voteButton = document.createElement("button");
            voteButton.textContent = `${option} (${voteCount} ääntä)`;
            voteButton.onclick = () => castVote(index, option);
            if (hasVoted) {
                voteButton.style.backgroundColor = "green";
            }

            voteElement.appendChild(voteButton);
        });

        
        if (loggedInUser?.role === "admin") {
            let deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Poista äänestys";
            deleteBtn.onclick = () => removeVote(index);
            voteElement.appendChild(deleteBtn);
        }

        voteSection.appendChild(voteElement);
    });
}


function castVote(voteIndex, selectedOption) {
    if (!loggedInUser) {
        alert("Kirjaudu sisään äänestääksesi!");
        return;
    }

    let hasVotedBefore = votes[voteIndex].options[selectedOption].includes(loggedInUser.username);

    if (hasVotedBefore) {
        
        votes[voteIndex].options[selectedOption] = votes[voteIndex].options[selectedOption].filter(user => user !== loggedInUser.username);
    } else {
        
        Object.keys(votes[voteIndex].options).forEach(option => {
            let index = votes[voteIndex].options[option].indexOf(loggedInUser.username);
            if (index !== -1) {
                votes[voteIndex].options[option].splice(index, 1);
            }
        });

        
        votes[voteIndex].options[selectedOption].push(loggedInUser.username);
    }

    
    localStorage.setItem("votes", JSON.stringify(votes));

    loadVotes();
}


function removeVote(voteIndex) {
    votes.splice(voteIndex, 1);
    localStorage.setItem("votes", JSON.stringify(votes));
    loadVotes();
}


function resetAllData() {
    if (confirm("Oletko varma? Tämä poistaa KAIKEN!")) {
        localStorage.removeItem("users");
        localStorage.removeItem("votes");
        localStorage.removeItem("loggedInUser");
        users = [];
        votes = [];
        loggedInUser = null;
        location.reload();
    }
}