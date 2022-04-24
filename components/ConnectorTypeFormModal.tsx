import { Input, List, ListItem } from '@chakra-ui/react'
import Modal from 'components/Modal'
import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { ConnectorTypeModel } from 'server/model/connector-types'
import { Exported } from 'server/model/database'
import { CreateConnectorTypeReq } from 'pages/api/projects/[projectID]/connectortypes'
import { SupportedLang } from 'server/model/relations'

interface ConnectorTypeFormModalProps {
  isOpen: boolean
  projectID: string
  onClose: () => void
  reloadTypes: () => Promise<void>
  types: Exported<ConnectorTypeModel>[]
  targetModule: string | null
  language: SupportedLang | null
}

export default function ConnectorTypeFormModal({
  isOpen,
  projectID,
  onClose,
  types,
  targetModule,
  reloadTypes,
  language,
}: ConnectorTypeFormModalProps): JSX.Element {
  const [text, setText] = useState<string>('')
  const [suggestions, setSuggestions] = useState<
    Exported<ConnectorTypeModel>[]
  >([])

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setText(newText)
    setSuggestions(newText ? types.filter((t) => t.name.includes(newText)) : [])
  }

  const onKeyUp = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await createConnectorType()
    }
  }

  const createConnectorType = async () => {
    if (targetModule && language) {
      const req: CreateConnectorTypeReq = { language, name: text, targetModule }
      await fetch(`/api/projects/${projectID}/connectortypes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })

      await reloadTypes()

      setText('')
      setSuggestions([])
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Input
        placeholder="Add a new connector type..."
        value={text}
        onChange={onChange}
        onKeyUp={onKeyUp}
      />
      <List>
        {suggestions.map((suggestion) => (
          <ListItem key={suggestion.id}>{suggestion.name}</ListItem>
        ))}
      </List>
    </Modal>
  )
}
