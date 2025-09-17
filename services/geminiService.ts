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
      description: "The specific type of the contract in Italian (e.g., 'Contratto di Locazione', 'Accordo di Non Divulgazione'). If it's not a contract, this should be 'Non è un contratto'.",
    },
  },
  required: ["isContract", "contractType"],
};

// Define the expected JSON schema for the analysis result
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    pros: {
      type: Type.ARRAY,
      description: "List of positive aspects or advantages for the user in the contract, in Italian.",
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
        },
        required: ["description", "source"],
      },
    },
    cons: {
      type: Type.ARRAY,
      description: "List of negative aspects, risks, or disadvantages for the user in the contract, in Italian.",
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
        },
        required: ["description", "source"],
      },
    },
  },
  required: ["pros", "cons"],
};


/**
 * Identifies the type of a contract using the Gemini API.
 * @param contents The contract content to identify.
 * @returns A promise that resolves to an IdentificationResult object.
 */
export const identifyContractType = async (contents: any): Promise<IdentificationResult> => {
    const prompt = `
      Analizza il seguente documento. È un contratto legale? Se sì, qual è il suo tipo specifico?
      Esempi di tipo: "Contratto di Lavoro", "Contratto di Locazione", "Accordo di Riservatezza (NDA)", "Contratto di Appalto".
      Se non è un contratto legale, indicalo.
      Rispondi ESCLUSIVAMENTE con l'oggetto JSON richiesto.
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
    
    if (typeof result.isContract !== 'boolean' || typeof result.contractType !== 'string') {
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
 * @returns A promise that resolves to an AnalysisResult object.
 */
export const analyzeContract = async (contents: any, contractType: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    Sei un avvocato italiano esperto e meticoloso, specializzato in ${contractType}.
    Il tuo compito è analizzare il contratto fornito dal punto di vista della persona che lo deve firmare (ad esempio il lavoratore, l'inquilino, il prestatore d'opera).
    Per ogni punto di forza (pro) e punto di debolezza (contro) che identifichi, devi fornire due cose:
    1.  'description': Una descrizione chiara e concisa del punto.
    2.  'source': La citazione esatta e letterale del testo del contratto che giustifica quel punto.
    Sii chiaro, conciso e vai dritto al punto. Evita il gergo legale quando possibile.
    Rispondi ESCLUSIVAMENTE con l'oggetto JSON richiesto. Non aggiungere introduzioni, conclusioni o altre frasi.
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
    
    if (!result || !Array.isArray(result.pros) || !Array.isArray(result.cons)) {
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
 * @returns The initialized Chat object.
 */
export const startChatWithDocument = (documentContent: any, contractType: string): Chat => {
  const systemInstruction = `
    Sei un assistente legale specializzato in ${contractType}.
    Il tuo unico scopo è rispondere a domande basandoti ESCLUSIVAMENTE sul testo del documento che ti è stato fornito.
    Non inventare informazioni. Se la risposta non è presente nel testo, rispondi ESATTAMENTE con la stringa '[PERFORM_WEB_SEARCH]' e nient'altro.
    Sii preciso e cita le parti del testo quando è rilevante.
  `;

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
    },
    // The initial message from the user is the document itself.
    history: [{ role: 'user', parts: [{ text: "Analizza e rispondi alle domande basandoti solo su questo documento:" }, ...(Array.isArray(documentContent.parts) ? documentContent.parts : [{text: documentContent}])] }],
  });

  return chat;
};

/**
 * Performs a web search for a given query using the Gemini API, considering chat context.
 * @param query The user's question to search for.
 * @param history The recent chat history for context.
 * @returns A promise that resolves to an object containing the answer text and sources.
 */
export const performWebSearchForQuery = async (query: string, history: ChatMessage[]): Promise<{ text: string, sources: GroundingSource[] }> => {
    try {
        const contextHistory = history
          .slice(-4) // Take the last 4 messages for context
          .map(msg => `${msg.role === 'user' ? 'Utente' : 'Assistente'}: ${msg.text}`)
          .join('\n');

        const finalPrompt = `
Basandoti sulla seguente conversazione, formula una risposta chiara e concisa alla domanda finale dell'utente utilizzando le informazioni più recenti dal web.

--- INIZIO CONTESTO CONVERSAZIONE ---
${contextHistory}
--- FINE CONTESTO CONVERSAZIONE ---

DOMANDA FINALE DELL'UTENTE: "${query}"
`;
        const response = await ai.models.generateContent({
            model: model,
            contents: finalPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text?.trim() ?? "Non sono riuscito a trovare una risposta tramite la ricerca web. Riprova riformulando la domanda.";
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