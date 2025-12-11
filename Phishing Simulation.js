// Phishing Simulation II - Medium/Hard
// 8 Levels, each level pulls 1 of 3 random scenarios on each playthrough

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ----------------- GAME STATE -----------------
let gameState = "menu"; // "menu" | "playing" | "feedback" | "results"
let currentLevelIndex = 0;
let currentScenario = null;
let score = 0;
let totalLevels = 8;
let feedbackCorrect = false;
let feedbackMessage = "";
let uiButtons = [];

// --------------- SCENARIO DATA ----------------
// Each level has 3 possible scenarios; the game chooses 1 at random for that level
// isPhishing: true (phishing) or false (legit)

const levels = [
  // Level 1 - Basic but slightly tricky
  [
    {
      from: "School IT Support <it-support@school-tech-help.com>",
      subject: "URGENT: Password Expiring in 24 Hours",
      preview:
        "Dear student, your account will be disabled unless you verify your password at the link below. This temporary page was created just for your school.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "The domain 'school-tech-help.com' is not your official school domain, and the message uses pressure ('24 hours') to rush you. Real IT messages should use the official domain and direct you to the normal login portal, not a special link."
    },
    {
      from: "Library Notices <library@school.edu>",
      subject: "Overdue Book Reminder",
      preview:
        "Hi, one of your books is overdue. Please log in to the official school library portal to check your account. We never ask for your password over email.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "The email uses the correct school domain, refers you to the official portal, and clearly says they never ask for your password over email. This matches safe behavior."
    },
    {
      from: "Locker Access <support@lockers-school.com>",
      subject: "New Digital Locker System",
      preview:
        "We are moving to a new locker system. To keep your current locker, confirm your username and password in the attached form.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "They ask for your username and password in an attached form, which is a major red flag. Real services won’t ask you to send passwords directly like this."
    }
  ],

  // Level 2 - Brand impersonation
  [
    {
      from: "Microsoft Account Team <security@micros0ft-support.com>",
      subject: "Unusual Sign-in Activity Detected",
      preview:
        "We detected a sign-in attempt from a new device. If this was you, ignore this email. Otherwise, verify your account immediately at the link below.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "The domain 'micros0ft-support.com' has a zero instead of an 'o'. Attackers often register look-alike domains. A real Microsoft message would come from a genuine Microsoft domain."
    },
    {
      from: "Google Alerts <no-reply@google.com>",
      subject: "Security alert: New login to your Google account",
      preview:
        "We detected a new sign-in from Chrome on Windows. If this was you, you don’t need to do anything. If not, review your account activity.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "This uses the correct domain 'google.com' and directs you to review account activity, not to type your password into a random site. This is consistent with real Google security emails."
    },
    {
      from: "Cloud Storage <alerts@goog1e-secure.com>",
      subject: "Your Drive Is Almost Full—Confirm to Keep Files",
      preview:
        "Your storage is nearly full. To prevent deletion of your files, confirm your account and payment details now.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "The domain 'goog1e-secure.com' is fake (number 1 instead of 'l'), and they threaten deletion to scare you into giving payment data. Real storage alerts do not require you to confirm card details through unknown links."
    }
  ],

  // Level 3 - Text (SMS) style messages
  [
    {
      from: "SchoolBus-Alerts",
      subject: "",
      preview:
        "[TEXT] School bus route 17 is delayed 15 minutes due to traffic. No action needed. Check the official school app for updates.",
      channel: "Text Message",
      isPhishing: false,
      explanation:
        "No link is included, and they direct you to the official school app instead of asking you to click something or share personal information. This is low-risk."
    },
    {
      from: "BankNotice",
      subject: "",
      preview:
        "[TEXT] Your debit card has been locked. Tap here to unlock: http://card-unlock-security.net. Reply with your full card number to confirm.",
      channel: "Text Message",
      isPhishing: true,
      explanation:
        "They use a random web address and ask for your full card number by text. Legit banks do not ask for full card numbers or personal data in SMS."
    },
    {
      from: "SchoolAdmin",
      subject: "",
      preview:
        "[TEXT] We need to quickly validate students' phone numbers. Reply with your full name only. No links needed.",
      channel: "Text Message",
      isPhishing: false,
      explanation:
        "They’re not asking for passwords, codes, or financial info—only a name. While not ideal, this is not typical phishing behavior and lacks the usual red flags like strange links."
    }
  ],

  // Level 4 - Fake job or prize offers
  [
    {
      from: "Tech Internship Program <internships@careers-school.org>",
      subject: "Summer Cybersecurity Internship Interview",
      preview:
        "You applied through the official school portal. Your interview is scheduled for next week. Please sign in to the same portal to confirm.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "They reference the official portal you used and don’t introduce any new login link. No request for secret information over email."
    },
    {
      from: "Esports Sponsorship <events@pro-esports-prize.com>",
      subject: "You Won a Gaming Sponsorship!",
      preview:
        "Congratulations! To receive your $500 prize, please send us a copy of your student ID (front and back) and a photo of a parent’s credit card.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "They ask for photos of IDs and credit cards, which is highly sensitive data. Prize scams often ask for payment or card details to 'release' money."
    },
    {
      from: "Student Jobs <hr@campus-jobs-support.com>",
      subject: "Instant Job Approval—No Interview",
      preview:
        "We pre-approved you for a remote tech support job. Simply click the link and enter your bank account to start receiving pay this week.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "No interview and immediate request for bank details is extremely suspicious. Legit jobs do not start with you entering bank info into an unknown site."
    }
  ],

  // Level 5 - Shared documents / collaboration
  [
    {
      from: "Teacher Drive <no-reply@school.edu>",
      subject: "Shared Google Doc: 'Cybersecurity Group Project'",
      preview:
        "Your teacher shared a document with you. Open it from your Google Drive or classroom dashboard. If you did not expect this, ask your teacher in class.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "The sender uses the official school domain and suggests you open the document from within your normal Google Drive or classroom—not a strange external site."
    },
    {
      from: "DocShare <documents@googledoc-secure-share.com>",
      subject: "New Shared Document From IT Department",
      preview:
        "IT shared 'Password Policy Update' with you. Access is only available through our advanced secure viewer: http://doc-login-verify.com",
      channel: "Email",
      isPhishing: true,
      explanation:
        "The domain looks like Google but is not, and it forces you to use a 'special secure viewer' instead of your normal Google Drive. This is a classic credential-harvesting trick."
    },
    {
      from: "Group Project Bot <no-reply@classroom-collab.net>",
      subject: "Your Name Added to New Classroom Project",
      preview:
        "You’ve been added to a project space. To join, sign in with your email and password on our external collaboration portal. Do not use your normal classroom site.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "They explicitly tell you not to use the normal classroom site, but some unknown portal. Asking for your school password on an external site is suspicious."
    }
  ],

  // Level 6 - Multi-factor / code stealing
  [
    {
      from: "Security Codes <no-reply@school.edu>",
      subject: "Your Login Verification Code",
      preview:
        "You are signing in from a new device. If this was you, enter the code 482913 on the official login page. If it wasn’t you, change your password.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "They do not ask you to reply with the code. Instead, they tell you to use it on the official login page. That aligns with how real multi-factor codes work."
    },
    {
      from: "Security Center <codes@accountprotect-secure.com>",
      subject: "Share Your Verification Code NOW",
      preview:
        "Your account is at high risk. Reply to this email with the code you just received so our team can secure your account.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "No real security team asks you to send your code back to them. The whole purpose of codes is that only YOU enter them during login."
    },
    {
      from: "Helpdesk <helpdesk@school.edu>",
      subject: "Account Locked—We Will Log In For You",
      preview:
        "To help you, reply with your username, password, and any recent 2FA codes so we can log in as you and check security.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "IT staff never need your password or 2FA codes. Anyone asking to log in 'as you' is trying to take over your account."
    }
  ],

  // Level 7 - Social engineering with school context
  [
    {
      from: "Principal <principal@school.edu>",
      subject: "Student Survey On School Climate",
      preview:
        "We are collecting anonymous feedback. The survey is hosted on the district’s official survey site. No login is required.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "Anonymous feedback that doesn’t ask you to log in or share credentials is low risk. The sender and purpose match what a principal might send."
    },
    {
      from: "Principal <principal-school@admin-inbox.com>",
      subject: "Secret Bonus Grade Opportunity",
      preview:
        "You were selected for a secret bonus grade. To receive it, reply with your full name, student ID, and password so we can adjust your records.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "The sender address is not an official school domain and they ask for your password. That is a major red flag, no matter what reward they offer."
    },
    {
      from: "Coach <coach-team@school.edu>",
      subject: "Updated Practice Schedule (Attachment)",
      preview:
        "Practice schedule updated. The attachment is a PDF only. If you can’t open it, ask me in class. Do not enable macros on any files.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "This uses the proper school domain, and the coach even warns you NOT to enable macros—that’s actually good security advice, not phishing."
    }
  ],

  // Level 8 - Very subtle, mixed signals
  [
    {
      from: "Tech Department <no-reply@school.edu>",
      subject: "Reminder: Cybersecurity Awareness Training",
      preview:
        "You are required to complete the annual cybersecurity training. Access it through the same learning portal you normally use for school courses.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "The email references the existing portal you already use and doesn’t attach any unknown links or request credentials by email."
    },
    {
      from: "Cyber Training <training@school-security.net>",
      subject: "Mandatory Cybersecurity Quiz - Immediate Action",
      preview:
        "All students must pass this quiz today. Click the link to sign in with your school username and password on our third-party training site.",
      channel: "Email",
      isPhishing: true,
      explanation:
        "They use a different domain than your school and force you to log in on a third-party site. Real mandatory training should come from your district’s official system."
    },
    {
      from: "Student Services <services@school.edu>",
      subject: "Financial Aid Check-in",
      preview:
        "If you receive financial aid, please visit the official district portal you normally use and check that your info is up to date. We will never ask for bank info by email.",
      channel: "Email",
      isPhishing: false,
      explanation:
        "They steer you to the normal portal and clearly state they will never ask for bank information in email, which matches safe behavior."
    }
  ]
];

