import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all published blog posts
    const blogPosts = await base44.asServiceRole.entities.BlogPost.filter({
      published: true,
      status: 'published'
    }, '-publish_date', 1000);

    // Base URL (adjust based on your domain)
    const baseUrl = 'https://hermidamaia.adv.br';

    // Generate XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add home page
    sitemap += '  <url>\n';
    sitemap += '    <loc>' + baseUrl + '/</loc>\n';
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';

    // Add blog listing
    sitemap += '  <url>\n';
    sitemap += '    <loc>' + baseUrl + '/blog</loc>\n';
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';

    // Add individual blog posts
    blogPosts.forEach(post => {
      const slug = post.data?.slug || post.slug;
      if (!slug) return;
      const lastMod = new Date(post.updated_date || post.created_date).toISOString().split('T')[0];
      sitemap += '  <url>\n';
      sitemap += '    <loc>' + baseUrl + '/blog/' + slug + '</loc>\n';
      sitemap += '    <lastmod>' + lastMod + '</lastmod>\n';
      sitemap += '    <changefreq>monthly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=86400'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});