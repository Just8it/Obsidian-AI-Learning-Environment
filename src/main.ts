/*
 * AI LEARNING ASSISTANT PLUGIN
 * Features: Flashcard Generation + Summary Generation
 * Migrated to TypeScript
 */

import { Plugin, Notice, requestUrl, TFile, MarkdownView } from "obsidian";
import { LearningAssistantModal } from "./modal";
import { AILearningSettingTab } from "./settingsTab";

// ==================== TYPES ====================

export interface PromptConfig {
    purpose: string;
    detail: string;
}

export interface PromptSet {
    [level: string]: PromptConfig;
}

export interface AILearningSettings {
    apiKey: string;
    model: string;
    language: string;
    apiUrl: string;
    defaultDetailLevel: string;
    saveLocation: string;
    cardStyle: string;
    customInstructions: string;
    advancedMode: boolean;
    flashcardPrompts: PromptSet;
    summaryPrompts: PromptSet;
    modelContextLengths: { [modelId: string]: number };
}

export interface GenerationOptions {
    detailLevel: string;
    cardCount: string;
    saveLocation: string;
    cardStyle: string;
    model: string;
    envCustomInstructions: string;
    envSummaryCustomInstructions: string;
    flashcardCustomInstructions: string;
    summaryCustomInstructions: string;
    multipleChoice: boolean;
    choiceCount: string;
    envMultipleChoice: boolean;
    envChoiceCount: string;
}

export interface ContentResult {
    text: string;
    editor: any;
    file: TFile;
}

// ==================== DEFAULT PROMPTS ====================

export const DEFAULT_FLASHCARD_PROMPTS: PromptSet = {
    "1": { purpose: "Summarize the text into key definitions.", detail: "Focus ONLY on core concepts. Ignore sub-points." },
    "2": { purpose: "Cover main concepts and key facts.", detail: "Capture major headings and vital supporting facts." },
    "3": { purpose: "Create a standard study deck.", detail: "Standard coverage. Capture main ideas, key details, and important lists." },
    "4": { purpose: "Create a detailed study deck.", detail: "High Detail. Capture concepts, formulas, lists, and specific nuances." },
    "5": { purpose: "EXHAUSTIVE EXAM PREPARATION.", detail: "ATOMIZE EVERYTHING. Extract EVERY SINGLE FACT. If a paragraph has 3 points, make 3 cards. Precision > Quantity." }
};

export const DEFAULT_SUMMARY_PROMPTS: PromptSet = {
    "1": { purpose: "Create a brief executive summary.", detail: "Maximum 3-5 bullet points. Only the most critical takeaways." },
    "2": { purpose: "Create a concise overview.", detail: "Cover main sections with 1-2 sentences each. Include key terms." },
    "3": { purpose: "Create a balanced study summary.", detail: "Cover all major topics. Include definitions, key points, and important relationships." },
    "4": { purpose: "Create a comprehensive summary.", detail: "Detailed coverage. Include formulas, examples, and nuances. Preserve structure." },
    "5": { purpose: "Create an exhaustive reference document.", detail: "Include EVERYTHING. Formulas, proofs, examples, edge cases. This should serve as complete study notes." }
};

export const DEFAULT_SETTINGS: AILearningSettings = {
    apiKey: "",
    model: "google/gemini-2.0-flash-exp:free",
    language: "German",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    defaultDetailLevel: "3",
    saveLocation: "inline",
    cardStyle: "single",
    customInstructions: "",
    advancedMode: false,
    flashcardPrompts: JSON.parse(JSON.stringify(DEFAULT_FLASHCARD_PROMPTS)),
    summaryPrompts: JSON.parse(JSON.stringify(DEFAULT_SUMMARY_PROMPTS)),
    modelContextLengths: {}
};

// ==================== MAIN PLUGIN ====================

export default class AILearningAssistant extends Plugin {
    settings!: AILearningSettings;
    statusBarItem!: HTMLElement;

