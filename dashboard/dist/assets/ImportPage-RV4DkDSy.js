import{c as g,r as o,j as e,a as x,d as h,e as v,l as j}from"./index-DN1RElmZ.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=g("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]),l=[{key:"clients",label:"Clientes",endpoint:"/api/import/clients",template:`[
  {
    "name": "Empresa XYZ LTDA",
    "type": "PJ",
    "document": "12.345.678/0001-90",
    "email": "contato@xyz.com.br",
    "phone": "(11) 99999-9999",
    "status": "active",
    "tags": ["Mensal", "Premium"],
    "address": {
      "street": "Rua Exemplo",
      "number": "100",
      "city": "São Paulo",
      "state": "SP",
      "zip": "01000-000"
    },
    "fiscal": {
      "regime_tributario": "Simples Nacional",
      "inscricao_estadual": "123.456.789",
      "inscricao_municipal": "1234567"
    }
  }
]`},{key:"invoices",label:"Faturas",endpoint:"/api/import/invoices",template:`[
  {
    "number": "NF-2026-001",
    "client_name": "Empresa XYZ LTDA",
    "issue_date": "2026-10-01",
    "due_date": "2026-10-15",
    "items": [
      { "description": "Serviços contábeis mensais", "quantity": 1, "unit_price": 2500 }
    ],
    "discount": 0,
    "status": "sent"
  }
]`},{key:"payments",label:"Pagamentos",endpoint:"/api/import/payments",template:`[
  {
    "invoice_number": "NF-2026-001",
    "client_name": "Empresa XYZ LTDA",
    "amount": 2500,
    "payment_date": "2026-10-10",
    "method": "pix",
    "status": "confirmed",
    "reference": "PIX-12345"
  }
]`},{key:"accounts",label:"Plano de Contas",endpoint:"/api/import/accounts",template:`[
  { "code": "1", "name": "Ativo", "type": "asset", "level": 1 },
  { "code": "1.1", "name": "Ativo Circulante", "type": "asset", "level": 2 },
  { "code": "1.1.1", "name": "Caixa", "type": "asset", "level": 3 },
  { "code": "2", "name": "Passivo", "type": "liability", "level": 1 },
  { "code": "3", "name": "Receitas", "type": "revenue", "level": 1 },
  { "code": "4", "name": "Despesas", "type": "expense", "level": 1 }
]`},{key:"journal",label:"Lançamentos",endpoint:"/api/import/journal-entries",template:`[
  {
    "date": "2026-10-01",
    "description": "Recebimento de cliente",
    "reference": "NF-001",
    "status": "posted",
    "lines": [
      { "account_code": "1.1.2", "account_name": "Bancos", "debit": 2500, "credit": 0 },
      { "account_code": "1.1.3", "account_name": "Clientes a Receber", "debit": 0, "credit": 2500 }
    ]
  }
]`},{key:"obligations",label:"Obrigações",endpoint:"/api/import/obligations",template:`[
  {
    "title": "DCTF Outubro",
    "description": "Declaração de Débitos e Créditos Tributários Federais",
    "due_date": "2026-10-15",
    "type": "federal",
    "frequency": "monthly",
    "status": "pending"
  }
]`}];function C(){const[n,b]=o.useState(l[0].key),[i,s]=o.useState(""),[r,a]=o.useState(null),[d,c]=o.useState(!1),m=l.find(t=>t.key===n),y=async()=>{a(null),c(!0);try{const t=JSON.parse(i),p=await fetch(m.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),u=await p.json();if(!p.ok)throw new Error(u.error||"Erro na importação");a({type:"success",message:`${u.imported} registro(s) importado(s) com sucesso!`}),s("")}catch(t){a({type:"error",message:t.message})}finally{c(!1)}},f=()=>{s(m.template),a(null)};return e.jsxs("div",{className:"mx-auto max-w-4xl",children:[e.jsxs("div",{className:"mb-6",children:[e.jsx("h1",{className:"text-2xl font-bold text-foreground",children:"Importar Dados"}),e.jsx("p",{className:"mt-1 text-sm text-muted-foreground",children:'Cole os dados em formato JSON no campo abaixo e clique em importar. Use o botão "Ver exemplo" para ver o formato esperado.'})]}),e.jsx("div",{className:"mb-4 flex flex-wrap gap-1 border-b border-border",role:"tablist",children:l.map(t=>e.jsx("button",{role:"tab","aria-selected":n===t.key,onClick:()=>{b(t.key),s(""),a(null)},className:x("px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",n===t.key?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"),children:t.label},t.key))}),e.jsxs("div",{className:"mb-3 flex items-center justify-between",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Formato: array JSON de objetos"}),e.jsx("button",{onClick:f,className:"text-xs font-medium text-primary hover:underline",children:"Ver exemplo"})]}),e.jsx("textarea",{value:i,onChange:t=>s(t.target.value),placeholder:"[\\n  { ... }\\n]","aria-label":"Dados JSON para importação",className:"h-72 w-full rounded-lg border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"}),r&&e.jsxs("div",{role:"alert",className:x("mt-3 flex items-center gap-2 rounded-lg p-3 text-sm",r.type==="success"?"bg-green-500/10 text-green-600 dark:text-green-400":"bg-red-500/10 text-red-600 dark:text-red-400"),children:[r.type==="success"?e.jsx(h,{className:"h-4 w-4","aria-hidden":"true"}):e.jsx(v,{className:"h-4 w-4","aria-hidden":"true"}),r.message]}),e.jsx("div",{className:"mt-4 flex justify-end",children:e.jsxs("button",{onClick:y,disabled:!i.trim()||d,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",children:[d?e.jsx(N,{className:"h-4 w-4 animate-spin","aria-hidden":"true"}):e.jsx(j,{className:"h-4 w-4","aria-hidden":"true"}),"Importar"]})})]})}export{C as default};