// --------------- HELPER FUNCTIONS ----------------

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Randomly select one scenario for the given level
function getRandomScenario(levelIndex) {
  const pool = levels[levelIndex];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function resetGame() {
  currentLevelIndex = 0;
  score = 0;
  currentScenario = getRandomScenario(currentLevelIndex);
  gameState = "playing";
}

// --------------- DRAW FUNCTIONS ------------------

function drawMenu() {
  uiButtons = [];

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Phishing Simulation II", canvas.width / 2, 120);

  ctx.font = "22px Arial";
  ctx.fillText(
    "Medium–Hard • 8 Levels • Random Scenarios Each Run",
    canvas.width / 2,
    170
  );

  ctx.font = "18px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText(
    "Decide if each message is PHISHING or SAFE based on clues.",
    canvas.width / 2,
    220
  );
  ctx.fillText(
    "Click the buttons or press [P] for Phishing, [S] for Safe.",
    canvas.width / 2,
    250
  );

  // Start button
  const btnW = 260;
  const btnH = 60;
  const btnX = canvas.width / 2 - btnW / 2;
  const btnY = 320;

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 3;
  drawRoundedRect(btnX, btnY, btnW, btnH, 12);

  ctx.fillStyle = "#0f0";
  ctx.font = "24px Arial";
  ctx.fillText("START SIMULATION", canvas.width / 2, btnY + 38);

  uiButtons.push({
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
    onClick: () => resetGame()
  });
}

