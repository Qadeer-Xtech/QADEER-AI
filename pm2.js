const { exec } = require('child_process'); // Dusre scripts chalanay ke liye module
const fs = require('fs'); // Files check karne ke liye module

// --- Settings ---
const MAX_RESTARTS_IN_WINDOW = 20; // 30 second mein 20 se zyada baar restart na ho
const RESTART_WINDOW_MS = 30000;   // 30 second ka time window

// --- State Variables ---
let restartCount = 0;
let lastRestartTimestamp = Date.now();
let childProcess;

// --- Helper Functions ---
const log = (message) => console.log(`[PM2-Wrapper] ${message}`);
const logError = (message) => console.error(`[PM2-Wrapper-Error] ${message}`);


/**
 * Diye gaye script ko start karta hai aur us par nazar rakhta hai.
 * @param {string} scriptPath - Script ka path jise chalana hai.
 */
function startAndMonitor(scriptPath) {
    log(`Script start ho raha hai: 'node ${scriptPath}'`);

    // 'exec' ka istemal karke script ko ek child process mein chalayein
    childProcess = exec(`node ${scriptPath}`);

    // Child process ki output ko is script ki output par dikhayein
    childProcess.stdout.on('data', (data) => {
        process.stdout.write(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
        logError(data.toString());
    });

    // --- Asal Restart Logic ---
    childProcess.on('exit', (code) => {
        // Agar code 0 hai, to script sahi se band hua, restart na karein.
        if (code === 0) {
            log('Script sahi tareeqe se band ho gaya.');
            return; 
        }

        const now = Date.now();
        
        // Check karein ke script bohot jaldi jaldi to crash nahi ho raha
        if (now - lastRestartTimestamp < RESTART_WINDOW_MS) {
            restartCount++;
        } else {
            // Agar time guzar gaya hai to count reset karein
            restartCount = 1;
        }

        lastRestartTimestamp = now;

        // Agar 30 second mein 20 se zyada baar crash ho to band kar dein
        if (restartCount > MAX_RESTARTS_IN_WINDOW) {
            logError(`Script 30 second mein ${MAX_RESTARTS_IN_WINDOW} se zyada baar crash hua hai.`);
            logError('Loop se bachne ke liye process ko roka ja raha hai.');
            process.exit(1); // Is wrapper script ko band kar dein
        } else {
            log(`Script code ${code} ke sath band hua. Dobara start ho raha hai... (Koshish #${restartCount})`);
            startAndMonitor(scriptPath); // Script ko dobara start karein
        }
    });
}


// --- Main Execution ---

// Command-line se script ka naam lein
const scriptToRun = process.argv[2];

if (!scriptToRun) {
    logError('Barae meharbani, chalanay ke liye script ka naam dein.');
    log('Istemal: node pm2.js <aapka_script.js>');
    process.exit(1);
}

if (!fs.existsSync(scriptToRun)) {
    logError(`Script "${scriptToRun}" mojood nahi hai.`);
    process.exit(1);
}

// Pehli baar process start karein
startAndMonitor(scriptToRun);
