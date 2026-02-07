/*
 * LEARNING ASSISTANT MODAL
 * Tabbed UI for flashcard, summary, and environment generation
 */

import { App, Modal, Setting, Notice } from "obsidian";
import AILearningAssistant, { GenerationOptions } from "./main";

type TabType = 'flashcards' | 'summary' | 'environment';

export class LearningAssistantModal extends Modal {
    plugin: AILearningAssistant;
    activeTab: TabType;
    options: GenerationOptions;

    constructor(app: App, plugin: AILearningAssistant, defaultTab: TabType = 'flashcards') {
        super(app);
        this.plugin = plugin;
        this.activeTab = defaultTab;
        this.options = {
            detailLevel: plugin.settings.defaultDetailLevel,
            cardCount: "Auto",
            saveLocation: plugin.settings.saveLocation,
            cardStyle: plugin.settings.cardStyle,
            model: plugin.settings.model,
            envCustomInstructions: "",
            envSummaryCustomInstructions: "",
            flashcardCustomInstructions: "",
            summaryCustomInstructions: "",
            multipleChoice: false,
            choiceCount: "4",
            envMultipleChoice: false,
            envChoiceCount: "4"
        };
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('ai-learning-modal');

        contentEl.createEl("h2", { text: "🧠 AI Learning Assistant" });

        // Tab bar
        const tabBar = contentEl.createDiv({ cls: "tab-bar" });
        tabBar.style.display = "flex";
        tabBar.style.gap = "0";
        tabBar.style.marginBottom = "16px";
        tabBar.style.borderBottom = "2px solid var(--background-modifier-border)";

        const flashcardsTab = tabBar.createEl("button", { text: "🎴 Flashcards" });
        const summaryTab = tabBar.createEl("button", { text: "📝 Summary" });
        const environmentTab = tabBar.createEl("button", { text: "📚 Learning Env" });

        [flashcardsTab, summaryTab, environmentTab].forEach(tab => {
            tab.style.padding = "8px 16px";
            tab.style.border = "none";
            tab.style.background = "transparent";
            tab.style.cursor = "pointer";
            tab.style.fontSize = "14px";
            tab.style.borderBottom = "2px solid transparent";
            tab.style.marginBottom = "-2px";
        });

        const contentDiv = contentEl.createDiv({ cls: "tab-content" });

        const setActiveTab = (tab: TabType): void => {
            this.activeTab = tab;
            if (tab === 'environment' && this.options.detailLevel !== "4") {
                this.options.detailLevel = "4";
            }
            flashcardsTab.style.borderBottomColor = tab === 'flashcards' ? 'var(--interactive-accent)' : 'transparent';
            flashcardsTab.style.color = tab === 'flashcards' ? 'var(--interactive-accent)' : '';
            summaryTab.style.borderBottomColor = tab === 'summary' ? 'var(--interactive-accent)' : 'transparent';
            summaryTab.style.color = tab === 'summary' ? 'var(--interactive-accent)' : '';
            environmentTab.style.borderBottomColor = tab === 'environment' ? 'var(--interactive-accent)' : 'transparent';
            environmentTab.style.color = tab === 'environment' ? 'var(--interactive-accent)' : '';
            this.renderTabContent(contentDiv);
        };

        flashcardsTab.onclick = () => setActiveTab('flashcards');
        summaryTab.onclick = () => setActiveTab('summary');
        environmentTab.onclick = () => setActiveTab('environment');

        setActiveTab(this.activeTab);
    }

