# AI Contract Analyzer

[![Powered by Google Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue.svg)](https://ai.google.dev/)

An intelligent web application that uses the Google Gemini API to analyze legal documents, extract key points, and answer specific questions about the content.

---

## 🚀 Key Features

-   **Multi-Format Analysis**: Upload contracts in **PDF, DOCX, PNG, or JPG** format, or simply paste the text directly.
-   **Automatic Identification**: The AI detects if the document is a contract and identifies its specific type (e.g., Employment Contract, Lease Agreement).
-   **Quick Summary & Evaluation**: Get an at-a-glance summary of the contract's purpose and a synthetic evaluation of its fairness before diving into the details.
-   **Pros and Cons Extraction**: Receive a clear, structured summary of the positive aspects (Pros) and points of concern (Cons) from the perspective of the person signing the contract.
-   **Verifiable Sources**: Each analyzed point is linked to the exact, verbatim quote from the original text from which it was extracted.
-   **AI-Powered Chat**: Ask specific questions about the document. The assistant will answer based solely on the contract's content.
-   **Contextual Web Search**: If an answer isn't found in the document, the AI can ask for permission to perform a web search, maintaining the conversation's context to find the most relevant information.
-   **Bilingual Interface**: Seamlessly switch between English and Italian for a fully localized user experience.
-   **Modern and Responsive Interface**: A clean and intuitive user experience, optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Artificial Intelligence**: Google Gemini API (`gemini-2.5-flash`)
-   **Supporting Libraries**: `mammoth.js` (for text extraction from `.docx` files)

## ⚙️ Installation and Local Setup

Follow these steps to run the application on your computer.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or later)
-   `npm` or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-contract-analyzer.git
cd ai-contract-analyzer
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure the Gemini API Key

To run the application, you need a Google Gemini API key.

1.  Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Create a file named `.env` in the project's root directory.
3.  Add your API key to the `.env` file like this:

    ```env
    API_KEY=YOUR_API_KEY_HERE
    ```

    **Important**: Make sure the `.env` file is included in your `.gitignore` to avoid exposing your API key publicly. The framework used assumes that this `process.env.API_KEY` environment variable is available at runtime.

### 4. Start the Development Server

Once the API key is configured, you can start the application:

```bash
npm run dev
```

Open the URL provided in your terminal (usually `http://localhost:5173`) in your browser to see the application running.

## 💡 How It Works

1.  **Upload**: The user uploads a file or pastes text. The files are converted into a format compatible with the Gemini API (text or Base64 for images/PDFs).
2.  **Identification**: A first call to the Gemini API is made with a specific prompt to determine if the document is a contract and what type it is. The expected response is a structured JSON.
3.  **In-Depth Analysis**: If the document is a valid contract, a second call is made. This time, the model receives a system instruction that makes it act as a specialized lawyer, tasked with analyzing the text and returning a JSON containing a summary, an evaluation, and lists of pros and cons, each with a description and the original source.
4.  **Display and Chat**: The results are shown to the user in a clear format. Simultaneously, a chat session is initialized, pre-loaded with the document's content as context, ready to receive the user's questions.

## ⚠️ Disclaimer

This application is an informational tool based on artificial intelligence and **does not provide legal advice**. The analysis generated is intended to offer a preliminary overview and does not in any way replace a review by a qualified professional. Always consult a lawyer for legal matters.

## 📄 License

This project is licensed under the MIT License.