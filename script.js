document.addEventListener('DOMContentLoaded', function () { 
    const output = document.getElementById('output');
    const input = document.getElementById('terminal');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const commandsList = ['cd', 'ls', 'help', 'anim', 'sound', 'clear', 'hello', 'color', 'color ran', 'color random', 'color reset'];
    let animationEnabled = false;
    let soundEnabled = true;
    let currentDir = "/";
    let previousInputs =[""];
    let numberInputs = 0;
    
    function playKeyboardSound() {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Set the frequency (440 Hz is a common pitch)
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Adjust the duration of the sound
    }

    
    const body = {
        "aboutme": {
            "aboutme.txt": "Hello I am Sahli...",
            "picture.txt": "picture.txt"
        },
        "cv.txt": "cv.txt",
        "contact": {
            "email.txt": "sahilwep@gmail.com",
            "github.txt": "https://github.com/sahilwep",
        },
        "blog": {
            "blog": "This is my first blog post!",
        },
        "files": {
            "secret":{
                "username.txt" : "sahilwep",
                "password.txt" : "****************8******",
            },
            "system.txt": "Linux Ubuntu 21.2 Linux Kernel Version xyz arm64",
        }
    };
    let search = body;

    input.addEventListener('keydown', function (e) {
        //adding autocomplete
        if(e.key === "Tab") {
            e.preventDefault();
            if(input.value === '') return;
            for(command of Object.keys(search)) {
                if(command.startsWith(input.value)) {
                    input.value = command;
                }
            }
            for(let command of commandsList) {
                if(command.startsWith(input.value)) {
                    input.value = command;
                    break;
                }
            }
        }

        if (e.key !== 'Enter') return;
        
        e.preventDefault();
        
        if (soundEnabled) playKeyboardSound(); 
        
        if (input.value !== "") {
            let previousInput = previousInputs.pop();
            previousInputs.push(input.value);
            previousInputs.push(previousInput);
        }
        numberInputs = previousInputs.length-1;
        
        console.log(previousInputs);
        
        processCommand(input.value);
        input.value = previousInputs[numberInputs];
    })
    

    function processCommand(command) {
        const trimmedCommand = command.trim().toLowerCase();
        // Color Commands
        if (trimmedCommand.startsWith('color')) {
            colorCommands(trimmedCommand);
            return;
        }
        if (trimmedCommand == "help" || trimmedCommand == "clear" || trimmedCommand == "anim" || trimmedCommand == "sound" || trimmedCommand == "hello"){
            commands(trimmedCommand);
            return;
        } else {
            // Exit
            if (trimmedCommand == "cd" ) {
                search = body;
                document.getElementById('prompt').textContent = `sahilwep~$ `;
                return;
            }
            // List all keys of current object
            for (const obj of [search]) {
                if (trimmedCommand == "ls"){
                    const keys = Object.keys(obj);
                    addToOutput(keys.join('  '));
                    return;
                }
                else if (obj.hasOwnProperty(trimmedCommand)) {
                    // Change current obj to object key typed
                    if (typeof obj[trimmedCommand] === 'object') {
                        search = obj[trimmedCommand];
                        document.getElementById('prompt').textContent = `sahilwep~[/${trimmedCommand}]$   `;
                        // addToOutput(`/${trimmedCommand}`);
                    } else if(typeof obj[trimmedCommand] === 'string' && obj[trimmedCommand].includes(".txt")) {
                        loadAndDisplayFile(trimmedCommand)
                    } else {
                        // Print Current Obj
                        addToOutput(obj[trimmedCommand]);
                    }
                    return;
                }
            }
            addToOutput('Command not found: ' + trimmedCommand);
        }
    }

    function addToOutput(text) {
        const output = document.getElementById('output');
        if (text == "" || text == undefined){text=" "}
        if (animationEnabled) {
            animateText(text, output);
        } else {
            const newLine = document.createElement('pre');
            newLine.textContent = text;
            output.appendChild(newLine);
            output.scrollTop = output.scrollHeight;
        }
    }
    
    function animateText(text, output) {
        let currentIndex = 0;
        output.appendChild(document.createElement('pre'));
    
        const intervalId = setInterval(() => {
            const currentLine = output.lastChild || document.createElement('pre');
            const currentText = (currentLine.textContent || '') + text[currentIndex];
            currentLine.textContent = currentText;
    
            if (!currentLine.parentNode) {
                output.appendChild(currentLine);
            }
    
            if (currentIndex === text.length - 1) {
                output.appendChild(document.createElement('pre')); // Add a new line
                clearInterval(intervalId);
                // Scroll to the bottom after the animation is complete
                output.scrollTop = output.scrollHeight;
            }
    
            currentIndex++;
        },3); // Adjust the delay between letters (in milliseconds)
    }

    function clearOutput() {
        output.innerHTML = '';
    }
    
    function colorCommands(string){
        if(string === "color random" || string === "color ran"){
            const color = generateRandomHexColor()
            changeTerminalColor(color);
            addToOutput(`Color changed to: ${color}`);
        } else {
            const colorValue = string.split(' ')[1];
            if(colorValue === "reset"){
                changeTerminalColor("#00ff00");
                addToOutput(`Color was reset.`);
            }
            else if (isValidColor(colorValue)) {
                changeTerminalColor(colorValue);
                addToOutput(`Color changed to: ${colorValue}`);
            } 
            else    {
                addToOutput('Invalid color input. Please enter a valid hex code.');
            }
        }
    }
    
    function isValidColor(color) {
        const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        return colorRegex.test(color);
    }
    
    function changeTerminalColor(newColor) {
        document.querySelector(':root').style.setProperty('--lime', newColor)
    };

    function generateRandomHexColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + '0'.repeat(6 - randomColor.length) + randomColor;
    }

    function loadAndDisplayFile(filename) {
        fetch(`files/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error loading file: ${filename}`);
                }
                return response.text();
            })
            .then(content => {
                addToOutput(content);
            })
            .catch(error => {
                addToOutput(error.message);
            });
    }

    function commands(string) {
        switch(string){
            case 'help':
                    addToOutput(`
|-----------------------|-----------------------------------|
|       COMMANDS        |       USAGES                      |
|-----------------------|-----------------------------------|
|       ls              |       List directories            |
|       help            |       Help Description            |
|       clear           |       Clear screen                |
|       color #hexcode  |       Change display color        |
|       anim            |       Toggle text animation       |
|       sound           |       Mute/Unmute sound effects   |
|       cd              |       Go to /                     |
|-----------------------|-----------------------------------|`);
                    break;
                case 'anim':
                    if (animationEnabled){
                        animationEnabled = false
                        addToOutput("Text is no longer animated.")
                    } else {
                        animationEnabled = true
                        addToOutput("Text is animated.")
                    };
                    break;
                case 'sound':
                    if (soundEnabled){
                        soundEnabled = false
                        addToOutput("Sound effects muted.")
                    } else {
                        soundEnabled = true
                        addToOutput("Sound effects unmuted.")
                    };
                    break;
                case 'clear':
                    clearOutput();
                    break;
                case 'hello':
                    addToOutput(`${input.value} world!`)
                    break;
        }
    }
    // Set focus on the command input when the page loads
    input.focus();

    // Prevent clicking away from the input
    document.addEventListener('click', function (event) {
        if (!event.target.matches('#terminal')) {
            input.focus();
        }
    });

    // Handles up and down arrow keys (Remembers previous commands)
    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault(); // Prevent default behavior
                if (numberInputs > 0) {
                    numberInputs-=1
                    console.log(numberInputs)
                    input.value = previousInputs[numberInputs];
                    input.setSelectionRange(input.value.length, input.value.length); // Set the caret position to the end of the word
                }
                break;
            case 'ArrowDown':
                if (numberInputs != previousInputs.length-1) {
                    console.log(previousInputs[numberInputs])
                    numberInputs+=1
                    //  console.log(numberInputs)
                    input.value = previousInputs[numberInputs];
                }
                break;
        }
    });
});