    renderTabContent(container: HTMLElement): void {
        container.empty();

        // Model Selector
        const provider = this.plugin.getProvider();

        const modelSetting = new Setting(container)
            .setName("Model")
            .addDropdown(d => {
                const refreshOptions = (): void => {
                    const favorites = provider?.getFavorites ? provider.getFavorites() : [];
                    const currentVal = this.options.model;
                    d.selectEl.innerHTML = "";
                    if (!favorites.includes(currentVal)) {
                        d.addOption(currentVal, currentVal.split('/').pop() || currentVal);
                    }
                    favorites.forEach((f: string) => d.addOption(f, f.split('/').pop() || f));
                    d.setValue(currentVal);
                };

                refreshOptions();

                if (provider) {
                    d.selectEl.addEventListener('mousedown', refreshOptions);
                    d.onChange(async v => {
                        this.options.model = v;
                        this.plugin.settings.model = v;
                        await this.plugin.saveSettings();
                    });
                } else {
                    d.selectEl.title = "Manually set model in settings";
                }
            })
            .addButton(btn => {
                btn.setButtonText("Browse");
                if (provider) {
                    btn.onClick(() => {
                        provider.openModelSelector('ai-flashcards', (modelId: string) => {
                            this.options.model = modelId;
                            this.plugin.settings.model = modelId;
                            this.plugin.saveSettings();
                            this.renderTabContent(container);
                        });
                    });
                } else {
                    btn.setDisabled(true);
                    btn.setTooltip("Requires OpenRouter Provider plugin");
                }
            });

        // Balance display
        const descEl = modelSetting.descEl.createDiv({ cls: 'ai-balance-desc' });
        descEl.style.fontSize = '0.8em';
        descEl.style.color = 'var(--text-muted)';

        if (provider) {
            descEl.setText("Loading balance...");
            provider.fetchCredits().then((c: string | null) => {
                descEl.setText(c ? `Credits: $${c}` : 'Credits: ???');
            });
        } else {
            descEl.setText("⚠️ Standalone Mode");
            descEl.style.color = 'var(--text-warning)';
        }

        // Environment tab
        if (this.activeTab === 'environment') {
            container.createEl('p', {
                text: 'Creates a Summary → Flashcards pipeline. Both are saved to a Learning/ folder.',
                cls: 'setting-item-description'
            });

            this.renderSlider(container, "Summary Detail Level", "How detailed should the summary be? (Default: 4)");
            this.renderCardStyle(container);
            this.renderMultipleChoice(container, 'envMultipleChoice', 'envChoiceCount');
            this.renderAdvancedOptions(container, 'environment');
            this.renderGenerateButton(container, "📚 Create Learning Environment", () => {
                this.plugin.generateLearningEnvironment(this.options);
                this.close();
            });
            return;
        }

        // Standard tabs (Flashcards / Summary)
        this.renderSlider(container, "Detail Level", "1 = Brief → 5 = Exhaustive");

        new Setting(container)
            .setName("Save Location")
            .addDropdown(d => d
                .addOption("inline", "Inline")
                .addOption("folder", "Folder")
                .setValue(this.options.saveLocation)
                .onChange(v => this.options.saveLocation = v)
            );

        if (this.activeTab === 'flashcards') {
            this.renderCardStyle(container);
            this.renderMultipleChoice(container, 'multipleChoice', 'choiceCount');

            new Setting(container)
                .setName("Quantity Override")
                .setDesc("Leave 'Auto' or set specific number")
                .addText(t => t
                    .setPlaceholder("Auto")
                    .setValue(this.options.cardCount)
                    .onChange(v => this.options.cardCount = v || "Auto")
                );

            this.renderAdvancedOptions(container, 'flashcards');
        }

        if (this.activeTab === 'summary') {
            this.renderAdvancedOptions(container, 'summary');
        }

        this.renderGenerateButton(container,
            this.activeTab === 'flashcards' ? "🎴 Generate Flashcards" : "📝 Generate Summary",
            () => {
                if (this.activeTab === 'flashcards') {
                    this.plugin.generateFlashcards(this.options);
                } else {
                    this.plugin.generateSummary(this.options);
                }
                this.close();
            }
        );
    }

    private renderSlider(container: HTMLElement, name: string, desc: string): void {
        const sliderSetting = new Setting(container).setName(name).setDesc(desc);

        const sliderContainer = sliderSetting.controlEl.createDiv({ cls: "slider-container" });
        sliderContainer.style.display = "flex";
        sliderContainer.style.alignItems = "center";

        const levelLabel = sliderContainer.createEl("span", {
            text: this.getLevelLabel(this.options.detailLevel),
            cls: "level-label"
        });
        levelLabel.style.marginRight = "10px";
        levelLabel.style.fontWeight = "bold";
        levelLabel.style.minWidth = "100px";

        const slider = sliderContainer.createEl("input", {
            type: "range",
            attr: { min: "1", max: "5", step: "1" }
        }) as HTMLInputElement;
        slider.value = this.options.detailLevel;
        slider.style.width = "120px";
        slider.addEventListener("input", (e) => {
            this.options.detailLevel = (e.target as HTMLInputElement).value;
            levelLabel.textContent = this.getLevelLabel(this.options.detailLevel);
        });
    }

    private renderCardStyle(container: HTMLElement): void {
        new Setting(container)
            .setName("Card Style")
            .addDropdown(d => d
                .addOption("single", "Single-line (::)")
                .addOption("multi", "Multi-line (?)")
                .setValue(this.options.cardStyle)
                .onChange(v => this.options.cardStyle = v)
            );
    }

