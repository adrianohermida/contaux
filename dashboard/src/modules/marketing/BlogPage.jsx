import { useState } from 'react'
import BlogPostList from './BlogPostList'
import BlogPostForm from './BlogPostForm'
import { useCollection } from '@/hooks/useCollection'

export default function BlogPage() {
  const { items: posts, create, update, loading } = useCollection('blog_posts')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (post) => { setEditing(post); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      await create({ ...data, slug, status: 'draft', published_date: '', views: 0 })
    }
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Gerenciador de Blog</h1>
        <p className="text-sm text-muted-foreground">CMS para posts, SEO e categorias</p>
      </div>
      <BlogPostList posts={posts} loading={loading} onNew={handleNew} onEdit={handleEdit} />
      <BlogPostForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingPost={editing} />
    </>
  )
}