    async onload(): Promise<void> {
        await this.loadSettings();

        this.statusBarItem = this.addStatusBarItem();
        this.statusBarItem.setText('');
        this.statusBarItem.addClass('ai-learning-status');

        this.addRibbonIcon('brain-circuit', 'AI Learning Assistant', () => {
            new LearningAssistantModal(this.app, this).open();
        });

        this.addCommand({
            id: 'open-learning-assistant',
            name: 'Open Learning Assistant',
            callback: () => { new LearningAssistantModal(this.app, this).open(); }
        });

        this.addCommand({
            id: 'generate-flashcards',
            name: 'Generate Flashcards',
            callback: () => { new LearningAssistantModal(this.app, this, 'flashcards').open(); }
        });

        this.addCommand({
            id: 'generate-summary',
            name: 'Generate Summary',
            callback: () => { new LearningAssistantModal(this.app, this, 'summary').open(); }
        });

        this.addCommand({
            id: 'create-learning-environment',
            name: 'Create Learning Environment',
            callback: () => { new LearningAssistantModal(this.app, this, 'environment').open(); }
        });

        this.addSettingTab(new AILearningSettingTab(this.app, this));

        this.app.workspace.onLayoutReady(() => {
            const provider = this.getProvider();
            if (provider && this.settings.model && typeof provider.setModel === 'function') {
                provider.setModel('ai-flashcards', this.settings.model);
            }
        });
    }

    // ==================== PROVIDER ACCESS ====================

    getProvider(): any {
        const provider = (this.app as any).plugins.getPlugin('openrouter-provider');
        return provider || null;
    }

