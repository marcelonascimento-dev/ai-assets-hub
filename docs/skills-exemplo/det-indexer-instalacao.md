## Pré-requisitos

- Python 3.10+
- Pacotes: `python-docx`, `pyyaml`
- Acesso de leitura à pasta de DETs e ao repositório de código

## Instalação

1. Clone os scripts da skill na pasta de skills do Claude:

   ```bash
   git clone <repo-skills>/det-indexer ~/.claude/skills/det-indexer
   ```

2. Instale as dependências Python:

   ```bash
   pip install python-docx pyyaml
   ```

3. Configure os caminhos no `CLAUDE.md` do projeto:

   ```yaml
   dets_path: C:/Caminho/Para/DETs
   git_repo_path: C:/Caminho/Para/Repo
   os_number_pattern: '\b\d{5,6}\b'
   ```

## Validação

Liste as OSs reconhecidas na pasta configurada:

```bash
python ~/.claude/skills/det-indexer/scripts/extract_metadata.py --list
```

Saída esperada: uma linha por DET encontrado, no formato `OS XXXXXX | vN | título`.

Se nenhuma linha aparecer, verifique:

- [ ] O caminho `dets_path` está correto e acessível
- [ ] Os arquivos `.docx` seguem o template LG (cabeçalho com tabela "Código | Implementação")
- [ ] O `os_number_pattern` casa com o formato do seu domínio

## Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| `ModuleNotFoundError: docx` | Pacote não instalado | `pip install python-docx` |
| 0 DETs encontrados | Caminho errado ou template fora do padrão | Conferir `dets_path` e abrir um DET manualmente |
| OS aparece como `null` | Tabela "Código" ausente no documento | Adicionar tabela ou linkar manualmente depois |
| Encoding estranho no título | Arquivo `.docx` com legacy charset | Reabrir e salvar no Word atual |

## Atualização

Para atualizar a skill para uma versão mais recente:

```bash
cd ~/.claude/skills/det-indexer
git pull
pip install -r requirements.txt --upgrade
```

## Desinstalação

```bash
rm -rf ~/.claude/skills/det-indexer
```

A remoção é segura — o cache de chunks fica em `persistence` (banco) e pode ser limpo separadamente se necessário.
