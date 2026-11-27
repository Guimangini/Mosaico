# Mosaico

Web app (PWA) para celular que corta uma foto em pedaços e monta um mosaico
contínuo na grade do perfil do Instagram.

- Grade de 3 colunas: de 1 a 4 linhas para foto em pé, de 1 a 2 para foto deitada.
- Cada pedaço sai em **1080 × 1440 px (3:4)**, o formato da grade do perfil
  desde 2025. Com isso, o Instagram não corta nada e as emendas batem.
- Redimensionamento Lanczos (via [pica](https://github.com/nodeca/pica)) e
  realce de nitidez opcional. A proporção nunca é esticada.
- Mostra o fator de ampliação e avisa quando a foto não tem resolução suficiente.
- Prévia do perfil com os pedaços numerados na ordem de postagem (`01` = primeiro
  a postar = canto inferior direito).
- Tudo roda no aparelho: a foto não é enviada para lugar nenhum. Funciona offline.

## Rodar

```bash
npm install
npm run dev -- --host   # abre no celular pela rede local
npm test                # testes das contas de grade, corte e ordem
npm run build
```

## Publicar

O workflow `.github/workflows/deploy.yml` testa, gera o build e publica no
GitHub Pages a cada push na `main`. Em *Settings → Pages*, escolha
*Source: GitHub Actions*.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `src/grid.ts` | grade, proporções e ordem de postagem |
| `src/crop.ts` | área de corte, arrastar/zoom e fator de ampliação |
| `src/render.ts` | gera os pedaços, um por vez (respeita o limite de canvas do iPhone) |
| `src/save.ts` | menu de compartilhar ou `.zip` |
| `src/ui/` | telas de ajuste e prévia |
