import OpenAI from "openai";
import { OPEN_AI_API_KEY } from "$env/static/private";

const openai = new OpenAI({
    apiKey: OPEN_AI_API_KEY,
});

export const generatePlaylist = async (prompt: string) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `
                    Act as a playlist maker.
                    I want you to create a list of 5 songs that fits the user's request.
                    Your answer should be a JSON array of strings, containing the song titles.
                `,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    const [choice] = completion.choices;
    return JSON.parse(choice.message.content ?? "[]");
};