function drawScenario() {
  uiButtons = [];

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = "#0f0";
  ctx.font = "22px Arial";
  ctx.textAlign = "left";
  ctx.fillText(
    `Level ${currentLevelIndex + 1} / ${totalLevels}`,
    40,
    40
  );
  ctx.fillText(`Score: ${score}`, 40, 75);

  // Scenario container
  const boxX = 60;
  const boxY = 110;
  const boxW = canvas.width - 120;
  const boxH = 260;

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 2;
  drawRoundedRect(boxX, boxY, boxW, boxH, 10);

  ctx.fillStyle = "#0f0";
  ctx.font = "18px Arial";
  ctx.textAlign = "left";

  const metaLine = `${currentScenario.channel} - From: ${currentScenario.from}`;
  ctx.fillText(metaLine, boxX + 16, boxY + 40);

  if (currentScenario.subject) {
    ctx.font = "18px Arial";
    ctx.fillText("Subject: " + currentScenario.subject, boxX + 16, boxY + 75);
  }

  ctx.font = "16px Arial";
  ctx.fillStyle = "#ccc";
  const previewY = currentScenario.subject ? boxY + 110 : boxY + 90;
  wrapText(
    currentScenario.preview,
    boxX + 16,
    previewY,
    boxW - 32,
    22
  );

  // Instructions
  ctx.textAlign = "center";
  ctx.fillStyle = "#0f0";
  ctx.font = "18px Arial";
  ctx.fillText(
    "Is this message PHISHING or SAFE?",
    canvas.width / 2,
    boxY + boxH + 40
  );
  ctx.fillText(
    "Click a button or press [P] for Phishing, [S] for Safe.",
    canvas.width / 2,
    boxY + boxH + 70
  );

  // Buttons
  const btnW = 220;
  const btnH = 60;
  const spacing = 40;
  const totalWidth = btnW * 2 + spacing;
  const startX = canvas.width / 2 - totalWidth / 2;
  const btnY = boxY + boxH + 100;

  // Phishing button
  ctx.fillStyle = "#220000";
  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 3;
  drawRoundedRect(startX, btnY, btnW, btnH, 10);
  ctx.fillStyle = "#ff4444";
  ctx.font = "22px Arial";
  ctx.fillText("PHISHING", startX + btnW / 2, btnY + 38);

  uiButtons.push({
    x: startX,
    y: btnY,
    w: btnW,
    h: btnH,
    onClick: () => handleAnswer(true)
  });

  // Safe button
  const safeX = startX + btnW + spacing;
  ctx.fillStyle = "#002200";
  ctx.strokeStyle = "#44ff44";
  drawRoundedRect(safeX, btnY, btnW, btnH, 10);
  ctx.fillStyle = "#44ff44";
  ctx.fillText("SAFE", safeX + btnW / 2, btnY + 38);

  uiButtons.push({
    x: safeX,
    y: btnY,
    w: btnW,
    h: btnH,
    onClick: () => handleAnswer(false)
  });
}