    private renderMultipleChoice(container: HTMLElement, toggleKey: 'multipleChoice' | 'envMultipleChoice', countKey: 'choiceCount' | 'envChoiceCount'): void {
        const mcContainer = container.createDiv({ cls: 'mc-options-container' });
        const choiceCountSetting = new Setting(mcContainer)
            .setName("Number of Choices")
            .setDesc("How many answer options per question")
            .addDropdown(d => d
                .addOption("2", "2")
                .addOption("3", "3")
                .addOption("4", "4")
                .addOption("5", "5")
                .setValue(this.options[countKey])
                .onChange(v => this.options[countKey] = v)
            );
        choiceCountSetting.settingEl.style.display = this.options[toggleKey] ? 'flex' : 'none';

        new Setting(container)
            .setName("🔘 Multiple Choice")
            .setDesc("Generate questions with A/B/C/D answer options")
            .addToggle(toggle => {
                toggle.setValue(this.options[toggleKey]);
                toggle.onChange(v => {
                    this.options[toggleKey] = v;
                    choiceCountSetting.settingEl.style.display = v ? 'flex' : 'none';
                });
            });
        container.appendChild(mcContainer);
    }

    private renderAdvancedOptions(container: HTMLElement, tab: 'flashcards' | 'summary' | 'environment'): void {
        const advancedContainer = container.createDiv({ cls: 'advanced-options-container' });
        const advancedContent = advancedContainer.createDiv({ cls: 'advanced-content' });
        advancedContent.style.display = 'none';
        advancedContent.style.marginTop = '8px';
        advancedContent.style.paddingLeft = '12px';
        advancedContent.style.borderLeft = '2px solid var(--interactive-accent)';

        new Setting(advancedContainer)
            .setName("⚙️ Advanced Options")
            .setDesc("Custom instructions for generation")
            .addToggle(toggle => {
                toggle.setValue(false);
                toggle.onChange(v => {
                    advancedContent.style.display = v ? 'block' : 'none';
                });
            });

        advancedContainer.appendChild(advancedContent);

        if (tab === 'environment') {
            // Summary custom instructions
            new Setting(advancedContent)
                .setName("Summary Custom Instructions")
                .setDesc("Optional: extra rules for summary generation.")
                .addTextArea(text => {
                    text.setPlaceholder("E.g., focus on formulas, ignore examples...")
                        .setValue(this.options.envSummaryCustomInstructions)
                        .onChange(v => this.options.envSummaryCustomInstructions = v || "");
                    text.inputEl.style.width = "100%";
                    text.inputEl.style.height = "60px";
                });

            // Flashcard custom instructions
            new Setting(advancedContent)
                .setName("Flashcard Custom Instructions")
                .setDesc("Optional: extra rules for flashcards (e.g., multiple-choice format).")
                .addTextArea(text => {
                    text.setPlaceholder("E.g., create multiple-choice questions with 4 options...")
                        .setValue(this.options.envCustomInstructions)
                        .onChange(v => this.options.envCustomInstructions = v || "");
                    text.inputEl.style.width = "100%";
                    text.inputEl.style.height = "60px";
                });
        } else if (tab === 'flashcards') {
            new Setting(advancedContent)
                .setName("Flashcard Custom Instructions")
                .setDesc("Optional: extra rules for flashcards.")
                .addTextArea(text => {
                    text.setPlaceholder("E.g., create multiple-choice questions with 4 options...")
                        .setValue(this.options.flashcardCustomInstructions)
                        .onChange(v => this.options.flashcardCustomInstructions = v || "");
                    text.inputEl.style.width = "100%";
                    text.inputEl.style.height = "60px";
                });
        } else if (tab === 'summary') {
            new Setting(advancedContent)
                .setName("Summary Custom Instructions")
                .setDesc("Optional: extra rules for summary generation.")
                .addTextArea(text => {
                    text.setPlaceholder("E.g., focus on formulas, ignore examples...")
                        .setValue(this.options.summaryCustomInstructions)
                        .onChange(v => this.options.summaryCustomInstructions = v || "");
                    text.inputEl.style.width = "100%";
                    text.inputEl.style.height = "60px";
                });
        }
    }

    private renderGenerateButton(container: HTMLElement, text: string, onClick: () => void): void {
        new Setting(container).addButton(b => b
            .setButtonText(text)
            .setCta()
            .onClick(onClick)
        );
    }

    getLevelLabel(level: string): string {
        const labels: { [key: string]: string } = {
            "1": "1 - Brief",
            "2": "2 - Basic",
            "3": "3 - Standard",
            "4": "4 - Detailed",
            "5": "5 - Exhaustive"
        };
        return labels[level] || "3 - Standard";
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
