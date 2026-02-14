import type { JSONContent } from '@tiptap/react'

// Converte un documento Tiptap (JSON) in testo Markdown

export function toMarkdown(doc: JSONContent): string {
  if (!doc.content) return ''
  return doc.content.map(node => nodeToMd(node)).join('\n')
}

function nodeToMd(node: JSONContent, indent = 0): string {
  switch (node.type) {
    case 'paragraph':
      return inlineToMd(node) + '\n'

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      return '#'.repeat(level) + ' ' + inlineToMd(node) + '\n'
    }

    case 'bulletList':
      return (node.content ?? [])
        .map(item => bulletItem(item, indent))
        .join('')

    case 'orderedList': {
      let i = (node.attrs?.start as number) ?? 1
      return (node.content ?? [])
        .map(item => {
          const line = `${' '.repeat(indent)}${i++}. ${listItemContent(item, indent + 3)}`
          return line
        })
        .join('')
    }

    case 'taskList':
      return (node.content ?? [])
        .map(item => {
          const checked = item.attrs?.checked ? '[x]' : '[ ]'
          const content = listItemContent(item, indent + 6)
          return `${' '.repeat(indent)}- ${checked} ${content}`
        })
        .join('')

    case 'blockquote':
      return (node.content ?? [])
        .map(child => '> ' + nodeToMd(child, indent))
        .join('')

    case 'codeBlock': {
      const lang = (node.attrs?.language as string) ?? ''
      const code = (node.content ?? [])
        .map(n => n.text ?? '')
        .join('')
      return '```' + lang + '\n' + code + '\n```\n'
    }

    case 'horizontalRule':
      return '---\n'

    case 'image': {
      const src = (node.attrs?.src as string) ?? ''
      const alt = (node.attrs?.alt as string) ?? ''
      return `![${alt}](${src})\n`
    }

    case 'hardBreak':
      return '  \n'

    default:
      return inlineToMd(node) + '\n'
  }
}

function bulletItem(item: JSONContent, indent: number): string {
  const content = listItemContent(item, indent + 2)
  return `${' '.repeat(indent)}- ${content}`
}

function listItemContent(item: JSONContent, indent: number): string {
  if (!item.content) return '\n'
  const [first, ...rest] = item.content

  let result = nodeToMd(first ?? { type: 'paragraph' }, 0)

  for (const child of rest) {
    result += nodeToMd(child, indent)
  }

  return result
}

function inlineToMd(node: JSONContent): string {
  if (!node.content) return node.text ? applyMarks(node.text, node.marks ?? []) : ''
  return node.content.map(child => {
    const text = child.text ?? ''
    return applyMarks(text, child.marks ?? [])
  }).join('')
}

interface Mark {
  type: string
  attrs?: Record<string, unknown>
}

function applyMarks(text: string, marks: Mark[]): string {
  let result = text
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':      result = `**${result}**`; break
      case 'italic':    result = `*${result}*`; break
      case 'strike':    result = `~~${result}~~`; break
      case 'code':      result = '`' + result + '`'; break
      case 'link': {
        const href = mark.attrs?.href ?? ''
        result = `[${result}](${href})`
        break
      }
    }
  }
  return result
}

export function downloadMarkdown(title: string, content: JSONContent) {
  const md = `# ${title}\n\n` + toMarkdown(content)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'nota'}.md`
  a.click()
  URL.revokeObjectURL(url)
}
