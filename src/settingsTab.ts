/*
 * AI LEARNING SETTINGS TAB
 * Settings UI with tabs for general, flashcard prompts, summary prompts
 */

import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import AILearningAssistant, { DEFAULT_FLASHCARD_PROMPTS, DEFAULT_SUMMARY_PROMPTS, PromptSet } from "./main";

type SettingsTabType = 'general' | 'flashcards' | 'summary';

export class AILearningSettingTab extends PluginSettingTab {
    plugin: AILearningAssistant;
    activeTab: SettingsTabType;

    constructor(app: App, plugin: AILearningAssistant) {
        super(app, plugin);
        this.plugin = plugin;
        this.activeTab = 'general';
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: '🧠 AI Learning Assistant' });

        // Tab bar
        const tabBar = containerEl.createDiv({ cls: "settings-tab-bar" });
        tabBar.style.display = "flex";
        tabBar.style.gap = "0";
        tabBar.style.marginBottom = "16px";
        tabBar.style.borderBottom = "2px solid var(--background-modifier-border)";

        const tabs: { id: SettingsTabType; label: string }[] = [
            { id: 'general', label: '⚙️ General' },
            { id: 'flashcards', label: '🎴 Flashcard Prompts' },
            { id: 'summary', label: '📝 Summary Prompts' }
        ];

        const tabButtons: { [key: string]: HTMLButtonElement } = {};
        tabs.forEach(tab => {
            const btn = tabBar.createEl("button", { text: tab.label });
            btn.style.padding = "8px 16px";
            btn.style.border = "none";
            btn.style.background = "transparent";
            btn.style.cursor = "pointer";
            btn.style.fontSize = "14px";
            btn.style.borderBottom = "2px solid transparent";
            btn.style.marginBottom = "-2px";
            tabButtons[tab.id] = btn;

            btn.onclick = () => {
                this.activeTab = tab.id;
                this.updateTabStyles(tabButtons);
                this.renderTabContent(contentDiv);
            };
        });

        const contentDiv = containerEl.createDiv({ cls: "settings-tab-content" });
        contentDiv.style.marginTop = "16px";

        this.updateTabStyles(tabButtons);
        this.renderTabContent(contentDiv);
    }

    updateTabStyles(tabButtons: { [key: string]: HTMLButtonElement }): void {
        Object.entries(tabButtons).forEach(([id, btn]) => {
            btn.style.borderBottomColor = id === this.activeTab ? 'var(--interactive-accent)' : 'transparent';
            btn.style.color = id === this.activeTab ? 'var(--interactive-accent)' : '';
        });
    }

    renderTabContent(container: HTMLElement): void {
        container.empty();

        switch (this.activeTab) {
            case 'general':
                this.renderGeneralTab(container);
                break;
            case 'flashcards':
                this.renderPromptsTab(container, 'flashcardPrompts', 'Flashcard', DEFAULT_FLASHCARD_PROMPTS);
                break;
            case 'summary':
                this.renderPromptsTab(container, 'summaryPrompts', 'Summary', DEFAULT_SUMMARY_PROMPTS);
                break;
        }
    }

    renderGeneralTab(container: HTMLElement): void {
        const provider = this.plugin.getProvider();

        if (provider) {
            // === PROVIDER MODE ===
            container.createEl('h3', { text: '🔌 OpenRouter Provider' });

            const balanceEl = container.createDiv({ cls: 'setting-item-description' });
            balanceEl.style.marginBottom = '10px';
            balanceEl.style.fontWeight = 'bold';
            balanceEl.style.color = 'var(--text-accent)';
            balanceEl.setText("Checking balance...");
            this.plugin.fetchCredits().then(credit => {
                balanceEl.setText(credit ? `💳 Balance: $${credit}` : "💳 Balance: Unknown");
            });

            new Setting(container)
                .setName('Configure API Key')
                .setDesc('Open the OpenRouter Provider settings to manage your API key.')
                .addButton(b => b
                    .setButtonText('Open Provider Settings')
                    .onClick(() => {
                        (this.app as any).setting.open();
                        (this.app as any).setting.openTabById('openrouter-provider');
                    }));

            container.createEl('h3', { text: '🤖 Model' });

            new Setting(container)
                .setName('Default Model')
                .setDesc(`Current: ${this.plugin.settings.model}`)
                .addButton(b => b
                    .setButtonText("Select Model")
                    .onClick(() => {
                        provider.openModelSelector('ai-flashcards', () => {
                            this.plugin.settings.model = provider.getModel('ai-flashcards');
                            this.plugin.saveSettings();
                            this.display();
                        });
                    }));

        } else {
            // === STANDALONE MODE ===
            container.createEl('h3', { text: '🔌 API Configuration (Standalone)' });

            const warning = container.createDiv({ cls: 'setting-item-description' });
            warning.style.color = 'var(--text-error)';
            warning.style.fontWeight = 'bold';
            warning.style.marginBottom = '15px';
            warning.innerHTML = "⚠️ Works best with <b>OpenRouter Provider</b> plugin.<br>You are currently in standalone mode.";

            new Setting(container)
                .setName('OpenRouter API Key')
                .setDesc('Enter your OpenRouter API key here.')
                .addText(t => t
                    .setPlaceholder('sk-or-...')
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async v => {
                        this.plugin.settings.apiKey = v;
                        await this.plugin.saveSettings();
                    }));

            new Setting(container)
                .setName('Model ID')
                .setDesc('Manually enter the model ID (e.g., google/gemini-2.0-flash-exp:free)')
                .addText(t => t
                    .setPlaceholder('provider/model-name')
                    .setValue(this.plugin.settings.model)
                    .onChange(async v => {
                        this.plugin.settings.model = v;
                        await this.plugin.saveSettings();
                    }));
        }

        new Setting(container)
            .setName('Target Language')
            .addText(t => t
                .setValue(this.plugin.settings.language)
                .onChange(async v => { this.plugin.settings.language = v; await this.plugin.saveSettings(); }));

        // Defaults
        container.createEl('h3', { text: '⚙️ Defaults' });

        new Setting(container)
            .setName('Default Detail Level')
            .addDropdown(d => d
                .addOption("1", "1 - Brief")
                .addOption("2", "2 - Basic")
                .addOption("3", "3 - Standard")
                .addOption("4", "4 - Detailed")
                .addOption("5", "5 - Exhaustive")
                .setValue(this.plugin.settings.defaultDetailLevel)
                .onChange(async v => { this.plugin.settings.defaultDetailLevel = v; await this.plugin.saveSettings(); }));

        new Setting(container)
            .setName('Default Card Style')
            .addDropdown(d => d
                .addOption("single", "Single-line (::)")
                .addOption("multi", "Multi-line (?)")
                .setValue(this.plugin.settings.cardStyle)
                .onChange(async v => { this.plugin.settings.cardStyle = v; await this.plugin.saveSettings(); }));

        new Setting(container)
            .setName('Default Save Location')
            .addDropdown(d => d
                .addOption("inline", "Inline")
                .addOption("folder", "Folder")
                .setValue(this.plugin.settings.saveLocation)
                .onChange(async v => { this.plugin.settings.saveLocation = v; await this.plugin.saveSettings(); }));

        new Setting(container)
            .setName('Global Custom Instructions')
            .setDesc('Applied to all AI requests')
            .addTextArea(text => {
                text.setPlaceholder('Extra rules for all prompts...')
                    .setValue(this.plugin.settings.customInstructions)
                    .onChange(async v => { this.plugin.settings.customInstructions = v; await this.plugin.saveSettings(); });
                text.inputEl.style.width = "100%";
                text.inputEl.style.height = "80px";
            });
    }

    renderPromptsTab(container: HTMLElement, settingKey: 'flashcardPrompts' | 'summaryPrompts', label: string, defaults: PromptSet): void {
        container.createEl('h3', { text: `${label} Prompt Customization` });
        container.createEl('p', {
            text: 'Customize what the AI is told at each detail level.',
            cls: 'setting-item-description'
        });

        for (let level = 1; level <= 5; level++) {
            const key = String(level);
            const prompts = this.plugin.settings[settingKey]?.[key] || defaults[key];
            const levelNames = ["", "Brief", "Basic", "Standard", "Detailed", "Exhaustive"];

            const levelHeader = container.createDiv();
            levelHeader.style.marginTop = "16px";
            levelHeader.style.marginBottom = "8px";
            levelHeader.style.fontWeight = "bold";
            levelHeader.style.fontSize = "14px";
            levelHeader.textContent = `Level ${level}: ${levelNames[level]}`;

            new Setting(container)
                .setName('Goal')
                .setDesc('What the AI should accomplish')
                .addTextArea(text => {
                    text.setValue(prompts.purpose)
                        .onChange(async v => {
                            if (!this.plugin.settings[settingKey]) {
                                this.plugin.settings[settingKey] = JSON.parse(JSON.stringify(defaults));
                            }
                            if (!this.plugin.settings[settingKey][key]) {
                                this.plugin.settings[settingKey][key] = { ...defaults[key] };
                            }
                            this.plugin.settings[settingKey][key].purpose = v;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = "100%";
                    text.inputEl.style.height = "40px";
                });

            new Setting(container)
                .setName('Detail Guidance')
                .setDesc('How thoroughly to process content')
                .addTextArea(text => {
                    text.setValue(prompts.detail)
                        .onChange(async v => {
                            if (!this.plugin.settings[settingKey]) {
                                this.plugin.settings[settingKey] = JSON.parse(JSON.stringify(defaults));
                            }
                            if (!this.plugin.settings[settingKey][key]) {
                                this.plugin.settings[settingKey][key] = { ...defaults[key] };
                            }
                            this.plugin.settings[settingKey][key].detail = v;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = "100%";
                    text.inputEl.style.height = "40px";
                });
        }

        // Reset button
        new Setting(container)
            .addButton(btn => btn
                .setButtonText(`Reset ${label} Prompts to Defaults`)
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings[settingKey] = JSON.parse(JSON.stringify(defaults));
                    await this.plugin.saveSettings();
                    new Notice(`✅ ${label} prompts reset`);
                    this.renderTabContent(container.parentElement?.querySelector('.settings-tab-content') as HTMLElement || container);
                }));
    }
}
