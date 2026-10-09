import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { CheckSquare } from 'lucide-react'

export default function TasksTab() {
  const [lists, setLists] = useState([])
  const [tasksByList, setTasksByList] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    request('/google/tasks/lists')
      .then(async data => {
        setLists(data)
        const map = {}
        await Promise.all(data.map(async list => {
          try {
            map[list.id] = await request(`/google/tasks/lists/${list.id}/tasks`)
          } catch { map[list.id] = [] }
        }))
        setTasksByList(map)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
  if (error) return <p className="py-8 text-center text-sm text-destructive">{error}</p>
  if (!lists.length) return <EmptyState icon={CheckSquare} title="Nenhuma lista de tarefas" description="Suas listas do Google Tasks aparecerão aqui" />

  return (
    <div className="space-y-4">
      {lists.map(list => (
        <div key={list.id}>
          <p className="font-medium text-sm mb-2">{list.title}</p>
          <div className="space-y-1">
            {(tasksByList[list.id] || []).map(task => (
              <div key={task.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <div className={`h-4 w-4 rounded border ${task.completed ? 'border-green-500 bg-green-500' : 'border-muted-foreground'}`} />
                <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
              </div>
            ))}
            {!tasksByList[list.id]?.length && <p className="text-xs text-muted-foreground pl-2">Sem tarefas</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
