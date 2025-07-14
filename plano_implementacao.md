# Plano de Implementação das Melhorias no Simulador Financeiro

## Visão Geral
Este documento detalha o plano para implementar as melhorias solicitadas no simulador financeiro, garantindo que todas as funcionalidades existentes e o visual sejam preservados.

## Melhorias Solicitadas
1. **Taxas de juros específicas**: Implementar opções de 0,00%, 0,33%, 0,29%, 0,25%, 0,21%, 0,17%
2. **Campo de parcelamento digitável**: Permitir entrada manual do número de parcelas
3. **Textos dos botões atualizados**: Atualizar textos conforme solicitado
4. **Posicionamento da Campanha 50%**: Posicionar após a Campanha de Pontualidade

## Abordagem de Implementação

### 1. Taxas de Juros Específicas
- **Arquivo a modificar**: `/src/logic/calculationLogic.ts`
- **Alterações**:
  - Atualizar a constante `taxasDeJurosMensalOpcoes` para incluir apenas as taxas específicas solicitadas
  - Garantir que os valores padrão e seleções iniciais sejam compatíveis com as novas opções
  - Verificar e ajustar qualquer referência a taxas de juros em outros componentes

### 2. Campo de Parcelamento Digitável
- **Arquivos a modificar**: 
  - `/src/App.tsx`
  - Possivelmente criar um novo componente `/src/components/NumberInput.tsx`
- **Alterações**:
  - Substituir o componente Select para parcelas por um campo de entrada numérica
  - Implementar validações para garantir valores mínimos e máximos adequados
  - Manter a funcionalidade de atualização dinâmica ao alterar o número de parcelas

### 3. Textos dos Botões Atualizados
- **Arquivos a modificar**:
  - `/src/App.tsx`
  - `/src/components/ResultadoCliente.tsx`
  - `/src/components/ResultadoClienteMobile.tsx`
- **Alterações**:
  - Atualizar os textos dos botões conforme solicitado
  - Garantir que os estilos e comportamentos dos botões sejam mantidos

### 4. Posicionamento da Campanha 50%
- **Arquivos a modificar**:
  - `/src/App.tsx`
  - `/src/components/ResultadoCliente.tsx`
  - `/src/components/ResultadoClienteMobile.tsx`
- **Alterações**:
  - Reordenar as seções de campanha para que a Campanha 50% apareça após a Campanha de Pontualidade
  - Garantir que os estilos e comportamentos de expansão/colapso sejam mantidos

## Estratégia de Implementação

### Fase 1: Preparação
- Criar branches de desenvolvimento para cada melhoria
- Configurar ambiente de teste local

### Fase 2: Implementação Incremental
- Implementar cada melhoria separadamente
- Testar cada implementação isoladamente
- Documentar as alterações realizadas

### Fase 3: Integração e Testes
- Integrar todas as melhorias
- Realizar testes de regressão para garantir que nenhuma funcionalidade existente foi afetada
- Validar o visual e comportamento em diferentes dispositivos

### Fase 4: Build e Deploy
- Realizar o build da aplicação
- Validar o build em ambiente local
- Realizar o deploy para o ambiente de produção
- Verificar a aplicação no ambiente de produção

## Riscos e Mitigações

### Riscos
1. **Perda de funcionalidades existentes**: Alterações podem afetar funcionalidades não relacionadas
2. **Degradação visual**: Modificações podem impactar o layout e estilos
3. **Problemas de compatibilidade**: Novas implementações podem não ser compatíveis com o código existente

### Mitigações
1. **Testes de regressão**: Validar todas as funcionalidades após cada alteração
2. **Comparação visual**: Comparar screenshots antes e depois das alterações
3. **Implementação incremental**: Realizar alterações pequenas e controladas
4. **Documentação detalhada**: Manter registro de todas as alterações realizadas

## Critérios de Aceitação

1. Todas as melhorias solicitadas estão implementadas corretamente
2. Todas as funcionalidades existentes continuam funcionando como antes
3. O visual e layout da aplicação são mantidos
4. A aplicação funciona corretamente em diferentes dispositivos
5. O build e deploy são realizados com sucesso
