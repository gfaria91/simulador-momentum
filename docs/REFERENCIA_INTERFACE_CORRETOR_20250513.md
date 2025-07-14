# Referência da Interface do Corretor - Simulador Financeiro

Data da Referência: 13 de Maio de 2025

## Link da Versão de Referência

A versão considerada estável e ideal da interface do corretor para o simulador financeiro pode ser acessada no seguinte link:
[https://zzltticq.manus.space](https://zzltticq.manus.space)

## Estado da Aplicação nesta Referência

Nesta data, a aplicação inclui as seguintes funcionalidades e correções principais na interface de preenchimento do corretor:

1.  **Layout Geral:**
    *   Ordem correta das seções: Configurações de Moeda, Dados Iniciais do Lote, Taxas, Opção 1 de Financiamento, Opção 2 de Financiamento.
2.  **Campos de Entrada e Dropdowns:**
    *   **Moeda para Visualização:** Dropdown com opções de moedas (BRL, USD, EUR, etc.) com nome completo e sigla.
    *   **Tipo de Cliente:** Dropdown limitado a "CCB" e "Venda Direta".
    *   **Setor:** Dropdown limitado a "Marina" e "Iate".
    *   **Quadra:**
        *   Entrada limitada a 2 caracteres.
        *   Conversão automática para letras maiúsculas.
        *   Alerta "(Quadra Laerte)" em vermelho se a segunda letra for A, C, E, G, I, K, M, O, Q, S, U, W, ou Y.
        *   Alerta "(Quadra Danilo)" em azul para outras segundas letras (quando o campo tem 2 caracteres).
        *   Nenhum alerta se menos de 2 caracteres.
    *   **Valor do Lote e Outros Campos Monetários:** Formatação dinâmica de moeda (ex: R$ 1.234,56) durante a digitação.
    *   **Entrada (Opção 2):** Percentual padrão de entrada ajustado para 1.5%.
3.  **Títulos das Opções de Financiamento:**
    *   Se Tipo de Cliente = "CCB", Opção 1 é "PICK MONEY".
    *   Se Tipo de Cliente = "Venda Direta", Opção 1 é "MOMENTUM (Opção 1)".
    *   Opção 2 é sempre "MOMENTUM (Opção 2)".
4.  **Funcionalidades de Cálculo e Exibição:**
    *   Cálculos de simulação funcionando conforme as regras de negócio estabelecidas.
    *   Geração da "Versão para Cliente / Imprimir" com conversão de moeda, se aplicável.

## Arquivo de Backup

Um backup completo do código-fonte do projeto (excluindo a pasta `node_modules`) foi realizado nesta data e está armazenado em `/home/ubuntu/simulador_financeiro_backup_20250513_053230.zip` (o timestamp no nome do arquivo pode variar ligeiramente).

Este documento serve como ponto de restauração e referência para o estado atual da interface do corretor, conforme validado pelo usuário.
