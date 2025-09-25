# LaserPointer - Figma Clone

A modern Figma clone built with TypeScript, Next.js, and tldraw API featuring a bottom-aligned toolbar.

## Features

- **Canvas Drawing**: Full-featured drawing canvas powered by tldraw
- **Bottom Toolbar**: Clean, modern toolbar with essential tools
- **Drawing Tools**: Select, Draw, Rectangle, Ellipse, Arrow, Text, and Image tools
- **Actions**: Undo, Redo, Copy, and Delete functionality
- **Color Palette**: Quick color selection with preset colors
- **Responsive Design**: Modern UI with TailwindCSS
- **TypeScript**: Fully typed for better development experience

## Tools Available

- **Select Tool**: Select and manipulate objects
- **Draw Tool**: Freehand drawing
- **Rectangle Tool**: Create rectangular shapes
- **Ellipse Tool**: Create circular/oval shapes
- **Arrow Tool**: Create directional arrows
- **Text Tool**: Add text elements
- **Image Tool**: Insert images

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **tldraw** - Drawing canvas API
- **Lucide React** - Icons

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   └── page.tsx
└── components/
    ├── Canvas.tsx
    └── Toolbar.tsx
```

## Development

The project uses:
- Next.js App Router
- TypeScript for type safety
- TailwindCSS for styling
- tldraw for the drawing functionality
- Lucide React for icons

## License

MIT