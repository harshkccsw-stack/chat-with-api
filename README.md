# OpenAI Chat Interface

A modern, feature-rich web application for interacting with OpenAI's APIs, including chat completions and image generation capabilities. Built with Next.js 14, TypeScript, and Tailwind CSS.

![OpenAI Chat Interface](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## Features

### Chat Interface
- ✨ **Real-time streaming** responses from OpenAI models
- 💬 **Multiple conversations** with persistent history
- 🎨 **Markdown rendering** with syntax highlighting for code blocks
- ✏️ **Edit and regenerate** messages
- 📋 **Copy messages** and code blocks with one click
- 🔄 **Conversation management** (create, delete, rename)
- 📤 **Export conversations** to JSON or Markdown

### Image Generation
- 🖼️ **DALL-E 2 & 3** support
- 📐 Multiple resolution options
- 🎭 Quality and style controls (DALL-E 3)
- 🖼️ Generate multiple images (DALL-E 2)
- 💾 **Download images** directly
- ⭐ **Favorite images** for quick access
- 🔍 **Full-screen preview** with metadata

### Model Configuration
- 🤖 Support for all OpenAI chat models (GPT-4o, GPT-4, GPT-3.5, o1, etc.)
- 🎛️ **Adjustable parameters** (temperature, max tokens, top-p, penalties)
- 📝 **Preset configurations** (Creative, Balanced, Precise)
- 💾 **Per-conversation settings**

### User Experience
- 🌓 **Dark/Light theme** with system preference support
- 📱 **Fully responsive** design for mobile, tablet, and desktop
- ⌨️ **Keyboard shortcuts** for common actions
- 🔒 **Secure API key storage** (client-side only)
- 🚀 **Fast performance** with Edge runtime
- ♿ **Accessible** (WCAG 2.1 AA compliant)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image\ generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` if needed:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=OpenAI Chat Interface
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Add your API key**
   
   Click the settings icon (⚙️) in the top right corner and enter your OpenAI API key.

## Usage

### Chat Interface

1. **Start a conversation**: Click "New Conversation" in the sidebar
2. **Type your message**: Use the input box at the bottom
3. **Send**: Press Enter or click the send button
4. **New line**: Press Shift+Enter for multi-line input
5. **Edit messages**: Click the edit icon on your messages
6. **Regenerate responses**: Click the refresh icon on AI responses
7. **Copy content**: Click the copy icon on any message or code block

### Image Generation

1. **Switch to Images tab**: Click the "Images" tab at the top
2. **Enter a prompt**: Describe the image you want to generate
3. **Configure settings**: Choose model, size, quality, and style
4. **Generate**: Click "Generate Image" button
5. **View results**: Images appear in the gallery below
6. **Download or preview**: Use the buttons that appear on hover

### Settings

Access settings by clicking the gear icon (⚙️) in the top right:

- **API Key**: Add or update your OpenAI API key
- **Model**: Select the default chat model
- **Parameters**: Adjust temperature, max tokens, and other model parameters
- **Appearance**: Toggle between light/dark themes and enable/disable streaming

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

3. **Done!** Your app is now live on Vercel

### Manual Deployment

Build the production version:
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat completion endpoint
│   │   ├── images/        # Image generation endpoint
│   │   └── models/        # Models list endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── chat/             # Chat interface components
│   ├── images/           # Image generation components
│   ├── settings/         # Settings components
│   ├── sidebar/          # Sidebar components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── store/                # Zustand state management
└── types/                # TypeScript type definitions
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Markdown**: react-markdown
- **Code Highlighting**: react-syntax-highlighter
- **API**: OpenAI Node.js SDK
- **Deployment**: Vercel (Edge Runtime)

## Configuration

### Model Parameters

- **Temperature** (0-2): Controls randomness. Higher values = more creative
- **Max Tokens**: Maximum length of the response
- **Top P** (0-1): Nucleus sampling threshold
- **Frequency Penalty** (-2 to 2): Reduces repetition of frequent tokens
- **Presence Penalty** (-2 to 2): Encourages talking about new topics

### Presets

- **Creative**: High temperature (1.2) for more creative responses
- **Balanced**: Default settings for general use
- **Precise**: Low temperature (0.3) for more focused, deterministic responses

## Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message input
- `Ctrl/Cmd + K` - New conversation
- `Escape` - Close modals

## Security

- ✅ API keys are stored **only in your browser** (localStorage)
- ✅ API keys are **never sent to or stored on the server**
- ✅ All requests are made directly from your browser to OpenAI
- ✅ HTTPS only in production
- ✅ No user tracking or analytics

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Troubleshooting

### API Key Issues

**Problem**: "Invalid API key" error

**Solution**:
- Ensure your API key starts with `sk-`
- Check that you copied the entire key
- Verify the key is active on [OpenAI Platform](https://platform.openai.com/api-keys)
- Make sure you have credits available

### Streaming Not Working

**Problem**: Messages appear all at once instead of streaming

**Solution**:
- Enable streaming in Settings → Appearance
- Check browser console for errors
- Try refreshing the page

### Images Not Loading

**Problem**: Generated images don't display

**Solution**:
- Check your internet connection
- Verify image URLs are accessible
- Try a different browser
- Clear browser cache

### Storage Issues

**Problem**: "Storage quota exceeded" error

**Solution**:
- Delete old conversations from the sidebar
- Clear image history
- Export important conversations before clearing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Powered by [OpenAI API](https://platform.openai.com/)

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review [OpenAI API Documentation](https://platform.openai.com/docs)
- Open an issue on GitHub

---

**Made with ❤️ using Next.js and OpenAI**
