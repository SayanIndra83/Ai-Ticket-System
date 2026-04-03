# 🎫 AI-Powered Ticket Management System (TMS)

An intelligent, asynchronous support ticketing system. This application streamlines user support by utilizing artificial intelligence to automatically read, triage, categorize, and assign priority to incoming help requests, ensuring moderators can act quickly and efficiently.

## ✨ Key Features
* **🤖 AI Auto-Triage:** Integrates with Google's Gemini AI to automatically summarize issues, determine priority levels (Low/Medium/High), and extract required technical skills.
* **⚡ Resilient Background Jobs:** Uses Inngest to handle API calls and email dispatch asynchronously, preventing timeouts and ensuring zero data loss during traffic spikes.
* **📧 Automated Notifications:** Seamless Nodemailer integration instantly alerts assigned moderators via email when a high-priority ticket requires attention.
* **💾 Persistent State:** Robust MongoDB architecture to track ticket lifecycle from creation to resolution.

## 🛠️ Tech Stack
* **Framework:** React.js (App Router)
* **Background Queue:** Inngest
* **AI Model:** Google Gemini
* **Database:** MongoDB & Mongoose
* **Email Service:** Nodemailer (Gmail SMTP)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed and the following accounts set up:
* MongoDB Atlas Cluster
* Google AI Studio (For Gemini API Key)
* Gmail Account (With 2-Step Verification and an App Password)
* Inngest Cloud Account (For Production)

### Installation
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   Copy the example environment file and fill in your secure credentials.
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   *(Note: Never commit your real `.env` file to version control. See `.env.example` for required keys).*

4. Run the development server and local Inngest environment:
   \`\`\`bash
   # Terminal 1: Start React.js
   npm run dev

   # Terminal 2: Start Inngest local dev server
   npx inngest-cli dev
   \`\`\`

## 🧠 System Architecture / How It Works
1. A user submits a support ticket via the frontend UI.
2. The React.js API route saves the raw ticket to MongoDB with a `TODO` status and triggers an Inngest event.
3. Inngest places the event in a secure background queue and passes the ticket data to the Gemini API.
4. Gemini analyzes the context and returns a structured JSON payload with triage instructions.
5. Inngest updates the MongoDB document with the AI's findings and changes the status to `UNDER_MODERATION`.
6. Nodemailer fires an HTML-formatted email to the assigned moderator's real inbox with the AI's summary.
