# TV Barão Mobile

Aplicativo React Native com Expo. A primeira etapa abre diretamente na tela **Controle da TV**, com uma prévia do aviso em exibição e comandos para navegar, pausar, retomar e fixar o aviso.

## Preparar e iniciar

Requer Node.js 22.13 ou superior e npm. O ambiente foi preparado com Node.js 24.13.1 e npm 11.8.0.

Na pasta do projeto, instale as dependências e inicie o Expo:

```powershell
npm.cmd ci
npm.cmd start
```

Para abrir a versão web:

```powershell
npm.cmd run web
```

No PowerShell, `npm.cmd` e `npx.cmd` evitam problemas com políticas de execução dos scripts `.ps1`. Para testar no celular, use uma versão do Expo Go compatível com o SDK do projeto e mantenha o celular e o computador na mesma rede.

## Integração com a TV e o banco original

O app consulta diretamente todos os avisos e o letreiro da tabela original `avisos` no Supabase e percorre os avisos usando a duração cadastrada em cada um. Ele atualiza a lista quando o banco muda e também faz uma conferência periódica. Quando a TV está conectada ao canal Realtime `canal-tv-barao`, a prévia acompanha exatamente o aviso que está no ar. Esta integração não exige alterações no esquema do banco nem um servidor em `localhost` para carregar a prévia.

Para mostrar o estado exato da rotação e habilitar os comandos na TV física, publique também a versão atualizada da aplicação web em `projeto-tv-barao-main`. Ela anuncia o aviso ativo via Presence e recebe os comandos remotos pelo Supabase.

Detalhes dos campos e do protocolo estão em [INTEGRACAO_MOBILE.md](INTEGRACAO_MOBILE.md).

## Verificar a instalação

```powershell
npx.cmd expo install --check
npx.cmd expo-doctor
npx.cmd expo export --platform all
```

A exportação verifica os bundles JavaScript e assets para Android, iOS e web; não gera APK ou IPA. A compilação nativa de iOS requer macOS e Xcode. Para emular Android, configure o Android Studio e seu SDK.
