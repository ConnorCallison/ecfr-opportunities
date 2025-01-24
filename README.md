# eCFR Opportunities

This project aims to download the entire electronic Code of Federal Regulations (eCFR), parse it into Markdown format, pass it to OpenAI embeddings, and then build a web application where users can ask natural language questions about the regulations. Additionally, we will develop a node job to evaluate various subsections of the eCFR, generating complexity and cost scores to help identify potential areas of efficiency improvement in the government.

## Project Status

✅ **eCFR XML Downloader**: Operational

- Downloads all 50 titles of the eCFR in XML format
- Stores files in `libs/ecfr-xml/src/results/xml-data`
- Provides detailed success/failure reporting

✅ **eCFR Chapter Splitter**: Operational

- Extracts individual chapters from each title
- Stores chapters as JSON files in `libs/ecfr-split/src/results/chapters`
- Recursively finds all chapters regardless of nesting level

✅ **Markdown Converter**: Operational

- Converts chapter JSON files to readable markdown format
- Maintains proper document structure and formatting
- Handles complex elements like citations, authorities, and nested content
- Stores markdown files in `libs/ecfr-markdown/src/results/markdown`

🔲 **OpenAI Embeddings**: Not Started
🔲 **Web Application**: Not Started
🔲 **Complexity Analysis**: Not Started

## Project Plan

1. **Download eCFR**:
   - A Node.js job will be set up to download the latest version of the entire eCFR in XML format from the official source.
2. **Parse eCFR to Markdown**:

   - The downloaded XML will be parsed and converted into Markdown format for easier processing and interaction within the web app.

3. **OpenAI Embeddings**:

   - After parsing, the content will be passed through OpenAI embeddings, transforming it into a format that can be queried via natural language.

4. **Build Web Application**:
   - A web app will be created where users can ask natural language questions about the eCFR, and receive relevant answers sourced directly from the regulations.
5. **Complexity and Cost Analysis**:

   - A separate Node.js job will analyze each subsection of the eCFR by prompting an LLM to evaluate:
     - Complexity Score
     - Direct Cost to Businesses
     - Market Impact
     - Administrative Costs
   - These scores will be stored and used to generate insights into which areas of the regulations may present opportunities for greater efficiency through automation or elimination.

6. **Dashboard**:
   - A dynamic dashboard will be integrated into the web app to display these analysis scores. Users will be able to sort and filter the results to identify the most promising areas for efficiency improvements.

## Getting Started with Nx

This repo uses Nx to manage our project structure, which includes both backend and frontend components.

### Install Dependencies

Make sure you have Nx installed globally:

```bash
npm install -g nx
```

Then, install the dependencies for the repo:

```bash
npm install
```

### Processing the eCFR

To process the eCFR, run these commands in sequence:

1. Download all titles:

```bash
nx download ecfr-xml
```

2. Split titles into chapters:

```bash
nx split ecfr-split
```

3. Convert chapters to markdown:

```bash
nx markdown ecfr-markdown
```

This will:

- Download all 50 titles of the eCFR
- Split each title into its constituent chapters
- Convert chapters into well-formatted markdown documents
- Save files at each stage of processing
- Provide detailed summaries of each operation

### Running the Application

To run the project locally:

```bash
nx serve
```

### Running the Node Jobs

You can run the eCFR download and parsing jobs using:

```bash
nx run [job-name]
```

### Building and Testing

You can build and test individual parts of the app using Nx commands:

```bash
nx build [app-name]
nx test [app-name]
```

For more details on how to use Nx in this project, refer to the Nx documentation.

## Contributing

If you'd like to contribute to this project, feel free to fork the repository, submit a pull request, or create an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