function drawFeedback() {
  uiButtons = [];

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.font = "28px Arial";

  if (feedbackCorrect) {
    ctx.fillStyle = "#44ff44";
    ctx.fillText("Correct!", canvas.width / 2, 120);
  } else {
    ctx.fillStyle = "#ff4444";
    ctx.fillText("Not quite.", canvas.width / 2, 120);
  }

  ctx.font = "20px Arial";
  ctx.fillStyle = "#0f0";
  ctx.fillText(
    `This message was: ${currentScenario.isPhishing ? "PHISHING" : "SAFE"}`,
    canvas.width / 2,
    160
  );

  // Explanation box
  const boxX = 80;
  const boxY = 190;
  const boxW = canvas.width - 160;
  const boxH = 220;

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 2;
  drawRoundedRect(boxX, boxY, boxW, boxH, 10);

  ctx.fillStyle = "#ccc";
  ctx.textAlign = "left";
  ctx.font = "16px Arial";
  wrapText(feedbackMessage, boxX + 16, boxY + 40, boxW - 32, 22);

  // Next button
  const btnW = 220;
  const btnH = 60;
  const btnX = canvas.width / 2 - btnW / 2;
  const btnY = boxY + boxH + 40;

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#0f0";
  drawRoundedRect(btnX, btnY, btnW, btnH, 10);

  ctx.fillStyle = "#0f0";
  ctx.textAlign = "center";
  ctx.font = "22px Arial";

  const isLast = currentLevelIndex === totalLevels - 1;
  const label = isLast ? "VIEW RESULTS" : "NEXT LEVEL";
  ctx.fillText(label, canvas.width / 2, btnY + 38);

  uiButtons.push({
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
    onClick: () => {
      if (isLast) {
        gameState = "results";
      } else {
        currentLevelIndex++;
        currentScenario = getRandomScenario(currentLevelIndex);
        gameState = "playing";
      }
    }
  });
}

