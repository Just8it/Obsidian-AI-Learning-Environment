/*
 * AI LEARNING SETTINGS TAB
 * Professional settings UI with sections and collapsible prompts
 */

import { App, PluginSettingTab, Setting, Notice, setIcon } from "obsidian";
import AILearningAssistant, { DEFAULT_FLASHCARD_PROMPTS, DEFAULT_SUMMARY_PROMPTS, PromptSet } from "./main";

export class AILearningSettingTab extends PluginSettingTab {
    plugin: AILearningAssistant;

    constructor(app: App, plugin: AILearningAssistant) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('ai-learning-settings');

        // ===== HEADER =====
        containerEl.createEl('h2', { text: 'AI Learning Assistant' });

        // ===== PROVIDER STATUS =====
        const provider = this.plugin.getProvider();

        if (provider) {
            // Balance display
            const balanceContainer = containerEl.createDiv({ cls: 'ai-settings-balance' });
            balanceContainer.setText("Checking balance...");
            this.plugin.fetchCredits().then(c => {
                balanceContainer.empty();
                const icon = balanceContainer.createSpan({ cls: 'ai-balance-icon' });
                setIcon(icon, 'wallet');
                balanceContainer.createSpan({ text: c ? `Balance: $${c}` : "Balance: Unknown" });
            });

            // Provider section
            this.createSection(containerEl, 'Provider', 'plug', () => {
                const content = containerEl.createDiv({ cls: 'ai-settings-section-content' });

                const row = content.createDiv({ cls: 'ai-settings-row' });
                const left = row.createDiv({ cls: 'ai-settings-row-info' });
                const statusIcon = left.createSpan({ cls: 'ai-status-icon connected' });
                setIcon(statusIcon, 'check-circle');
                left.createSpan({ text: 'OpenRouter Provider', cls: 'ai-settings-row-name' });

                const right = row.createDiv({ cls: 'ai-settings-row-action' });
                const btn = right.createEl('button', { text: 'Open Provider Settings', cls: 'mod-cta' });
                btn.addEventListener('click', () => {
                    (this.app as any).setting.open();
                    (this.app as any).setting.openTabById('openrouter-provider');
                });
            });
        } else {
            // Standalone mode warning
            const warningDiv = containerEl.createDiv({ cls: 'ai-settings-warning' });
            const icon = warningDiv.createSpan({ cls: 'ai-warning-icon' });
            setIcon(icon, 'alert-triangle');
            warningDiv.createSpan({ text: 'Standalone Mode - Install OpenRouter Provider for best experience' });

            // API Key input
            new Setting(containerEl)
                .setName('OpenRouter API Key')
                .setDesc('Enter your OpenRouter API key')
                .addText(t => t
                    .setPlaceholder('sk-or-...')
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async v => {
                        this.plugin.settings.apiKey = v;
                        await this.plugin.saveSettings();
                    }));
        }

        // ===== MODEL SELECTION =====
        this.createSection(containerEl, 'Model', 'cpu', () => {
            const content = containerEl.createDiv({ cls: 'ai-settings-section-content' });

            const row = content.createDiv({ cls: 'ai-settings-row' });
            const left = row.createDiv({ cls: 'ai-settings-row-info' });
            left.createSpan({ text: 'Current Model', cls: 'ai-settings-row-name' });
            const modelName = this.plugin.settings.model.split('/').pop() || this.plugin.settings.model;
            left.createSpan({ text: modelName, cls: 'ai-settings-row-value' });

            if (provider) {
                const right = row.createDiv({ cls: 'ai-settings-row-action' });
                const btn = right.createEl('button', { text: 'Select Model' });
                btn.addEventListener('click', () => {
                    provider.openModelSelector('ai-flashcards', () => {
                        this.plugin.settings.model = provider.getModel('ai-flashcards');
                        this.plugin.saveSettings();
                        this.display();
                    });
                });
            }

            // Language setting
            const langRow = content.createDiv({ cls: 'ai-settings-row' });
            const langLeft = langRow.createDiv({ cls: 'ai-settings-row-info' });
            langLeft.createSpan({ text: 'Output Language', cls: 'ai-settings-row-name' });

            const langRight = langRow.createDiv({ cls: 'ai-settings-row-action' });
            const langInput = langRight.createEl('input', {
                type: 'text',
                value: this.plugin.settings.language,
                cls: 'ai-settings-input'
            });
            langInput.addEventListener('change', async () => {
                this.plugin.settings.language = langInput.value;
                await this.plugin.saveSettings();
            });
        });

        // ===== DEFAULTS =====
        this.createSection(containerEl, 'Defaults', 'settings', () => {
            const content = containerEl.createDiv({ cls: 'ai-settings-section-content' });

            // Detail Level
            new Setting(content)
                .setName('Detail Level')
                .addDropdown(d => d
                    .addOption("1", "1 - Brief")
                    .addOption("2", "2 - Basic")
                    .addOption("3", "3 - Standard")
                    .addOption("4", "4 - Detailed")
                    .addOption("5", "5 - Exhaustive")
                    .setValue(this.plugin.settings.defaultDetailLevel)
                    .onChange(async v => {
                        this.plugin.settings.defaultDetailLevel = v;
                        await this.plugin.saveSettings();
                    }));

            // Card Style
            new Setting(content)
                .setName('Card Style')
                .addDropdown(d => d
                    .addOption("single", "Single-line (::)")
                    .addOption("multi", "Multi-line (?)")
                    .setValue(this.plugin.settings.cardStyle)
                    .onChange(async v => {
                        this.plugin.settings.cardStyle = v;
                        await this.plugin.saveSettings();
                    }));

            // Save Location
            new Setting(content)
                .setName('Save Location')
                .addDropdown(d => d
                    .addOption("inline", "Inline")
                    .addOption("folder", "Folder")
                    .setValue(this.plugin.settings.saveLocation)
                    .onChange(async v => {
                        this.plugin.settings.saveLocation = v;
                        await this.plugin.saveSettings();
                    }));
        });

        // ===== CUSTOM INSTRUCTIONS =====
        this.createCollapsibleSection(containerEl, 'Custom Instructions', 'edit-3', false, () => {
            const content = containerEl.createDiv({ cls: 'ai-settings-section-content' });

            new Setting(content)
                .setName('Global Instructions')
                .setDesc('Applied to all AI requests')
                .addTextArea(text => {
                    text.setPlaceholder('Extra rules for all prompts...')
                        .setValue(this.plugin.settings.customInstructions)
                        .onChange(async v => {
                            this.plugin.settings.customInstructions = v;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = "100%";
                    text.inputEl.style.height = "80px";
                });
        });

        // ===== FLASHCARD PROMPTS =====
        this.createCollapsibleSection(containerEl, 'Flashcard Prompts', 'layers', false, () => {
            const content = containerEl.createDiv({ cls: 'ai-settings-section-content' });
            this.renderPromptsEditor(content, 'flashcardPrompts', DEFAULT_FLASHCARD_PROMPTS);
        });

        // ===== SUMMARY PROMPTS =====
        this.createCollapsibleSection(containerEl, 'Summary Prompts', 'file-text', false, () => {
            const content = containerEl.createDiv({ cls: 'ai-settings-section-content' });
            this.renderPromptsEditor(content, 'summaryPrompts', DEFAULT_SUMMARY_PROMPTS);
        });
    }

    private createSection(container: HTMLElement, title: string, icon: string, buildContent: () => void): void {
        const section = container.createDiv({ cls: 'ai-settings-section' });
        const header = section.createDiv({ cls: 'ai-settings-section-header' });
        const iconEl = header.createSpan({ cls: 'ai-settings-section-icon' });
        setIcon(iconEl, icon);
        header.createSpan({ text: title });
        buildContent();
    }

    private createCollapsibleSection(container: HTMLElement, title: string, icon: string, openByDefault: boolean, buildContent: () => void): void {
        const section = container.createDiv({ cls: 'ai-settings-section ai-collapsible' });
        if (openByDefault) section.addClass('open');

        const header = section.createDiv({ cls: 'ai-settings-section-header clickable' });
        const iconEl = header.createSpan({ cls: 'ai-settings-section-icon' });
        setIcon(iconEl, icon);
        header.createSpan({ text: title });
        const chevron = header.createSpan({ cls: 'ai-chevron' });
        setIcon(chevron, 'chevron-down');

        const contentWrapper = section.createDiv({ cls: 'ai-collapsible-content' });

        header.addEventListener('click', () => {
            section.toggleClass('open', !section.hasClass('open'));
        });

        // Build content inside wrapper
        buildContent();
        const lastChild = container.lastElementChild;
        if (lastChild && lastChild !== section) {
            contentWrapper.appendChild(lastChild);
        }
    }

    private renderPromptsEditor(container: HTMLElement, settingKey: 'flashcardPrompts' | 'summaryPrompts', defaults: PromptSet): void {
        const levelNames = ["", "Brief", "Basic", "Standard", "Detailed", "Exhaustive"];

        for (let level = 1; level <= 5; level++) {
            const key = String(level);
            const prompts = this.plugin.settings[settingKey]?.[key] || defaults[key];

            const levelDiv = container.createDiv({ cls: 'ai-prompt-level' });
            levelDiv.createDiv({ text: `Level ${level}: ${levelNames[level]}`, cls: 'ai-prompt-level-title' });

            new Setting(levelDiv)
                .setName('Goal')
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

            new Setting(levelDiv)
                .setName('Detail Guidance')
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
        const btnContainer = container.createDiv({ cls: 'ai-settings-btn-container' });
        const resetBtn = btnContainer.createEl('button', {
            text: 'Reset to Defaults',
            cls: 'mod-warning'
        });
        resetBtn.addEventListener('click', async () => {
            this.plugin.settings[settingKey] = JSON.parse(JSON.stringify(defaults));
            await this.plugin.saveSettings();
            new Notice('Prompts reset to defaults');
            this.display();
        });
    }
}
