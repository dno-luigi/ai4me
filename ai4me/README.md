# AI4ME Chat Interface

A modern, feature-rich chat interface for AI communication using OpenRouter's API.

## Features

- **Multiple Theme Options**: 7 theme options including Dark Purple and Dark Blue
- **Customizable Interface**: Adjustable text size, button styles, and accent colors
- **Code Block Copy**: Easily copy code with hover-to-reveal copy buttons
- **History Management**: Export conversations as text or JSON
- **Text-to-Speech**: Read AI responses aloud with toggle controls
- **AI Control Commands**: The AI can modify themes, colors, and UI elements
- **Context Awareness**: AI maintains conversation context for more relevant responses

## AI Control Commands

The AI has special control commands to customize the experience:

- **System Prompts**: `[[SYSTEM:your new prompt]]`
- **Response Instructions**: `[[RESPOND:your new instructions]]`
- **Notes**: `[[NOTE:your note content]]`
- **Theme**: `[[THEME:theme_name]]` (dark-mode, light-mode, green-mode, blue-mode, purple-mode, darkblue-mode, darkpurple-mode)
- **Text Size**: `[[TEXT_SIZE:size]]` (12-28px)
- **Accent Color**: `[[COLOR:color_name]]` (blue, green, red, yellow, purple, pink, cyan, teal, or hex code)
- **Button Styles**: `[[BUTTONS:{"size":"small/medium/large","icons":{"copy":"fa-clone","read":"fa-headphones"}}]]`

## Getting Started

1. Get an API key from [OpenRouter](https://openrouter.ai)
2. Click the settings button (⚙️) in the top-left
3. Enter your OpenRouter API key
4. Select an AI model from the dropdown
5. Save settings and start chatting!
