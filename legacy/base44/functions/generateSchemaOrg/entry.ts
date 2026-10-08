import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, id } = await req.json();

    if (type === 'blog-post' && id) {
      // Get blog post
      const blogPost = await base44.asServiceRole.entities.BlogPost.get(id);
      
      if (!blogPost) {
        return Response.json({ error: 'Post not found' }, { status: 404 });
      }

      const data = blogPost.data || blogPost;
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': data.title,
        'description': data.seo_description || data.excerpt,
        'image': {
          '@type': 'ImageObject',
          'url': data.featured_image,
          'width': 800,
          'height': 600
        },
        'datePublished': data.publish_date || blogPost.created_date,
        'dateModified': blogPost.updated_date,
        'author': {
          '@type': 'Person',
          'name': data.author || 'Contaux'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Contaux',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://hermidamaia.adv.br/logo.png'
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': 'https://hermidamaia.adv.br/blog/' + data.slug
        },
        'keywords': (data.seo_keywords || []).join(', '),
        'articleBody': data.content.replace(/<[^>]*>/g, ''),
        'wordCount': (data.content.replace(/<[^>]*>/g, '').split(/\s+/).length)
      };

      return Response.json(schema);
    }

    if (type === 'organization') {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Contaux - Contabilidade Jurídica',
        'url': 'https://hermidamaia.adv.br',
        'logo': 'https://hermidamaia.adv.br/logo.png',
        'description': 'Serviços de contabilidade jurídica e gestão empresarial',
        'sameAs': [
          'https://www.linkedin.com/company/contaux',
          'https://www.facebook.com/contaux'
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'contactType': 'Customer Service',
          'telephone': '+55-11-98765-4321',
          'email': 'contato@hermidamaia.adv.br'
        }
      };

      return Response.json(schema);
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});