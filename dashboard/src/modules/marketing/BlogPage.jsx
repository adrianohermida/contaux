import { useState } from 'react'
import BlogPostList from './BlogPostList'
import BlogPostForm from './BlogPostForm'
import { mockBlogPosts } from './lib/mockData'

export default function BlogPage() {
  const [posts, setPosts] = useState(mockBlogPosts)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (post) => { setEditing(post); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)))
    } else {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setPosts((prev) => [{
        ...data, id: String(Date.now()), slug, status: 'draft',
        published_date: '', views: 0,
      }, ...prev])
    }
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Gerenciador de Blog</h1>
        <p className="text-sm text-muted-foreground">CMS para posts, SEO e categorias</p>
      </div>
      <BlogPostList posts={posts} onNew={handleNew} onEdit={handleEdit} />
      <BlogPostForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingPost={editing} />
    </>
  )
}
