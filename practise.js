const scenerios = {
    "Technical Interview": {
        description: "You're in a technical interview for a software developer position. The interviewer will ask questions about your programming skills, problem-solving approach, and past projects. Stay confident, provide clear examples, and explain your thought process step by step.",
        difficulty: "Medium",
        duration: "5 min"
    },
    "Behavioral Interview": {
        description: "Practice answering behavioral questions that assess your teamwork, communication, and adaptability. Use the STAR method (Situation, Task, Action, Result) to structure your responses clearly.",
        difficulty: "Easy",
        duration: "5-6 min"
    },
    "Group Discussion": {
        description: "Participate in a group discussion on a given topic. Focus on expressing your ideas clearly, listening to others, and contributing constructively without dominating the conversation.",
        difficulty: "Medium",
        duration: "8-10 min"
    },
    "Project Presentation": {
        description: "Present your project to an audience, explaining its purpose, features, and your contribution. Be concise, use examples, and anticipate questions from the audience.",
        difficulty: "Hard",
        duration: "5-7 min"
    },
    "Sales Pitch": {
        description: "Pitch a product or idea to potential customers or stakeholders. Highlight the benefits, address potential objections, and maintain an engaging and persuasive tone.",
        difficulty: "Hard",
        duration: "5-10 min"
    }
};
let buttons = document.querySelectorAll(".btn");
buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        let selected = btn.textContent;
        document.querySelector(".current-scenario h3").textContent = selected;
        document.querySelector(".current-scenario h4").textContent = scenerios[selected].description;
        document.querySelectorAll(".tag")[0].textContent = "Difficulty: " + scenerios[selected].difficulty;
        document.querySelectorAll(".tag")[1].textContent = "Duration: " + scenerios[selected].duration;
    })
})
let mic = document.querySelector('.mic');
let p = document.querySelector('.start-recording');
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioURL;
let audio;
let timerElement = document.querySelector('.timer');
let timerInterval;
let seconds = 0;
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continious = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        document.querySelector('.feedback-box').textContent = transcript;
    };
    recognition.onerror = (event) => {
        console.log(event.error);
    };
} else {
    document.querySelector('.feedback-box').textContent = "Speech recognition not supported";
}
function formatTime(sec) {
    let m = Math.floor(sec / 60).toString().padStart(2, '0');
    let s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
mic.addEventListener('click', async () => {
    mic.classList.toggle('mic-recording');
    if (mic.classList.contains('mic-recording')) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                p.textContent = "Recording complete. Click ▶ Play to listen or ⟳ Reset to Reset";
                audioBlob = new Blob(audioChunks, { type: 'audio/wav ' });
                audioURL = URL.createObjectURL(audioBlob);
                audio = new Audio(audioURL);
                clearInterval(timerInterval);
                seconds = 0;
            }
            mediaRecorder.start();
            p.textContent = "Recording Audio...";
            seconds = 0;
            timerElement.textContent = formatTime(seconds);
            timerInterval = setInterval(() => {
                seconds++;
                timerElement.textContent = formatTime(seconds);
            }, 1000);
            if (recognition) {
                recognition.start();
            }
        } catch (error) {

        }
    } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (recognition) {
            recognition.stop();
        }
    }
});
document.querySelectorAll('.pr')[0].addEventListener('click', () =>{
    if (!audio) return;

    let duration = Math.floor(audio.duration); // total seconds
    let timeLeft = duration;

    audio.play();

    timerElement.textContent = formatTime(timeLeft);

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "00:00";
        } else {
            timerElement.textContent = formatTime(timeLeft);
        }
    }, 1000);
});
document.querySelectorAll('.pr')[1].addEventListener('click', () => {
    p.textContent = "Recording reset. Click mic to start again.";
    audioChunks = [];
    audioURL = null;
    audio = null;
    clearInterval(timerInterval);
    seconds = 0;
    timerElement.textContent = "00:00";
});
// progress bar
function updateProgress(percent) {
    document.querySelector('.progress-fill').style.width = percent + "%";
}
updateProgress(30);
