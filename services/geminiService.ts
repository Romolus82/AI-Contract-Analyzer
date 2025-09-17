import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult, IdentificationResult, GroundingSource, ChatMessage } from '../types';

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

// Define the expected JSON schema for the identification result
const identificationSchema = {
  type: Type.OBJECT,
  properties: {
    isContract: {
      type: Type.BOOLEAN,
      description: "True if the document is a legal contract, false otherwise.",
    },
    contractType: {
      type: Type.STRING,
      description: "The specific type of the contract (e.g., 'Employment Contract', 'Lease Agreement'). If it's not a contract, this should be 'Not a contract'. The language of the type should match the document's language.",
    },
    language: {
        type: Type.STRING,
        description: "The detected primary language of the document as a string (e.g., 'Italian', 'English', 'Spanish')."
    }
  },
  required: ["isContract", "contractType", "language"],
};

// Define the expected JSON schema for the analysis result
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief, neutral summary of what the contract is about. This should be in the document's native language.",
    },
    evaluation: {
      type: Type.STRING,
      description: "A synthetic evaluation of whether the contract is generally good or not for the signatory (e.g., 'This appears to be a standard and fair contract', 'This contract contains several clauses that are unfavorable to the employee and requires careful review'). This should be in the document's native language.",
    },
    pros: {
      type: Type.ARRAY,
      description: "List of positive aspects or advantages for the user in the contract. This should be in the document's native language.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description: "A clear and concise summary of the positive point.",
          },
          source: {
            type: Type.STRING,
            description: "The exact, verbatim quote from the contract that corresponds to this point.",
          },
          score: {
            type: Type.STRING,
            description: "The importance of the positive point for the signatory, rated as 'Basso', 'Medio', or 'Alto'. 'Alto' indicates a very significant advantage.",
            enum: ["Basso", "Medio", "Alto"],
          },
        },
        required: ["description", "source", "score"],
      },
    },
    cons: {
      type: Type.ARRAY,
      description: "List of negative aspects, risks, or disadvantages for the user in the contract. This should be in the document's native language.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description: "A clear and concise summary of the negative or risky point.",
          },
          source: {
            type: Type.STRING,
            description: "The exact, verbatim quote from the contract that corresponds to this point.",
          },
          score: {
            type: Type.STRING,
            description: "The risk level of the negative point for the signatory, rated as 'Basso', 'Medio', or 'Alto'. 'Alto' indicates a very high risk or a major disadvantage.",
            enum: ["Basso", "Medio", "Alto"],
          },
        },
        required: ["description", "source", "score"],
      },
    },
  },
  required: ["summary", "evaluation", "pros", "cons"],
};


/**
 * Identifies the type of a contract using the Gemini API.
 * @param contents The contract content to identify.
 * @returns A promise that resolves to an IdentificationResult object.
 */
export const identifyContractType = async (contents: any): Promise<IdentificationResult> => {
    const prompt = `
      Analyze the following document.
      1. First, detect the primary language of the document (e.g., 'Italian', 'English').
      2. Determine if it is a legal contract.
      3. If it is a contract, identify its specific type in the detected language. Examples of types: "Employment Contract", "Contratto di Locazione", "Accord de Non-Divulgation (NDA)".
      4. If it is not a legal contract, indicate that.
      Respond ONLY with the requested JSON object.
    `;
    
    let requestContents: any;
    if (typeof contents === 'string') {
        requestContents = `${prompt}\n\n---\n\n${contents}`;
    } else { // It's a multipart request, contents is {parts: [...]}
        requestContents = { parts: [{ text: prompt }, ...contents.parts] };
    }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: requestContents,
      config: {
        responseMimeType: "application/json",
        responseSchema: identificationSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error("Received an empty response from the AI during identification. The document might be unreadable or violate content policies.");
    }
    const result: IdentificationResult = JSON.parse(jsonText);
    
    if (typeof result.isContract !== 'boolean' || typeof result.contractType !== 'string' || typeof result.language !== 'string') {
        throw new Error("Invalid identification response format from AI.");
    }

    return result;

  } catch (error) {
    console.error("Error identifying contract type with Gemini API:", error);
    throw new Error("An unexpected error occurred while identifying the contract type.");
  }
};


/**
 * Analyzes contract content using the Gemini API, acting as an expert for a specific contract type.
 * @param contents The contract content to analyze.
 * @param contractType The specific type of contract, used to prime the AI.
 * @param language The language of the contract.
 * @returns A promise that resolves to an AnalysisResult object.
 */
