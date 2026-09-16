# Portal de Pátios MRS v3

## Recursos incluídos

- Interface mais legível, rápida e responsiva.
- Tema claro: fundo branco e desenho do PDF em preto.
- Tema escuro: fundo preto e desenho do PDF em branco.
- Botão de tema também dentro do visualizador.
- PDF renderizado novamente a cada zoom com alta densidade, reduzindo pixelização.
- Aba Abrigos com um cartão clicável para cada abrigo.
- Cada abrigo possui dois botões: **Abrir PDF** e **Abrir link**.
- Exportação do PDF atualmente aberto.

## PDF de cada abrigo

O campo `abrigoPdf` define o documento específico:

```javascript
"abrigoPdf": "docs/abrigos/FSJ01.pdf"
```

Se esse PDF não existir, o portal abre o PDF geral do pátio na página cadastrada.

## Link de cada abrigo

Preencha o campo `link` no `data.js`:

```javascript
"link": "https://endereco-do-link"
```

Enquanto o campo estiver vazio, o botão **Abrir link** ficará desabilitado.

## Estrutura

- PDFs gerais: `docs/`
- PDFs individuais: `docs/abrigos/`
