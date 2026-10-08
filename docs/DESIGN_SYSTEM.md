# Contaux Contadoria — Design System

> Extraído do template original (https://github.com/adrianohermida/contaux.git)  
> Documenta cores, tipografia, componentes, ícones e templates de página do site institucional.

---

## 1. Identidade Visual

### Logo
- **Arquivo principal**: `assets/images/contaux_blue.png` (logo azul do "C" da Contaux)
- **Versão SVG**: `assets/images/contaux_blue.svg`
- **Favicon**: `assets/images/favicon.svg` (idêntico ao contaux_blue.svg) e `favicon.png`
- **Uso no navbar**: 40px de largura + texto "Contaux Contadoria" em `#0066ff`, peso 600
- **Uso no footer**: 40px de largura, sem texto adicional

### Padrão de Logo (navbar)
```html
<a class="navbar-brand logo d-flex align-items-center" href="index.html">
    <img class="logo1" src="assets/images/contaux_blue.png" alt="Logo Contaux"
         style="width: 40px; height: auto; margin-right: 10px;">
    <span class="brand-text" style="color: #0066ff; font-weight: 600;">Contaux Contadoria</span>
</a>
```

### Padrão de Logo (footer)
```html
<div class="logo">
    <a href="index.html">
        <img src="assets/images/contaux_blue.png" alt="Logo Contaux"
             style="width: 40px; height: auto;">
    </a>
</div>
```

---

## 2. Cores

### Paleta Principal
| Token              | Hex       | Uso                                          |
|--------------------|-----------|----------------------------------------------|
| **Theme Color**    | `#3763EB` | Cor primária: botões, links, ícones, hover   |
| **Brand Blue**     | `#0066ff` | Texto da marca no navbar                      |
| **Heading Color**  | `#081828` | Títulos (h1-h6), texto escuro, footer bg      |
| **Body Color**    | `#6e657e` | Texto corrido do corpo                        |
| **Gray Background**| `#f6f9fc` | Fundo de seções, cards, áreas de destaque     |
| **White**          | `#fff`    | Fundo principal, texto sobre fundo escuro    |
| **Border Color**   | `#F4EEFB` | Bordas sutis (botões header)                 |

### Cores de Apoio
| Token              | Hex       | Uso                                          |
|--------------------|-----------|----------------------------------------------|
| **Star/Yellow**    | `#ffd849` | Estrelas de avaliação (testimonials)         |
| **Link Gray**      | `#888`    | Texto secundário, durações                   |
| **Border Gray**    | `#eee`    | Bordas de cards, divisores                   |
| **Input Border**   | `#e6e2f5` | Bordas de campos de formulário               |
| **Footer Text**    | `#f3f1fdc9` | Texto de links no footer (semi-transparente) |

---

## 3. Tipografia

### Fonte
- **Família**: `Spartan` (Google Fonts)
- **Weights disponíveis**: 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Import**: `@import url("https://fonts.googleapis.com/css2?family=Spartan:wght@100;200;300;400;500;600;700;800;900&display=swap")`
- **Fallback**: `sans-serif`

### Escala Tipográfica
| Elemento | Tamanho  | Peso | Linha     | Observação                    |
|----------|----------|------|-----------|-------------------------------|
| Body     | 14px     | 400  | —         | Texto corrido, cor #6e657e    |
| h1       | 50px     | 600  | —         | Páginas internas              |
| h1 (hero)| 40px     | 700  | 55px      | Homepage, com span weight 300 |
| h2       | 40px     | 600  | —         |                               |
| h2 (section) | 33px | 700  | 50px      | Títulos de seção              |
| h3       | 30px     | 600  | —         |                               |
| h3 (card)| 16px     | 600  | 24px      | Títulos de cards de serviço   |
| h4       | 25px     | 600  | —         |                               |
| h5       | 20px     | 600  | —         |                               |
| h6       | 16px     | 600  | —         |                               |
| Footer h3| 18px     | 500  | —         | Títulos do footer             |
| Label (section) | 14px | 400 | —    | Texto uppercase acima do h2   |

### Padrões de Texto
- Links: transição `0.4s ease`
- Títulos de seção: `text-transform: capitalize`, `padding-bottom: 14px`, sublinhado `#3763EB` 50px×2px
- Label de seção: `text-transform: uppercase`, cor `#3763EB`

---

## 4. Espaçamento e Layout

### Breakpoints
| Nome     | Query                                           |
|----------|------------------------------------------------|
| Desktop  | `min-width: 1400px`                             |
| Laptop   | `min-width: 1200px` and `max-width: 1399px`     |
| LG       | `min-width: 992px` and `max-width: 1199px`      |
| MD       | `min-width: 768px` and `max-width: 991px`        |
| SM       | `min-width: 480px` and `max-width: 767px`        |
| XS       | `max-width: 767px`                               |

### Container
- Bootstrap grid (`container` → `row` → `col-*`)
- Colunas: `col-lg-3`, `col-lg-4`, `col-lg-6`, `col-lg-12`, `col-md-6`, `col-12`

### Utilitários de Margem
- `.mt-5` a `.mt-120` (incrementos de 5px)
- Section title: `margin-bottom: 80px`, `padding: 0 300px` (centro)

### Border Radius
| Token         | Valor | Uso                           |
|---------------|-------|-------------------------------|
| Default       | 10px  | Cards de serviço, geral       |
| Small         | 5px   | Formulários, pricing, imagens |
| Medium        | 7px   | Map container                 |
| Round         | 30px  | Botões primários              |
| Circle        | 50%   | Ícones sociais, avatares      |

---

## 5. Componentes

### 5.1 Botão Primário (`.button .btn`)
```css
display: inline-block;
font-size: 14px;
font-weight: 600;
padding: 15px 30px;
background-color: #3763EB;
color: #fff;
border: none;
border-radius: 30px;
transition: 0.5s;
/* Hover */
background-color: #081828;
box-shadow: 0 1rem 3rem rgba(35, 38, 45, 0.15);
transform: translate3d(0, -5px, 0);
```

### 5.2 Botão Header (`.header .button .btn`)
```css
color: #3763EB;
padding: 12px 25px;
background: #fff;
border: 1px solid #F4EEFB;
font-size: 14px;
font-weight: 500;
width: 150px;
/* Hover */
color: #fff;
background-color: #3763EB;
```

### 5.3 Card de Serviço (`.single-service`)
```css
padding: 40px 30px;
background-color: #f6f9fc;
border-radius: 10px;
transition: all 0.4s ease;
/* Hover: fundo #3763EB, texto branco, ícone inverte */
```
- Ícone: 60×60px, `border-radius: 60px 60px 60px 0` (formato gota), bg `#3763EB`, ícone branco
- Hover: ícone bg branco, ícone `#3763EB`, card bg `#3763EB`, texto branco
- Animação: `cubic-bezier(0.94, 0.05, 0.23, 1.04)` no `::before`

### 5.4 Card de Pricing (`.single-table`)
```css
background: #fff;
text-align: center;
padding: 60px 20px;
box-shadow: 0 10px 30px rgba(111, 111, 111, 0.1);
border-radius: 5px;
```
- Título: 18px, peso 600
- Preço: 35px, peso 600, separador radial-gradient
- Lista: 14px, margem 20px entre itens

### 5.5 Testimonial (`.single-testimonial`)
```css
padding: 40px;
border-radius: 8px;
border: 1px solid #eee;
background-color: #f6f9fc;
```
- Estrelas: cor `#3763EB`
- Avatar: 80×80px, `border-radius: 100%`
- Nome: 17px, cargo: 13px cor `#888`

### 5.6 Footer (`.footer`)
```css
background-color: #081828;
/* footer-middle: padding 70px top, 60px bottom */
/* footer-bottom: border-top 1px solid #ffffff4a, padding 30px 0 */
```
- Títulos: 18px, peso 500, `border-left: 3px solid #3763EB`, `padding-left: 10px`
- Links: 13px, cor `#f3f1fdc9`, hover → `letter-spacing: 1px`
- Social: 45×45px, círculo, hover bg `#3763EB`

### 5.7 Newsletter (`.newsletter-area`)
- Input: 53px altura, 400px largura, `border-radius: 30px`, bg branco
- Botão: transparente, borda `1px solid #eee`, hover bg branco + cor `#3763EB`

### 5.8 Formulário de Contato (`.contact-us .form`)
- Input: 55px altura, borda `1px solid #e6e2f5`, `border-radius: 5px`
- Textarea: 180px altura, `resize: none`, mesmo borda
- Botão: 50px altura, sem borda

### 5.9 Navbar (`.navbar-area`)
- Posição: `absolute`, bg branco (transparente em index2)
- Sticky: `position: fixed`, `box-shadow: 0px 20px 50px 0px rgba(0,0,0,0.05)`
- Nav items: `margin-left: 38px`, `font-size: 14px`, `font-weight: 500`
- Active/hover: cor `#3763EB`, sublinhado animado 30px×3px

### 5.10 Section Title (`.section-title`)
```css
text-align: center;
margin-bottom: 80px;
padding: 0 300px;
/* h2: 33px, weight 700, line-height 50px, sublinhado #3763EB */
/* span (label): uppercase, #3763EB, 14px */
/* Variantes: .white-text, .align-left, .align-right */
```

---

## 6. Ícones

### LineIcons 2.0
- **CSS**: `assets/css/LineIcons.2.0.css`
- **Fontes**: `assets/fonts/LineIcons.*` (eot, svg, ttf, woff, woff2)
- **Prefixo**: `lni lni-{nome}`
- **Exemplos usados no site**:
  - `lni-instagram`, `lni-twitter`, `lni-linkedin`, `lni-facebook-filled`
  - `lni-map-marker`, `lni-phone`, `lni-envelope`
  - `lni-arrow-right`, `lni-arrow-up`, `lni-chevron-down`

### Animate.css
- **CSS**: `assets/css/animate.css`
- **Uso**: Classes `wow fadeIn`, `wow fadeInRight`, `wow fadeInUp`
- **JS**: `assets/js/wow.min.js` (inicializar com `new WOW().init()`)

---

## 7. Bibliotecas e Dependências

| Biblioteca     | Arquivo                        | Uso                              |
|----------------|--------------------------------|----------------------------------|
| Bootstrap 4    | `bootstrap.min.css/js`         | Grid, navbar, tabs, collapse     |
| jQuery         | (via Bootstrap)               | Manipulação DOM, plugins         |
| LineIcons 2.0  | `LineIcons.2.0.css` + fonts    | Ícones                           |
| Animate.css    | `animate.css` + `wow.min.js`   | Animações de entrada             |
| GLightbox      | `glightbox.min.css/js`         | Lightbox de imagens/vídeo        |
| Tiny Slider    | `tiny-slider.css/js`           | Carrossel de testimonials         |
| Isotope        | `isotope.min.js`               | Filtros de portfolio              |
| CounterUp      | `count-up.min.js` + `jquery-counterup` | Contadores animados      |
| ImagesLoaded    | `imagesloaded.min.js`          | Pré-carregamento de imagens      |

### JS Principal
- **Arquivo**: `assets/js/main.js`
- Inicializa: WOW, tiny-slider, GLightbox, isotope, counter-up, navbar sticky, scroll-to-top

---

## 8. Templates de Página

### Páginas Públicas Conectadas (navegação principal)
| Página                  | Arquivo                    | Rota nginx     | Status |
|-------------------------|----------------------------|----------------|--------|
| Home (PT-BR)            | `index.html`               | `/`, `/inicio` | ✅     |
| Sobre Nós               | `about-us.html`            | `/about-us`    | ✅     |
| Serviços                | `services.html`            | `/services`    | ✅     |
| Serviço Detalhe         | `service-single.html`      | `/service-single` | ✅ |
| Contato                 | `contato.html`             | `/contato`     | ✅     |
| Blog (Grid + Sidebar)   | `blog-grid-sidebar.html`   | `/blog-grid-sidebar` | ✅ |
| Blog Post (com sidebar) | `blog-single-sidebar.html` | `/blog-single-sidebar` | ✅ |
| Blog Post (simples)     | `blog-single.html`          | `/blog-single` | ✅     |
| Portfolio               | `portfolio.html`           | `/portfolio`   | ✅     |
| Portfolio Detalhe       | `portfolio-single.html`    | `/portfolio-single` | ✅ |
| Planos/Preços           | `pricing.html`             | `/pricing`     | ✅     |
| Erro 404                | `404.html`                 | `/404`         | ✅     |
| Sucesso de Email        | `mail-success.html`        | `/mail-success` | ✅    |

### Variantes de Template (não conectadas na navegação)
| Página              | Arquivo        | Descrição                          |
|---------------------|----------------|------------------------------------|
| Home Variante 2     | `index2.html`  | Hero com fundo azul sólido         |
| Home Variante 3     | `index3.html`  | Hero com layout alternativo        |
| Home Variante 4     | `index4.html`  | Hero estilo portfolio pessoal      |

### Estrutura HTML Padrão de uma Página
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contaux Contadoria — [Página]</title>
    <link rel="shortcut icon" type="image/x-icon" href="assets/images/favicon.svg">
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/LineIcons.2.0.css">
    <link rel="stylesheet" href="assets/css/animate.css">
    <link rel="stylesheet" href="assets/css/glightbox.min.css">
    <link rel="stylesheet" href="assets/css/tiny-slider.css">
    <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
    <!-- Preloader -->
    <div class="preloader">
        <div class="preloader-inner">
            <div class="preloader-icon"><span></span><span></span></div>
        </div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="navbar-area">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-12">
                        <nav class="navbar navbar-expand-lg">
                            <!-- LOGO PADRÃO -->
                            <a class="navbar-brand logo d-flex align-items-center" href="index.html">
                                <img class="logo1" src="assets/images/contaux_blue.png"
                                     alt="Logo Contaux"
                                     style="width: 40px; height: auto; margin-right: 10px;">
                                <span class="brand-text"
                                      style="color: #0066ff; font-weight: 600;">
                                    Contaux Contadoria
                                </span>
                            </a>
                            <button class="navbar-toggler" ...>...</button>
                            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                                <ul class="navbar-nav ml-auto">
                                    <li class="nav-item"><a href="index.html">Início</a></li>
                                    <li class="nav-item"><a href="about-us.html">Sobre</a></li>
                                    <li class="nav-item"><a href="services.html">Serviços</a></li>
                                    <li class="nav-item"><a href="blog-grid-sidebar.html">Blog</a></li>
                                    <li class="nav-item"><a href="contato.html">Contato</a></li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Conteúdo da página -->
    <section class="...">...</section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-middle">
            <div class="container">
                <div class="row">
                    <div class="col-lg-3 col-md-6 col-12">
                        <div class="f-about single-footer">
                            <div class="logo">
                                <a href="index.html">
                                    <img src="assets/images/contaux_blue.png"
                                         alt="Logo Contaux"
                                         style="width: 40px; height: auto;">
                                </a>
                            </div>
                            <p>Descomplique as suas contas com contadores de verdade.</p>
                            <div class="footer-social">...</div>
                        </div>
                    </div>
                    <!-- Mais colunas do footer -->
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="container">
                <div class="inner">
                    <p>© 2024 Contaux Contadoria. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/wow.min.js"></script>
    <script src="assets/js/tiny-slider.js"></script>
    <script src="assets/js/glightbox.min.js"></script>
    <script src="assets/js/isotope.min.js"></script>
    <script src="assets/js/count-up.min.js"></script>
    <script src="assets/js/jquery-counterup.min.js"></script>
    <script src="assets/js/main.js"></script>
</body>
</html>
```

---

## 9. Animações e Transições

| Padrão            | Duração | Easing                              | Uso                  |
|-------------------|---------|--------------------------------------|----------------------|
| Default           | 0.4s    | `ease`                               | Links, spans         |
| Buttons           | 0.5s    | —                                    | Hover de botões      |
| Navbar sticky     | 0.3s    | `ease-out`                           | Transição header     |
| Service card hover| 0.4s    | `cubic-bezier(0.94, 0.05, 0.23, 1.04)` | Card::before       |
| Social icon       | 0.2s    | `ease`                               | Footer social hover |

### Classes de Entrada (WOW.js + Animate.css)
- `wow fadeIn` — fade simples
- `wow fadeInRight` — fade da direita
- `wow fadeInUp` — fade de baixo
- `wow fadeInLeft` — fade da esquerda

---

## 10. Design System do Dashboard (React + Tailwind)

O dashboard usa um design system separado, baseado em shadcn/ui + Tailwind CSS.

### Cores (CSS Variables em `dashboard/src/index.css`)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --primary: 221 83% 53%;       /* ≈ #2563eb (azul Tailwind) */
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --border: 214 32% 91%;
  --radius: 0.5rem;
}
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;       /* ≈ #3b82f6 */
}
```

### Componentes Dashboard
- **Card**: `rounded-lg border bg-card shadow-sm`
- **Button**: Variantes `default` (bg-primary), `secondary`, `outline`, `ghost`
- **Badge**: Variantes `default`, `secondary`, `destructive`, `outline`

### Mapeamento Site → Dashboard
| Token do Site       | Equivalente Dashboard (Tailwind)   |
|---------------------|-----------------------------------|
| `#3763EB` (theme)   | `blue-600` / `--primary`           |
| `#081828` (heading) | `slate-900` / `--foreground`       |
| `#6e657e` (body)    | `slate-500`                        |
| `#f6f9fc` (gray bg) | `slate-50`                         |
| `10px` radius       | `rounded-lg` (0.5rem)             |
| `30px` radius btn   | `rounded-full`                     |

---

## 11. Correções Aplicadas

### Logo Padronizado (2026-10-07)
- **Problema**: 12 páginas referenciavam `assets/images/logo/logo.svg` e `logo/footer-logo.svg` (arquivos inexistentes → logo quebrado). `contato.html` usava `contaux_blue.svg` com tamanho diferente. `index.html` era a única página correta.
- **Solução**: Todas as 17 páginas HTML agora usam `contaux_blue.png` (40px) + texto "Contaux Contadoria" no navbar, e `contaux_blue.png` (40px) no footer.
- **Páginas corrigidas**: index.html, index2.html, index3.html, index4.html, about-us.html, services.html, service-single.html, contato.html, pricing.html, portfolio.html, portfolio-single.html, blog-grid-sidebar.html, blog-single.html, blog-single-sidebar.html, 404.html, mail-success.html.

### Links de Navegação Corrigidos
- `blog.html` → `blog-grid-sidebar.html` (index.html)
- `sobre-nos.html` → `about-us.html` (14 páginas)

### Favicon Padronizado
- `index.html`: `favicon.ico` (inexistente) → `favicon.svg`
- `contato.html`: `contaux_blue.svg` → `favicon.svg`
- Todas as 17 páginas agora usam `assets/images/favicon.svg`
