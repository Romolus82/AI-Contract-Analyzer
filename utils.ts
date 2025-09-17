// @ts-nocheck
// Disabilito il type checking per mammoth dato che viene importato globalmente.

interface GenerativePart {
    inlineData: {
        mimeType: string;
        data: string;
    };
}

/**
 * Converte un file in una stringa Base64 e lo formatta come GenerativePart.
 * @param file Il file da convertire.
 * @returns Una promise che si risolve con un oggetto GenerativePart, pronto per l'API.
 */
export const fileToGenerativePart = async (file: File): Promise<GenerativePart> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as data URL."));
      }
      // Rimuove il prefisso 'data:mime/type;base64,' per ottenere solo i dati Base64
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        }
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


/**
 * Estrae il testo da un file .docx.
 * @param file Il file .docx da cui estrarre il testo.
 * @returns Una promise che si risolve con il testo estratto.
 */
export const extractTextFromDocx = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject('Cannot read file');
            }
            mammoth.extractRawText({ arrayBuffer: event.target.result })
                .then((result) => {
                    resolve(result.value);
                })
                .catch(reject);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};