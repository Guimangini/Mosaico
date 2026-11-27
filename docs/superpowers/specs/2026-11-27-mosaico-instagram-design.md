# Mosaico — fatiador de fotos para o perfil do Instagram

Data: 2026-11-27 · Status: aguardando aprovação

## Intenção

App pessoal, usado no celular, que corta uma foto em pedaços para montar um
mosaico contínuo na grade do perfil do Instagram. O usuário escolhe a foto,
ajusta o corte e a qualidade, vê como o perfil vai ficar e baixa os pedaços
já na ordem de postagem. Também serve de projeto de portfólio (código público
no GitHub).

## Contexto que define as contas

- Desde 2025 a grade do perfil do Instagram exibe miniaturas **3:4**, e não mais
  quadradas. Cada pedaço é exportado em **1080 × 1440 px** (3:4), de modo que o
  Instagram não corte nada na grade.
- A grade sempre tem 3 colunas. O post mais recente aparece no canto superior
  esquerdo, então o primeiro a postar é o pedaço do canto **inferior direito**.

## Objetivos

1. Escolher uma foto da galeria do celular.
2. Grade com 3 colunas e número de linhas flexível:
   - foto em pé: 1 a 4 linhas (padrão 3);
   - foto deitada: 1 a 2 linhas (padrão 2).
3. Enquadramento: arrastar e dar zoom para escolher a área usada. A área tem a
   proporção da grade escolhida (3240 × linhas·1440).
4. Qualidade:
   - nunca esticar nem distorcer; a proporção é sempre preservada;
   - redimensionamento de alta qualidade (Lanczos) em qualquer ampliação ou redução;
   - toggle **"Realçar nitidez"** (unsharp mask leve), opcional;
   - indicador do fator de ampliação, com aviso quando a qualidade estiver no limite.
5. Prévia final imitando o perfil: pedaços 3:4, com espaços finos entre eles,
   numerados na ordem de postagem.
6. Download: arquivos `01.jpg`, `02.jpg`… (01 = primeiro a postar), salvos
   na galeria pelo menu de compartilhar do celular.

## Não-objetivos (v1)

- Super-resolução por IA (no aparelho ou em servidor) fica para uma versão futura.
- Postar direto no Instagram, agendar posts ou fazer login.
- Edição de foto (filtros, texto, cores).
- Planejar o feed inteiro com várias fotos.

## Anti-objetivos (seria um fracasso mesmo funcionando)

- Pedaços distorcidos, pixelizados ou desalinhados entre si.
- A foto sair do aparelho (nada é enviado a um servidor).
- Ordem de postagem confusa, que faça o mosaico sair embaralhado.

## Restrições

- Mobile first: iPhone (Safari) e Android (Chrome), uso com uma mão.
- Funciona offline depois da primeira visita.
- Sem backend; hospedagem estática gratuita.

## Abordagens consideradas

| Abordagem | Prós | Contras |
|---|---|---|
| **PWA (escolhida)** | Um link, instalável na tela inicial, offline, processamento local, deploy grátis, bom para portfólio | Para salvar na galeria, passa pelo menu de compartilhar |
| React Native / Expo | Salva direto na galeria, cara de app nativo | Build, Expo Go ou loja; muita configuração para um app pequeno |
| Flutter | Igual ao nativo | Mesmo custo, e Dart não ajuda numa carreira em dados |

Escolhida pelo usuário: **PWA**.

## Decisões do usuário

- Grade flexível com os limites acima (em pé até 4 linhas, deitada até 2).
- Melhoria de nitidez como toggle opcional, sem distorção nem pixelização.
- Prévia como etapa final, depois de escolher tamanho e qualidade.
- PWA.

## Decisões técnicas (de Claude, podem ser revistas)

- **Stack:** Vite + TypeScript, sem framework de UI (o app tem uma tela só, em
  etapas). Biblioteca `pica` para redimensionar com Lanczos3 e fazer o unsharp mask.
  `vite-plugin-pwa` para manifest e service worker.
- **Leitura da foto:** `createImageBitmap` respeitando a orientação EXIF.
  HEIC: o iPhone já converte para JPEG ao escolher a foto; no Android, se não
  decodificar, o app mostra uma mensagem pedindo JPEG/PNG.
- **Corte:** sobre a imagem original em resolução cheia (nunca sobre a prévia).
  Cada pedaço é recortado da área escolhida e redimensionado direto para
  1080 × 1440, para que as bordas fiquem alinhadas ao pixel.
- **Fator de ampliação** = 3240 / largura da área escolhida em pixels da foto.
  ≤ 1,0: ok · 1,0–1,5: "ampliação moderada" · > 1,5: aviso forte, sugerindo menos
  linhas ou menos zoom. (Limites ajustáveis.)
- **Foto quadrada:** tratada como em pé (1 a 4 linhas).
- **Exportação:** JPEG com qualidade 0,95, sRGB.
- **Salvar:** Web Share API com os arquivos (`navigator.canShare({ files })`).
  Fallback: baixar um `.zip` (JSZip).
- **Dica na prévia:** lembrar que posts fixados no topo do perfil quebram o
  mosaico e que nada deve ser postado entre os pedaços.
- **Testes:** testes unitários (Vitest) para as contas de grade, retângulos de
  corte, ordem de postagem e fator de ampliação.
- **Deploy:** GitHub Pages (ou Vercel).

## Fluxo da tela

1. **Escolher foto** → 2. **Ajustar** (linhas, arrastar/zoom, toggle de nitidez,
   indicador de ampliação) → 3. **Prévia do perfil** → 4. **Baixar**.

## Fica a critério de quem construir

Visual e cores, textos da interface, gestos exatos de zoom, ícone do app.
