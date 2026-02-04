# AI Learning Assistant (Flashcards)

An Obsidian plugin that uses AI to generate flashcards, summaries, and complete learning environments from your notes.

## Features

- **Flashcard Generation**: Automatically create Anki-compatible flashcards from lecture notes
- **Smart Summaries**: Generate structured summaries with customizable detail levels
- **Learning Environments**: Create complete study materials (Summary + Flashcards) in one action
- **Mermaid Diagrams**: AI generates visual diagrams for complex concepts
- **LaTeX Support**: Proper handling of mathematical formulas
- **OpenRouter Integration**: Use any AI model via OpenRouter

## Installation

1. Download the latest release
2. Extract to `.obsidian/plugins/ai-flashcards/`
3. Enable the plugin in Obsidian settings
4. Configure your OpenRouter API key (or use OpenRouter Provider plugin)

## Usage

### Generate Flashcards

1. Open a note with lecture content
2. Command palette: `AI Learning Assistant: Generate Flashcards`
3. Configure options (model, detail level, save location)
4. Flashcards are saved in markdown format compatible with Anki/Spaced Repetition plugins

### Generate Summary

1. Open a note
2. Command palette: `AI Learning Assistant: Generate Summary`
3. Choose detail level (1-5)
4. Summary is inserted or saved to a subfolder

### Learning Environment

Combines both: generates a summary first, then creates flashcards from the summary.

## Configuration

- **Model**: Select your preferred AI model
- **Language**: Output language (German, English, etc.)
- **Detail Level**: 1 (brief) to 5 (comprehensive)
- **Save Location**: Inline or to dedicated folders

## Integration

Works seamlessly with:

- **OpenRouter Provider**: Shared API key and model management
- **Spaced Repetition plugins**: Anki-compatible flashcard format

## License

MIT License - see [LICENSE](LICENSE) for details.
