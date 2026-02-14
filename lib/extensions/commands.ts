import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import type { SuggestionOptions } from '@tiptap/suggestion'
import type { Editor, Range } from '@tiptap/core'

export interface SlashCommand {
  title: string
  description: string
  icon: string
  aliases?: string[]
  command: (opts: { editor: Editor; range: Range }) => void
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    title: 'Testo',
    description: 'Paragrafo semplice',
    icon: '¶',
    aliases: ['p', 'para', 'testo', 'text'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: 'Titolo 1',
    description: 'Grande titolo di sezione',
    icon: 'H1',
    aliases: ['h1', 'heading1', 'titolo1'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: 'Titolo 2',
    description: 'Sottotitolo di sezione',
    icon: 'H2',
    aliases: ['h2', 'heading2', 'titolo2'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: 'Titolo 3',
    description: 'Titolo di paragrafo',
    icon: 'H3',
    aliases: ['h3', 'heading3', 'titolo3'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: 'Lista puntata',
    description: 'Lista con punti elenco',
    icon: '•',
    aliases: ['ul', 'bullet', 'lista', 'list'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Lista numerata',
    description: 'Lista con numeri progressivi',
    icon: '1.',
    aliases: ['ol', 'ordered', 'numerata', 'numbered'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Checklist',
    description: 'Lista di attività con caselle',
    icon: '☑',
    aliases: ['todo', 'task', 'check', 'checklist', 'attività'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: 'Citazione',
    description: 'Testo in evidenza come citazione',
    icon: '"',
    aliases: ['quote', 'blockquote', 'citazione'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    title: 'Codice',
    description: 'Blocco di codice con syntax highlighting',
    icon: '</>',
    aliases: ['code', 'codeblock', 'codice', 'snippet'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: 'Divisore',
    description: 'Linea orizzontale separatrice',
    icon: '—',
    aliases: ['hr', 'divider', 'separatore', 'rule', 'line'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: 'Immagine',
    description: 'Inserisci immagine da URL',
    icon: '🖼',
    aliases: ['img', 'image', 'immagine', 'foto', 'photo'],
    command: ({ editor, range }) => {
      const url = window.prompt('URL immagine:')
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
      }
    },
  },
]

export function filterCommands(query: string): SlashCommand[] {
  const q = query.toLowerCase().trim()
  if (!q) return SLASH_COMMANDS
  return SLASH_COMMANDS.filter(cmd =>
    cmd.title.toLowerCase().includes(q) ||
    cmd.aliases?.some(a => a.toLowerCase().includes(q))
  )
}

// ── Estensione Tiptap ────────────────────────────────────

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    slashCommands: Record<string, never>
  }
}

type SlashCommandsOptions = {
  suggestion: Omit<SuggestionOptions<SlashCommand>, 'editor'>
}

export const SlashCommandsExtension = Extension.create<SlashCommandsOptions>({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }: { query: string }) => filterCommands(query),
        command: ({ editor, range, props }: {
          editor: Editor
          range: Range
          props: SlashCommand
        }) => {
          props.command({ editor, range })
        },
        // render viene sovrascritta dal componente Editor
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
