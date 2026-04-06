/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const CLOUDFLARE_WORKER_URL = "https://gcathing.manyal01.workers.dev";

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `msg ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Set initial message
addMessage("ai", "Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = userInput.value.trim();
  if (!prompt) return;

  addMessage("user", prompt);
  userInput.value = "";
  addMessage("ai", "Thinking... connecting to OpenAI...");

  try {
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant who only answers questions about L'Oréal products, skincare routines, hair care routines, and product recommendations from L'Oréal. If a user asks about anything else, politely tell them you can only help with L'Oréal products and routines.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    const aiText =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not get a response from OpenAI.";

    const thinkingMessage = chatWindow.querySelector(".msg.ai:last-child");
    if (thinkingMessage) {
      thinkingMessage.textContent = aiText;
    } else {
      addMessage("ai", aiText);
    }
  } catch (error) {
    const errMsg =
      "There was an error connecting to the Cloudflare Worker. Please check the worker URL and try again.";
    const thinkingMessage = chatWindow.querySelector(".msg.ai:last-child");
    if (thinkingMessage) {
      thinkingMessage.textContent = errMsg;
    } else {
      addMessage("ai", errMsg);
    }
    console.error(error);
  }
});
