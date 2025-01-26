# LLM Chapter Analyzer

This library analyzes eCFR chapters using OpenAI's GPT-4 to generate complexity and impact scores.

## Usage

Run the analyzer with:

```bash
# Analyze all titles
nx run llm-chapter-analyzer:analyze

# Analyze specific titles
nx run llm-chapter-analyzer:analyze --titles=38,42
```

For large chapters, the analyzer will automatically:

1. Split the content into manageable chunks
2. Generate summaries of each chunk
3. Combine summaries for analysis
4. Flag in the database that a summary was used

## Configuration

- `titles`: Optional array of title numbers to analyze (e.g., [38, 42])
- If no titles are specified, all titles will be analyzed
