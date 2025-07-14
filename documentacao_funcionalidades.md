# Documentação do Simulador Financeiro de Lotes

## Estrutura do Projeto

O simulador financeiro está estruturado como uma aplicação React com TypeScript, utilizando componentes UI personalizados e uma lógica de cálculo financeiro robusta.

### Diretórios Principais:
- `/src/components`: Componentes React reutilizáveis
- `/src/logic`: Lógica de cálculo financeiro
- `/src/pages`: Páginas da aplicação (incluindo a página da Campanha 50%)
- `/src/context`: Contextos React para gerenciamento de estado
- `/src/utils`: Funções utilitárias
- `/src/types`: Definições de tipos TypeScript
- `/src/services`: Serviços para comunicação externa

## Funcionalidades Principais

### 1. Interface de Entrada de Dados
- **Configurações de Moeda**: Permite selecionar a moeda para visualização (BRL, USD, EUR, GBP, CAD, AUD, CHF)
- **Dados do Cliente**: Tipo de cliente (CCB/Venda Direta), Setor, Quadra, Lote, Tamanho e Valor do Lote
- **Taxas**: Configuração de taxas de conservação, SLIM, melhoramentos, transporte e outras taxas
- **Opções de Financiamento**: Entrada (valor e percentual), número de parcelas e taxa de juros mensal

### 2. Cálculos Financeiros
- Cálculo automático de valores financiados
- Cálculo de parcelas usando fórmula PMT
- Atualização dinâmica de valores ao alterar entradas
- Conversão de moedas com taxas atualizadas

### 3. Visualização de Resultados
- **Resultado da Simulação**: Exibe detalhes das opções de financiamento
- **Opção 1 (Pick Money/Momentum)**: Detalhes do financiamento principal
- **Opção 2 (Momentum)**: Detalhes da opção alternativa (para Venda Direta)
- **Taxas Mensais**: Resumo das taxas mensais aplicáveis

### 4. Campanhas Promocionais
- **Campanha de Pontualidade Premiada**: Desconto de 5% para pagamentos em dia
- **Campanha de 50%**: Pagamento de apenas metade das parcelas após o período de construção
- **Campanha Casa Pronta, Lote Quitado**: Opção adicional de financiamento

### 5. Visualização para Impressão
- **Versão Computador**: Layout otimizado para impressão em desktop
- **Versão Celular**: Layout otimizado para visualização e impressão em dispositivos móveis

## Elementos Visuais e Estilos

### 1. Layout Geral
- Design responsivo com container centralizado
- Uso de cards para agrupar seções relacionadas
- Tipografia hierárquica com títulos e subtítulos bem definidos
- Espaçamento consistente entre elementos

### 2. Componentes UI
- **Cards**: Contêineres com cabeçalho e conteúdo para agrupar informações
- **Inputs**: Campos de entrada formatados para valores monetários e percentuais
- **Selects**: Menus dropdown para seleção de opções
- **Buttons**: Botões de ação com estados hover e focus
- **Checkboxes**: Para seleção de opções binárias

### 3. Esquema de Cores
- Cores primárias para elementos de destaque
- Cores de fundo neutras para melhor legibilidade
- Cores de alerta para indicações específicas (ex: Quadra Laerte em vermelho)

### 4. Comportamentos Interativos
- Atualização dinâmica de valores ao alterar entradas
- Expansão/colapso de seções de campanhas
- Navegação entre diferentes visualizações
- Rolagem suave para seções de resultados

## Fluxos de Navegação

### 1. Fluxo Principal
1. Usuário preenche dados do cliente, taxas e opções de financiamento
2. Clica em "Gerar Prévia" para visualizar resultados
3. Resultados são exibidos na mesma página, abaixo do formulário
4. Usuário pode expandir seções de campanhas para ver detalhes adicionais

### 2. Fluxo de Impressão
1. Após gerar prévia, usuário pode clicar em "Versão Computador" ou "Versão Celular"
2. Sistema exibe uma visualização otimizada para impressão
3. Usuário pode voltar para a simulação através do botão "Voltar"

### 3. Fluxo da Campanha 50%
1. Após gerar prévia, usuário pode clicar no botão da Campanha 50%
2. Sistema navega para uma página dedicada com detalhes da campanha
3. Dados da simulação são preservados via sessionStorage

## Validações e Tratamento de Erros

- Validação de campos obrigatórios
- Formatação automática de valores monetários e percentuais
- Tratamento de valores indefinidos ou inválidos
- Feedback visual para campos com erro

## Integrações Externas

- Busca de taxas de câmbio via API externa
- Carregamento de configurações de taxas via arquivo JSON
- Integração com Google Sheets para armazenamento de dados

## Requisitos de Melhoria

1. **Taxas de juros específicas**: Implementar opções de 0,00%, 0,33%, 0,29%, 0,25%, 0,21%, 0,17%
2. **Campo de parcelamento digitável**: Permitir entrada manual do número de parcelas
3. **Textos dos botões atualizados**: Atualizar textos conforme solicitado
4. **Posicionamento da Campanha 50%**: Posicionar após a Campanha de Pontualidade
