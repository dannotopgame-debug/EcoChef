import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EcoChefResponse, GeneratePlanParams } from "../types";

const API_KEY = process.env.API_KEY || '';

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const ecoChefSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "Resumen empático del inventario." },
        usedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingMacros: { type: Type.STRING }
      },
      required: ["summary", "usedIngredients", "missingMacros"]
    },
    nutritionalStats: {
      type: Type.OBJECT,
      properties: {
        averageDailyCalories: { type: Type.NUMBER, description: "Calorías diarias promedio estimadas" },
        macroSplit: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.STRING, description: "Ej: 20%" },
            carbs: { type: Type.STRING, description: "Ej: 50%" },
            fats: { type: Type.STRING, description: "Ej: 30%" }
          },
          required: ["protein", "carbs", "fats"]
        },
        note: { type: Type.STRING, description: "Breve nota sobre el equilibrio nutricional de la semana." }
      },
      required: ["averageDailyCalories", "macroSplit", "note"]
    },
    plan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Ej: Día 1" },
          mealType: { type: Type.STRING, description: "Desayuno, Comida o Cena" },
          meal: { type: Type.STRING },
          prepTime: { type: Type.STRING },
          cost: { type: Type.STRING }
        },
        required: ["day", "mealType", "meal", "prepTime", "cost"]
      }
    },
    shoppingList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["category", "items"]
      }
    },
    recipes: {
      type: Type.ARRAY,
      description: "Lista COMPLETA de recetas para CADA plato único mencionado en el plan.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          chefTips: { type: Type.STRING, description: "Tip crucial sobre sabor, sal o conservación." }
        },
        required: ["title", "steps", "chefTips"]
      }
    }
  },
  required: ["analysis", "nutritionalStats", "plan", "shoppingList", "recipes"]
};

export const generateEcoChefPlan = async (params: GeneratePlanParams): Promise<EcoChefResponse> => {
  const modelId = 'gemini-3-flash-preview';

  const systemInstruction = `
    Eres "EcoChef", un instructor de cocina paciente y experto en economía doméstica.
    
    TU MISIÓN:
    Crear menús semanales (Desayuno, Comida, Cena) usando lo que el usuario ya tiene, minimizando compras.

    IDIOMA:
    Debes generar TODA la respuesta (JSON) en el idioma solicitado: ${params.language}.

    FILOSOFÍA DE RECETAS:
    1. Explicación para Principiantes. 
    2. El Sabor es Rey.
    3. Condimentos básicos.
    4. Zero Waste.

    REGLA DE ORO PARA LA RESPUESTA:
    Debes generar el objeto "recipes" conteniendo UNA RECETA DETALLADA por cada plato principal único mencionado en el "plan".
  `;

  const prompt = `
    Ingredientes disponibles: "${params.ingredients}".
    Duración: ${params.days} días.
    Restricciones: "${params.dietaryRestrictions || 'Ninguna'}".
    
    IMPORTANTE: Responde en idioma ${params.language}.
    Genera el JSON siguiendo el esquema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: ecoChefSchema,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as EcoChefResponse;

  } catch (error) {
    console.error("Error creating EcoChef plan:", error);
    throw error;
  }
};