export const analyzeContract = async (contents: any, contractType: string, language: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are a meticulous, expert lawyer specializing in ${contractType}. Your native language is ${language}.
    Your task is to analyze the provided contract from the perspective of the person who has to sign it (e.g., the employee, the tenant, the service provider).

    First, provide a brief, neutral 'summary' of what the contract is about.
    Second, provide a synthetic 'evaluation' of whether the contract is generally favorable or unfavorable for the signatory.
    Then, identify the specific strengths (pros) and weaknesses (cons). For each point, you must provide:
    1. 'description': A clear and concise summary of the point, written in ${language}.
    2. 'source': The exact, verbatim quote from the contract that justifies that point.
    3. 'score': A rating of 'Basso', 'Medio', or 'Alto' indicating its importance or risk level.
       - For Pros: 'Alto' means a major benefit, 'Medio' a standard benefit, 'Basso' a minor plus.
       - For Cons: 'Alto' means a major risk or highly unfavorable clause, 'Medio' a point that requires attention, 'Basso' a minor inconvenience.

    Be clear, concise, and to the point. Avoid legal jargon when possible.
    Respond ONLY with the requested JSON object according to the schema. Do not add introductions, conclusions, or any other text.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.3,
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the AI. The analysis may have been blocked due to safety policies or the document might be unreadable.");
    }
    const result: AnalysisResult = JSON.parse(jsonText);
    
    if (!result || typeof result.summary !== 'string' || typeof result.evaluation !== 'string' || !Array.isArray(result.pros) || !Array.isArray(result.cons)) {
        throw new Error("Invalid response format from AI.");
    }

    return result;

  } catch (error) {
    console.error("Error analyzing contract with Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('SAFETY')) {
            throw new Error("Analysis blocked: The contract content may violate safety policies.");
        }
        if (error.message.includes('400')) {
             throw new Error("There was a problem with the request sent to the AI. Please check the contract and try again.");
        }
        if(error instanceof SyntaxError) { // JSON parsing error
            throw new Error("Could not understand the response from the AI. It might be an issue with the service.");
        }
    }
    throw new Error("An unexpected error occurred while analyzing the contract. Please try again later.");
  }
};

/**
 * Starts a new chat session with the AI, contextualized with the contract's content.
 * @param documentContent The content of the document (text or parts).
 * @param contractType The type of the contract.
 * @param language The language of the document.
 * @returns The initialized Chat object.
 */
export const startChatWithDocument = (documentContent: any, contractType: string, language: string): Chat => {
  const systemInstruction = `
    You are a legal assistant specializing in ${contractType}. Your native language is ${language}.
    Your sole purpose is to answer questions based EXCLUSIVELY on the text of the document you have been provided.
    Do not invent information. If the answer is not in the text, respond EXACTLY with the string '[PERFORM_WEB_SEARCH]' and nothing else.
    Be precise and quote parts of the text when relevant. Respond in ${language}.
  `;

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
    },
    // The initial message from the user is the document itself.
    history: [{ role: 'user', parts: [{ text: "Analyze and answer questions based only on this document:" }, ...(Array.isArray(documentContent.parts) ? documentContent.parts : [{text: documentContent}])] }],
  });

  return chat;
};

/**
 * Performs a web search for a given query using the Gemini API, considering chat context.
 * @param query The user's question to search for.
 * @param history The recent chat history for context.
 * @param language The target language for the answer.
 * @returns A promise that resolves to an object containing the answer text and sources.
 */
export const performWebSearchForQuery = async (query: string, history: ChatMessage[], language: string): Promise<{ text: string, sources: GroundingSource[] }> => {
    try {
        const contextHistory = history
          .slice(-4) // Take the last 4 messages for context
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
          .join('\n');

        const finalPrompt = `
Based on the following conversation, formulate a clear and concise answer to the user's final question using the latest information from the web. The answer must be in ${language}.

--- START CONVERSATION CONTEXT ---
${contextHistory}
--- END CONVERSATION CONTEXT ---

USER'S FINAL QUESTION: "${query}"
`;
        const response = await ai.models.generateContent({
            model: model,
            contents: finalPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text?.trim() ?? "I was unable to find an answer through web search. Please try rephrasing the question.";
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const sources: GroundingSource[] = groundingChunks
          ?.map(chunk => chunk.web)
          .filter((web): web is GroundingSource => !!web && !!web.uri && !!web.title) || [];

        return { text, sources };

    } catch (error) {
        console.error("Error performing web search with Gemini API:", error);
        throw new Error("An unexpected error occurred while searching the web.");
    }
};