function drawResults() {
  uiButtons = [];

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#0f0";
  ctx.font = "32px Arial";
  ctx.fillText("Simulation Complete!", canvas.width / 2, 120);

  ctx.font = "24px Arial";
  ctx.fillStyle = "#44ff44";
  ctx.fillText(
    `Final Score: ${score} / ${totalLevels}`,
    canvas.width / 2,
    170
  );

  ctx.font = "18px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText(
    "Each time you replay, the levels use different scenarios.",
    canvas.width / 2,
    210
  );
  ctx.fillText(
    "Keep practicing until spotting phishing feels automatic.",
    canvas.width / 2,
    240
  );

  // Play Again button
  const btnW = 220;
  const btnH = 60;
  const btnX = canvas.width / 2 - btnW / 2;
  const btnY = 300;

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 3;
  drawRoundedRect(btnX, btnY, btnW, btnH, 10);

  ctx.fillStyle = "#0f0";
  ctx.font = "22px Arial";
  ctx.fillText("PLAY AGAIN", canvas.width / 2, btnY + 38);

  uiButtons.push({
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
    onClick: () => {
      resetGame();
    }
  });
}

// --------------- GAME LOGIC ----------------------

function handleAnswer(guessIsPhishing) {
  const correct = guessIsPhishing === currentScenario.isPhishing;
  feedbackCorrect = correct;
  if (correct) {
    score++;
  }
  feedbackMessage = currentScenario.explanation;
  gameState = "feedback";
}

// --------------- INPUT HANDLERS ------------------

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

  for (const btn of uiButtons) {
    if (
      x >= btn.x &&
      x <= btn.x + btn.w &&
      y >= btn.y &&
      y <= btn.y + btn.h
    ) {
      btn.onClick();
      break;
    }
  }
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (gameState === "menu" && (key === "enter" || key === " ")) {
    resetGame();
  } else if (gameState === "playing") {
    if (key === "p") {
      handleAnswer(true); // phishing
    } else if (key === "s") {
      handleAnswer(false); // safe
    }
  } else if (gameState === "feedback") {
    if (key === "enter" || key === " ") {
      const isLast = currentLevelIndex === totalLevels - 1;
      if (isLast) {
        gameState = "results";
      } else {
        currentLevelIndex++;
        currentScenario = getRandomScenario(currentLevelIndex);
        gameState = "playing";
      }
    }
  } else if (gameState === "results") {
    if (key === "enter" || key === " ") {
      resetGame();
    }
  }
});

// --------------- MAIN LOOP -----------------------

function gameLoop() {
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "playing") {
    drawScenario();
  } else if (gameState === "feedback") {
    drawFeedback();
  } else if (gameState === "results") {
    drawResults();
  }
  requestAnimationFrame(gameLoop);
}

// Start on menu
gameState = "menu";
gameLoop();
