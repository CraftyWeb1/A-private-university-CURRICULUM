import { AddLine, Editable, IconX } from '../components/Editable'
import { href } from '../lib/route'
import { useStore } from '../lib/store'
import type { BlockType } from '../lib/types'

const KINDS: { type: BlockType; label: string }[] = [
  { type: 'p', label: 'Text' },
  { type: 'h', label: 'Heading' },
  { type: 'todo', label: 'To-do' },
  { type: 'bullet', label: 'Bullet' },
]

export function PagePage({ id }: { id: string }) {
  const { store, updatePage, removePage, addBlock, updateBlock, removeBlock } = useStore()
  const page = store.pages.find((p) => p.id === id)
  if (!page) {
    return (
      <div>
        <h1>Untitled no longer exists.</h1>
        <p>
          <a href={href('')}>Return to the garden.</a>
        </p>
      </div>
    )
  }

  return (
    <div className="notion-page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="kicker">A free page · type anywhere</span>
        <button
          className="ghost danger"
          type="button"
          onClick={() => {
            if (window.confirm(`Delete “${page.title || 'Untitled'}”?`)) {
              removePage(page.id)
              window.location.hash = '#/'
            }
          }}
        >
          Delete page
        </button>
      </div>
      <Editable
        className="edit-h1"
        value={page.title}
        onChange={(title) => updatePage(page.id, { title })}
        placeholder="Untitled"
      />
      <div className="blocks">
        {page.blocks.map((block) => (
          <div className={`block-row block-${block.type}`} key={block.id}>
            {block.type === 'todo' ? (
              <button
                type="button"
                className="check-wrap"
                onClick={() => updateBlock(page.id, block.id, { done: !block.done })}
              >
                <span className={block.done ? 'check filled' : 'check'} />
              </button>
            ) : block.type === 'bullet' ? (
              <span className="bullet">•</span>
            ) : null}
            <Editable
              className={block.type === 'h' ? 'edit-h3' : block.done ? 'done-text' : ''}
              value={block.text}
              onChange={(text) => updateBlock(page.id, block.id, { text })}
              placeholder={
                block.type === 'h' ? 'Heading' : block.type === 'todo' ? 'To-do' : 'Type something…'
              }
              multiline={block.type === 'p'}
            />
            <IconX onClick={() => removeBlock(page.id, block.id)} />
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        {KINDS.map((k) => (
          <AddLine key={k.type} label={k.label} onClick={() => addBlock(page.id, k.type)} />
        ))}
      </div>
    </div>
  )
}
