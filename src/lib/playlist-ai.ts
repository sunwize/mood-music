import { openai } from "$lib/openai";

export const generatePlaylist = async (prompt: string) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `
               		Act as a playlist maker.
                	You will be creating a playlist of 5 songs based on the prompt you will be provided with.
                	It can be an activity, a mood or a word.
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