    async fetchWithRetry(requestBody: any, retries = 5, delay = 5000): Promise<any> {
        const provider = this.getProvider();

        // Use Provider if available
        if (provider) {
            try {
                this.setStatus("API call (Provider)...");
                const response = await provider.fetchWithRetry(requestBody, retries, delay);
                this.clearStatus();
                return response;
            } catch (error: any) {
                this.setStatus("API Error");
                throw error;
            }
        }

        // Fallback: Standalone Mode
        const apiKey = this.settings.apiKey;
        if (!apiKey) {
            throw new Error("API Key not found. Please enable OpenRouter Provider OR set a key in settings.");
        }

        new Notice(`🤖 Generating with ${requestBody.model}...`, 5000);

        for (let i = 0; i < retries; i++) {
            try {
                this.setStatus(`API call... (try ${i + 1})`);
                const response = await requestUrl({
                    url: this.settings.apiUrl,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "https://obsidian.md",
                        "X-Title": "Obsidian AI Learning Assistant"
                    },
                    body: JSON.stringify(requestBody)
                });

                if (response.status === 429) {
                    const waitSec = Math.round(delay / 1000);
                    this.setStatus(`Rate limit! Wait ${waitSec}s...`);
                    new Notice(`⚠️ Rate Limit! Waiting ${waitSec}s... (Retry ${i + 1}/${retries})`);
                    await new Promise(r => setTimeout(r, delay));
                    delay *= 2;
                    continue;
                }

                if (response.status >= 400) {
                    let errorMsg = `API Error ${response.status}`;
                    try {
                        const errJson = response.json;
                        if (errJson?.error?.message) errorMsg += `: ${errJson.error.message}`;
                    } catch (e) {
                        errorMsg += `: ${response.text?.substring(0, 100) || 'Unknown error'}`;
                    }
                    throw new Error(errorMsg);
                }

                // Remove <think> tags from deepseek/reasoning models
                if (response.json?.choices?.length > 0) {
                    let content = response.json.choices[0].message.content;
                    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
                    response.json.choices[0].message.content = content;
                }

                return response;

            } catch (error: any) {
                console.error('AI Learning Assistant Error:', error);
                if (i === retries - 1) {
                    this.setStatus(`Failed: ${error.message.substring(0, 30)}...`);
                    throw error;
                }
                new Notice(`⚠️ ${error.message} - Retrying (${i + 1}/${retries})...`);
                await new Promise(r => setTimeout(r, delay));
                delay *= 1.5;
            }
        }
    }

    async fetchCredits(): Promise<string | null> {
        const provider = this.getProvider();
        if (!provider) return null;
        return provider.fetchCredits();
    }

    getContent(): ContentResult | null {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return null;
        const editor = activeView.editor;
        return {
            text: editor.getSelection() || editor.getValue(),
            editor: editor,
            file: activeView.file!
        };
    }

    // ==================== FLASHCARD GENERATION ====================

    async generateFlashcards(options: GenerationOptions): Promise<void> {
        const content = this.getContent();
        if (!content) { new Notice("No active markdown note."); return; }
        if (content.text.trim().length < 50) { new Notice("⚠️ Content too short."); return; }
        if (!this.getProvider()) { return; }

        const usedModel = options.model || this.settings.model;
        const contextLimit = this.settings.modelContextLengths?.[usedModel] || 128000;
        const CHUNK_SIZE = Math.max(8000, Math.floor((contextLimit - 5000) * 3));

        const chunks: string[] = [];
        for (let i = 0; i < content.text.length; i += CHUNK_SIZE) {
            chunks.push(content.text.substring(i, i + CHUNK_SIZE));
        }

        new Notice(`🧠 Generating flashcards (${chunks.length} chunks)...`);
        const allCards: string[] = [];
        const basePrompt = this.buildFlashcardPrompt(options);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            new Notice(`🧠 Chunk ${i + 1}/${chunks.length}...`);

            let targetDivisor = 800;
            if (options.detailLevel === "1") targetDivisor = 2000;
            if (options.detailLevel === "2") targetDivisor = 1200;
            if (options.detailLevel === "4") targetDivisor = 500;
            if (options.detailLevel === "5") targetDivisor = 250;

            const target = Math.ceil(chunk.length / targetDivisor);
            const quantityInstruction = options.cardCount !== "Auto"
                ? `Generate EXACTLY ${Math.ceil(parseInt(options.cardCount) / chunks.length)} flashcards.`
                : `Generate roughly ${target} flashcards.`;

            const fcCustom = options.flashcardCustomInstructions
                ? `\n\n⚠️ IMPORTANT - USER CUSTOM INSTRUCTIONS (APPLY TO CONTENT, NOT FORMAT):\n${options.flashcardCustomInstructions}\n\nRemember: Apply these instructions to the CONTENT and STYLE of questions/answers, but ALWAYS keep the MANDATORY FORMAT above!`
                : "";
            const fullPrompt = `${basePrompt}\n\nQUANTITY: ${quantityInstruction}${fcCustom}`;
            const lang = this.settings.language || "German";

            try {
                const response = await this.fetchWithRetry({
                    model: options.model || this.settings.model,
                    messages: [
                        { role: "system", content: fullPrompt },
                        { role: "user", content: `TEXT:\n${chunk}\n\nOUTPUT IN ${lang.toUpperCase()}.` }
                    ]
                });

                const json = response.json;
                if (json.choices?.length > 0) {
                    let text = json.choices[0].message.content.trim();
                    text = text.replace(/^```markdown\s*/, "").replace(/```$/, "");
                    text = this.cleanLatexDelimiters(text);
                    if (text.length > 10) allCards.push(text);
                }
            } catch (err: any) {
                new Notice(`❌ Chunk ${i + 1} failed: ${err.message}`);
            }
        }

        if (allCards.length === 0) { new Notice("❌ No cards generated."); return; }

        const output = `\n\n---\n### 🧠 Flashcards (Level ${options.detailLevel})\n\n${allCards.join("\n\n")}\n\n`;

        if (options.saveLocation === "folder") {
            const tag = this.generateTag(content.file);
            const taggedOutput = `${tag}\n${output}`;
            await this.saveToFolder(content.file, taggedOutput, "Flashcards", "_Cards");
        } else {
            content.editor.replaceRange(output, content.editor.getCursor("to"));
            new Notice("✅ Flashcards generated!");
        }
    }

    buildFlashcardPrompt(options: GenerationOptions): string {
        const prompts = this.settings.advancedMode ? this.settings.flashcardPrompts : DEFAULT_FLASHCARD_PROMPTS;
        const cfg = prompts[options.detailLevel] || prompts["3"];
        const lang = this.settings.language || "German";

        const mcInstruction = options.multipleChoice
            ? `\n\n🔘 MULTIPLE CHOICE MODE (MANDATORY):
- Create multiple choice questions with EXACTLY ${options.choiceCount} options labeled A), B), C), D), E) as needed
- Put ALL choices in the QUESTION part
- Put ONLY the correct letter (e.g., "A" or "B") in the ANSWER part
- Make one option clearly correct, others plausible but wrong
- CRITICAL: RANDOMIZE which letter is correct! Do NOT always use A!
  - Vary answers across A, B, C, D roughly equally
  - Example: first card answer=C, second=A, third=D, fourth=B, etc.
- Example format:
What is 2+2?
A) 3
B) 4
C) 5
D) 6
?
B`
            : "";

        let format = options.cardStyle === "multi"
            ? `FORMAT (MANDATORY - DO NOT CHANGE):
Question text here
?
Answer text here

Another question
?
Another answer

CRITICAL FORMAT RULES:
- Each card has: question, then IMMEDIATELY a line with ONLY "?", then the answer
- NO blank line between question and "?" - they must be adjacent!
- Blank line ONLY between cards (after answer, before next question)
- The "?" on its own line is the SEPARATOR - this is required!
- NO "::" separator allowed when using this format
- NO "---" horizontal rules between cards!
- NO headers like "### Flashcards" or section titles!${mcInstruction}`
            : `FORMAT (MANDATORY - DO NOT CHANGE): Question::Answer
CRITICAL FORMAT RULES:
- One card per line using "::" as separator
- No intro/outro text
- NO "?" separator allowed when using this format`;

        const custom = this.settings.customInstructions ? `\nCUSTOM: ${this.settings.customInstructions}` : "";

        return `You are a strict flashcard generator.
GOAL: ${cfg.purpose}
DETAIL: ${cfg.detail}
LANGUAGE: ${lang}
MATH SUPPORT: Use Obsidian-compatible LaTeX (MathJax).
- Inline Math: $ a^2 + b^2 = c^2 $
- Block Math: $$ \\frac{a}{b} $$
- STRICTLY AVOID Typst syntax (no $ x "text" $ or #let).
- Do NOT USE \\[ ... \\] for math blocks!!! Use $$...$$ for math blocks or $...$ for inline math!!!
VISUAL STYLING:
- Use **bold** for key terms.

${format}

STYLE ADAPTATION:
1. First, analyze the Document Style. Is it Conceptual (explaining 'why'/'how') or Technical (formulas, proofs, calculations)?
2. If Conceptual: Focus flashcards on understanding, mechanisms, and cause-effect relationships. Avoid isolated formulas.
3. If Technical: Focus on formulas, conditions, and calculation steps.
4. "Leitfragen" / Example Questions: If present, use them as the GOLD STANDARD for card style. If the text asks "Explain the concept of...", do NOT generate a formula card for that concept.
5. Mimic the depth and tone of the source text.
${custom}
Output ONLY raw cards using the MANDATORY FORMAT above.`;
    }

    // ==================== SUMMARY GENERATION ====================

    async generateSummary(options: GenerationOptions): Promise<void> {
        const content = this.getContent();
        if (!content) { new Notice("No active markdown note."); return; }
        if (content.text.trim().length < 50) { new Notice("⚠️ Content too short."); return; }
        if (!this.getProvider()) { return; }

        const usedModel = options.model || this.settings.model;
        const contextLimit = this.settings.modelContextLengths?.[usedModel] || 128000;
        const CHUNK_SIZE = Math.max(10000, Math.floor((contextLimit - 4000) * 3));

        const chunks: string[] = [];
        for (let i = 0; i < content.text.length; i += CHUNK_SIZE) {
            chunks.push(content.text.substring(i, i + CHUNK_SIZE));
        }

        new Notice(`📝 Generating summary (${chunks.length} chunks)...`);
        const allSummaries: string[] = [];
        let previousSummary = "";
        const basePrompt = this.buildSummaryPrompt(options);
        const sumCustom = options.summaryCustomInstructions
            ? `\nCUSTOM INSTRUCTIONS: ${options.summaryCustomInstructions}`
            : "";

        for (let i = 0; i < chunks.length; i++) {
            new Notice(`📝 Chunk ${i + 1}/${chunks.length}...`);

            let userPrompt = "";
            if (previousSummary) {
                userPrompt += `<previous_context_do_not_output>\n${previousSummary}\n</previous_context_do_not_output>\n\n`;
            }
            userPrompt += `<new_text_to_summarize>\n${chunks[i]}\n</new_text_to_summarize>\n\n` +
                `INSTRUCTION: Summarize ONLY the content inside <new_text_to_summarize>. ` +
                `The <previous_context> is for continuity ONLY. Do not re-summarize it. ` +
                `OUTPUT IN ${this.settings.language.toUpperCase()}.`;

            try {
                const response = await this.fetchWithRetry({
                    model: options.model || this.settings.model,
                    messages: [
                        { role: "system", content: basePrompt + sumCustom },
                        { role: "user", content: userPrompt }
                    ]
                });

                const json = response.json;
                if (json.choices?.length > 0) {
                    let text = json.choices[0].message.content.trim();
                    text = text.replace(/^```markdown\s*/, "").replace(/```$/, "");
                    text = this.cleanLatexDelimiters(text);

                    if (text.length > 10) {
                        allSummaries.push(text);
                        previousSummary = text;
                    }
                }
            } catch (err: any) {
                new Notice(`❌ Chunk ${i + 1} failed: ${err.message}`);
            }
        }

        if (allSummaries.length === 0) { new Notice("❌ No summary generated."); return; }

        const finalSummary = allSummaries.join("\n\n---\n\n");
        const output = `\n\n---\n### 📝 Summary (Level ${options.detailLevel})\n\n${finalSummary}\n\n`;

        if (options.saveLocation === "folder") {
            await this.saveToFolder(content.file, output, "Summaries", "_Summary");
        } else {
            content.editor.replaceRange(output, content.editor.getCursor("to"));
            new Notice("✅ Summary generated!");
        }
    }

    // ==================== LEARNING ENVIRONMENT ====================

    async generateLearningEnvironment(options: GenerationOptions): Promise<void> {
        const content = this.getContent();
        if (!content) { new Notice("No active markdown note."); return; }
        if (content.text.trim().length < 50) { new Notice("⚠️ Content too short."); return; }
        if (!this.getProvider()) { return; }

        this.setStatus("Preparing...");

        const parentDir = content.file.parent?.path || "";
        const learningDir = `${parentDir}/Learning`;
        if (!(await this.app.vault.adapter.exists(learningDir))) {
            await this.app.vault.createFolder(learningDir);
        }

        // STEP 1: Generate Summary
        this.setStatus("Step 1/2: Summary...");
        new Notice(`📚 Step 1/2: Generating Summary (Level ${options.detailLevel})...`);

        const usedModel = options.model || this.settings.model;
        const contextLimit = this.settings.modelContextLengths?.[usedModel] || 128000;
        const CHUNK_SIZE = Math.max(10000, Math.floor((contextLimit - 4000) * 3));

        const chunks: string[] = [];
        for (let i = 0; i < content.text.length; i += CHUNK_SIZE) {
            chunks.push(content.text.substring(i, i + CHUNK_SIZE));
        }

        const allSummaries: string[] = [];
        let previousSummary = "";
        const summaryPrompt = this.buildSummaryPrompt(options);
        const envSummaryCustom = options.envSummaryCustomInstructions
            ? `\nCUSTOM INSTRUCTIONS: ${options.envSummaryCustomInstructions}`
            : "";

        for (let i = 0; i < chunks.length; i++) {
            this.setStatus(`Summary ${i + 1}/${chunks.length}...`);
            new Notice(`📝 Summary chunk ${i + 1}/${chunks.length}...`);

            let userPrompt = "";
            if (previousSummary) {
                userPrompt += `<previous_context_do_not_output>\n${previousSummary}\n</previous_context_do_not_output>\n\n`;
            }
            userPrompt += `<new_text_to_summarize>\n${chunks[i]}\n</new_text_to_summarize>\n\n` +
                `INSTRUCTION: Summarize ONLY the content inside <new_text_to_summarize>. ` +
                `The <previous_context> is for continuity ONLY. Do not re-summarize it. ` +
                `OUTPUT IN ${this.settings.language.toUpperCase()}.`;

            try {
                const response = await this.fetchWithRetry({
                    model: options.model || this.settings.model,
                    messages: [
                        { role: "system", content: summaryPrompt + envSummaryCustom },
                        { role: "user", content: userPrompt }
                    ]
                });
                const json = response.json;
                if (json.choices?.length > 0) {
                    let text = json.choices[0].message.content.trim();
                    text = text.replace(/^```markdown\s*/, "").replace(/```$/, "");
                    text = this.cleanLatexDelimiters(text);

                    if (text.length > 10) {
                        allSummaries.push(text);
                        previousSummary = text;
                    }
                }
            } catch (err: any) {
                new Notice(`❌ Summary chunk ${i + 1} failed: ${err.message}`);
            }
        }

        if (allSummaries.length === 0) {
            this.clearStatus();
            new Notice("❌ Failed to generate summary.");
            return;
        }

        const summary = allSummaries.join("\n\n");

        // Save summary
        this.setStatus("Saving summary...");
        const summaryPath = `${learningDir}/${content.file.basename}_Summary.md`;
        const summaryContent = `# Summary: ${content.file.basename}\nSource: [[${content.file.path}]]\nLevel: ${options.detailLevel}\n\n---\n\n${summary}`;
        await this.app.vault.create(summaryPath, summaryContent).catch(async () => {
            const file = this.app.vault.getAbstractFileByPath(summaryPath);
            if (file) await this.app.vault.modify(file as TFile, summaryContent);
        });
        new Notice(`✅ Summary saved!`);

        // STEP 2: Generate Flashcards from Summary
        this.setStatus("Step 2/2: Flashcards...");
        new Notice(`📚 Step 2/2: Generating Flashcards from Summary...`);

        const isMultiLine = options.cardStyle === 'multi';

        const envMcInstruction = options.envMultipleChoice
            ? `\n\n🔘 MULTIPLE CHOICE MODE (MANDATORY):
- Create multiple choice questions with EXACTLY ${options.envChoiceCount} options labeled A), B), C), D), E) as needed
- Put ALL choices in the QUESTION part
- Put ONLY the correct letter (e.g., "A" or "B") in the ANSWER part
- Make one option clearly correct, others plausible but wrong
- CRITICAL: RANDOMIZE which letter is correct! Do NOT always use A!
  - Vary answers across A, B, C, D roughly equally
  - Example: first card answer=C, second=A, third=D, fourth=B, etc.
- Example format:
What is 2+2?
A) 3
B) 4
C) 5
D) 6
?
B`
            : "";

        const flashcardPrompt = isMultiLine
            ? `You are a flashcard generator.

FORMAT (MANDATORY - DO NOT CHANGE):
The question text here
?
The answer text here

Another question
?
Another answer

CRITICAL FORMAT RULES:
- Each card has: question, then IMMEDIATELY a line with ONLY "?", then the answer
- NO blank line between question and "?" - they must be adjacent!
- Blank line ONLY between cards (after answer, before next question)
- The "?" on its own line is the SEPARATOR - this is REQUIRED!
- NO "::" separator allowed when using this format
- NO "---" horizontal rules between cards!
- NO headers like "### Flashcards" or section titles!
- NO labels like "Question:" or "Answer:"
- NO numbering
- STYLE ADAPTATION: Analyze the text. If it explains CONCEPTS, generate CONCEPTUAL cards (explain why/how). If it derives FORMULAS, generate MATH cards. If it has example questions, MIMIC THEIR STYLE exactly. Match the source text's depth.
- One fact per card
- Language: ${this.settings.language}
- MATH SUPPORT: Use MathJax (LaTeX). Inline: $...$, Block: $$...$$. NO Typst.
- Output ONLY cards using the MANDATORY FORMAT above, no other text${envMcInstruction}`
            : `You are a flashcard generator.

FORMAT (MANDATORY - DO NOT CHANGE): Question::Answer

Example:
What is X?::X is the definition here
What does Y do?::Y performs this function
Define Z::Z means this

CRITICAL FORMAT RULES:
- Format: question::answer (double colon separator)
- One card per line
- NO "?" separator allowed when using this format
- NO labels like "Question:" or "Answer:"
- NO numbering, NO bullet points
- STYLE ADAPTATION: Analyze the text. If it explains CONCEPTS, generate CONCEPTUAL cards (explain why/how). If it derives FORMULAS, generate MATH cards. If it has example questions, MIMIC THEIR STYLE exactly. Match the source text's depth.
- One fact per card
- Language: ${this.settings.language}
- MATH SUPPORT: Use MathJax (LaTeX). Inline: $...$, Block: $$...$$. NO Typst.
- VISUALS: Use **bold** for terms
- Output ONLY cards, no other text`;

        const envCustom = options.envCustomInstructions
            ? `\n\n⚠️ IMPORTANT - USER CUSTOM INSTRUCTIONS (APPLY TO CONTENT, NOT FORMAT):\n${options.envCustomInstructions}\n\nRemember: Apply these instructions to the CONTENT and STYLE of questions/answers, but ALWAYS keep the MANDATORY FORMAT above (use ? separator, never ::)!`
            : "";

        try {
            const response = await this.fetchWithRetry({
                model: options.model || this.settings.model,
                messages: [
                    { role: "system", content: flashcardPrompt + envCustom },
                    { role: "user", content: `SUMMARY:\n${summary}\n\nGenerate flashcards in ${this.settings.language.toUpperCase()}.` }
                ]
            });

            const json = response.json;
            if (json.choices?.length > 0) {
                let cards = json.choices[0].message.content.trim();
                cards = cards.replace(/^```markdown\s*/, "").replace(/```$/, "");
                cards = this.cleanLatexDelimiters(cards);

                this.setStatus("Saving flashcards...");
                const cardsPath = `${learningDir}/${content.file.basename}_Flashcards.md`;

                const tag = this.generateTag(content.file);
                const cardsContent = `${tag}\n# Flashcards: ${content.file.basename}\nSource: [[${content.file.path}]]\nGenerated from: [[${summaryPath}]]\n\n---\n\n${cards}`;
                await this.app.vault.create(cardsPath, cardsContent).catch(async () => {
                    const file = this.app.vault.getAbstractFileByPath(cardsPath);
                    if (file) await this.app.vault.modify(file as TFile, cardsContent);
                });
                this.clearStatus();
                new Notice(`✅ Learning Environment created!\n📁 ${learningDir}`);
            }
        } catch (err: any) {
            this.clearStatus();
            new Notice(`❌ Flashcard generation failed: ${err.message}`);
        }
    }

    buildSummaryPrompt(options: GenerationOptions): string {
        const prompts = this.settings.advancedMode ? this.settings.summaryPrompts : DEFAULT_SUMMARY_PROMPTS;
        const cfg = prompts[options.detailLevel] || prompts["3"];
        const lang = this.settings.language || "German";
        const custom = this.settings.customInstructions ? `\nCUSTOM: ${this.settings.customInstructions}` : "";

        return `You are an expert note summarizer.
GOAL: ${cfg.purpose}
DETAIL LEVEL: ${cfg.detail}
LANGUAGE: ${lang}
FORMAT: Use markdown with headers. Use MathJax (LaTeX) for math. DO NOT use Typst.
VISUALS:
- Use ==highlights== for key terms.
- Use **Mermaid Diagrams** (\`\`\`mermaid) for processes, flows, or hierarchies.
  IMPORTANT MERMAID RULES:
  1. Use the "Academic Blue" color scheme for ALL Mermaid diagrams:
     - Primary/Main color: #184a85 (dark blue) - use for main nodes, borders, arrows
     - Accent background: #f2f6fa (light blue-grey) - use for node fills
     - Result/highlight: #e6fffa (light cyan) - use for emphasized/result nodes
     - Text color: #1a1a1a (dark grey)
  2. CRITICAL SYNTAX RULES to prevent parsing errors:
     - NEVER use invisible/non-breaking spaces - use only standard spaces
     - Use standard spaces for indentation, NOT tabs or special whitespace
     - ALWAYS wrap node labels containing special characters in double quotes ""
      - Special characters that REQUIRE quotes: → ← ↔ ₂ ₃ ⁺ ⁻ ° ≠ ≤ ≥ ∞ ∝ _ etc.
      - Mermaid labels do NOT support LaTeX ($...$). Avoid LaTeX inside labels.
      - If you need Greek letters, use Unicode (e.g., "σ") inside quotes, or plain text (e.g., "sigma").
    - Prefer ASCII operators in labels (use ">=" instead of "≥", "<=" instead of "≤").
     - Example: D["Metall → Metall-Ionen + e⁻"] NOT D[Metall → Metall-Ionen + e⁻]
     - Mathematical operations like + or - in labels are misread without quotes
  3. Example with correct theming and syntax:
  \`\`\`mermaid
  %%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#f2f6fa', 'primaryBorderColor': '#184a85', 'primaryTextColor': '#1a1a1a', 'lineColor': '#184a85', 'secondaryColor': '#e6fffa', 'tertiaryColor': '#fff9e6'}}}%%
  graph LR
      A[Metall] --> B["Prozess mit O₂"]
      style A fill:#f2f6fa,stroke:#184a85
  \`\`\`
- Use **Markdown Tables** for comparisons.
Preserve important formulas and definitions.
LEITFRAGEN: If the text contains Leitfragen (guiding questions), include them in the summary under an appropriate heading.${custom}
Output ONLY the summary, no meta-commentary.`;
    }

    // ==================== UTILITIES ====================

    generateTag(file: TFile): string {
        const parent = file.parent ? file.parent.name : "root";
        const cleanParent = parent.replace(/\s+/g, '_');
        if (["Learning", "Flashcards", "misc", "Summaries"].includes(parent)) {
            const grandParent = file.parent?.parent ? file.parent.parent.name : "root";
            return `#flashcards/${grandParent.replace(/\s+/g, '_')}`;
        }
        return `#flashcards/${cleanParent}`;
    }

    async saveToFolder(sourceFile: TFile, content: string, folderName: string, suffix: string): Promise<void> {
        const parentDir = sourceFile.parent?.path || "";
        const targetDir = `${parentDir}/${folderName}`;
        if (!(await this.app.vault.adapter.exists(targetDir))) {
            await this.app.vault.createFolder(targetDir);
        }
        const targetPath = `${targetDir}/${sourceFile.basename}${suffix}.md`;

        if (await this.app.vault.adapter.exists(targetPath)) {
            const file = this.app.vault.getAbstractFileByPath(targetPath);
            if (file) {
                await this.app.vault.modify(file as TFile, (await this.app.vault.read(file as TFile)) + content);
                new Notice(`✅ Appended to: ${targetPath}`);
            }
        } else {
            await this.app.vault.create(targetPath, `# ${folderName}: ${sourceFile.basename}\nSource: [[${sourceFile.path}]]\n${content}`);
            new Notice(`✅ Created: ${targetPath}`);
        }
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    cleanLatexDelimiters(text: string): string {
        if (!text) return text;

        // Clean non-breaking spaces
        text = text.replace(/\u00A0/g, ' ');
        text = text.replace(/[\u2000-\u200B\u202F\u205F\u3000]/g, ' ');

        // Replace \[ content \] with $$ $$
        text = text.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (match, content) => {
            const trimmedContent = content.trim();
            return `$$\n${trimmedContent}\n$$`;
        });
        // Replace \( content \) with $ $
        text = text.replace(/\\\(\s*(.*?)\s*\\\)/g, (match, content) => {
            const trimmedContent = content.trim();
            return `$${trimmedContent}$`;
        });
        return text;
    }

    setStatus(text: string): void {
        if (this.statusBarItem) {
            this.statusBarItem.setText(text ? `🧠 ${text}` : '');
        }
    }

    clearStatus(): void {
        if (this.statusBarItem) {
            this.statusBarItem.setText('');
        }
    }
}
